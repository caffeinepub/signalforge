import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AlertPreference,
  type PlatformMetric,
  type RiskSettings,
  SignalStatus,
  type TradeSignal,
  type UserProfile,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import { generateDemoSignals } from "../lib/signals";

export function useActiveSignals() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<TradeSignal[]>({
    queryKey: ["signals", "active"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSignalsByStatus(SignalStatus.active);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (
      signal: Omit<TradeSignal, "createdBy" | "timestamp">,
    ) => {
      if (!actor) throw new Error("Actor not ready");
      const fakeTimestamp = BigInt(Date.now() * 1_000_000);
      const fakePrincipal = {
        _isPrincipal: true,
        toText: () => "aaaaa-aa",
      } as unknown as Principal;
      return actor.createTradeSignal({
        ...signal,
        createdBy: fakePrincipal,
        timestamp: fakeTimestamp,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
    onError: () => toast.error("Failed to create signal"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      signalId,
      status,
    }: { signalId: bigint; status: SignalStatus }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateSignalStatus(signalId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
    onError: () => toast.error("Failed to update signal"),
  });

  const seedSignals = useCallback(async () => {
    if (!actor) return;
    const demos = generateDemoSignals();
    await Promise.all(demos.map((s) => createMutation.mutateAsync(s)));
  }, [actor, createMutation]);

  return { ...query, createMutation, updateStatusMutation, seedSignals };
}

export function useTriggeredSignals() {
  const { actor, isFetching } = useActor();
  return useQuery<TradeSignal[]>({
    queryKey: ["signals", "triggered"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSignalsByStatus(SignalStatus.triggered);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpiredSignals() {
  const { actor, isFetching } = useActor();
  return useQuery<TradeSignal[]>({
    queryKey: ["signals", "expired"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSignalsByStatus(SignalStatus.expired);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlatformMetrics() {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformMetric | null>({
    queryKey: ["metrics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPlatformMetrics();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSystemStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    totalUsers: bigint;
    totalSignals: bigint;
    activeSignals: bigint;
  } | null>({
    queryKey: ["systemStats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getSystemStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRiskSettings() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<RiskSettings | null>({
    queryKey: ["riskSettings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getRiskSettings();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const mutation = useMutation({
    mutationFn: async (settings: RiskSettings) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setRiskSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskSettings"] });
      toast.success("Risk settings saved");
    },
    onError: () => toast.error("Failed to save risk settings"),
  });

  return { ...query, mutation };
}

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<string[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWatchlist();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const addMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addToWatchlist(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Added to watchlist");
    },
    onError: () => toast.error("Failed to add symbol"),
  });

  const removeMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeFromWatchlistProcess(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
    onError: () => toast.error("Failed to remove symbol"),
  });

  return { ...query, addMutation, removeMutation };
}

export function useAlertPreference() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<AlertPreference | null>({
    queryKey: ["alertPreference"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAlertPreference();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const mutation = useMutation({
    mutationFn: async (pref: AlertPreference) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setAlertPreference(pref);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertPreference"] });
      toast.success("Alert preferences saved");
    },
    onError: () => toast.error("Failed to save alert preferences"),
  });

  return { ...query, mutation };
}

export function useStrategyWeights() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<Array<[string, bigint]>>({
    queryKey: ["strategyWeights"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStrategyWeights();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const setWeight = useMutation({
    mutationFn: async ({ name, weight }: { name: string; weight: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setStrategyWeight(name, weight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategyWeights"] });
      toast.success("Strategy weight updated");
    },
    onError: () => toast.error("Failed to update weight"),
  });

  return { ...query, setWeight };
}

export function useSignalThresholds() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<Array<[string, bigint]>>({
    queryKey: ["thresholds"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSignalThresholds();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const setThreshold = useMutation({
    mutationFn: async ({ name, value }: { name: string; value: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setSignalThreshold(name, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thresholds"] });
      toast.success("Threshold updated");
    },
    onError: () => toast.error("Failed to update threshold"),
  });

  return { ...query, setThreshold };
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  return { ...query, saveMutation };
}

export function useOverallPerformance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["performance"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOverallPerformance();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAutoSeedSignals() {
  const { actor, isFetching } = useActor();
  const { data: signals, isLoading } = useActiveSignals();
  const queryClient = useQueryClient();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!actor || isFetching || isLoading || seeded) return;
    if (signals && signals.length === 0) {
      const seed = async () => {
        const demos = generateDemoSignals();
        const fakeTimestamp = BigInt(Date.now() * 1_000_000);
        const fakePrincipal = {
          _isPrincipal: true,
          toText: () => "aaaaa-aa",
        } as unknown as Principal;
        await Promise.all(
          demos.map((s) =>
            actor
              .createTradeSignal({
                ...s,
                createdBy: fakePrincipal,
                timestamp: fakeTimestamp,
              })
              .catch(() => null),
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["signals"] });
        setSeeded(true);
      };
      seed();
    } else {
      setSeeded(true);
    }
  }, [actor, isFetching, isLoading, signals, seeded, queryClient]);

  return seeded;
}
