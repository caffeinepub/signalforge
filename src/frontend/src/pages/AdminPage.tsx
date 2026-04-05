import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Activity, Loader2, Settings, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  usePlatformMetrics,
  useSignalThresholds,
  useStrategyWeights,
  useSystemStats,
} from "../hooks/useQueries";

const DEFAULT_STRATEGIES = [
  "ChartPattern",
  "SMC",
  "ICT",
  "CBT",
  "NewsSentiment",
  "TechnicalIndicators",
  "OptionsData",
];

export function AdminPage() {
  const {
    data: weights = [],
    isLoading: weightsLoading,
    setWeight,
  } = useStrategyWeights();
  const {
    data: thresholds = [],
    isLoading: thresholdsLoading,
    setThreshold,
  } = useSignalThresholds();
  const { data: stats } = useSystemStats();
  const { data: metrics } = usePlatformMetrics();

  const [localWeights, setLocalWeights] = useState<Record<string, number>>({});
  const [localThresholds, setLocalThresholds] = useState<
    Record<string, string>
  >({});

  const strategiesWithWeights = DEFAULT_STRATEGIES.map((name) => {
    const found = weights.find(([n]) => n === name);
    const value = localWeights[name] ?? (found ? Number(found[1]) : 50);
    return { name, value };
  });

  const thresholdList = [
    {
      name: "minimumConfidenceScore",
      label: "Min Confidence Score",
      default: 70,
    },
    {
      name: "minimumStrategiesRequired",
      label: "Min Strategies Required",
      default: 3,
    },
    { name: "noTradeThreshold", label: "No Trade Threshold", default: 65 },
  ];

  const handleWeightChange = async (name: string, value: number) => {
    setLocalWeights((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveWeights = async () => {
    const updates = strategiesWithWeights.map((s) =>
      setWeight.mutateAsync({ name: s.name, weight: BigInt(s.value) }),
    );
    await Promise.all(updates);
    toast.success("Strategy weights saved");
  };

  const getThresholdValue = (name: string, def: number): string => {
    if (localThresholds[name] !== undefined) return localThresholds[name];
    const found = thresholds.find(([n]) => n === name);
    return found ? found[1].toString() : def.toString();
  };

  const handleSaveThresholds = async () => {
    const updates = thresholdList.map((t) => {
      const val = getThresholdValue(t.name, t.default);
      return setThreshold.mutateAsync({
        name: t.name,
        value: BigInt(Number.parseInt(val) || t.default),
      });
    });
    await Promise.all(updates);
    toast.success("Thresholds saved");
  };

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Admin Panel
        </h2>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Total Users"
          value={stats ? stats.totalUsers.toString() : "—"}
          color="text-primary"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Active Signals"
          value={stats ? stats.activeSignals.toString() : "—"}
          color="text-buy"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Signals"
          value={stats ? stats.totalSignals.toString() : "—"}
          color="text-foreground"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Win Rate"
          value={metrics ? `${metrics.overallWinRate}%` : "—"}
          color="text-buy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Weights */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Strategy Weights
            </h3>
            <Button
              size="sm"
              onClick={handleSaveWeights}
              disabled={setWeight.isPending}
              data-ocid="admin.weights.save_button"
              className="h-7 text-xs uppercase tracking-wider"
            >
              {setWeight.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Save Weights"
              )}
            </Button>
          </div>

          {weightsLoading ? (
            <div className="space-y-3" data-ocid="admin.weights.loading_state">
              {["w1", "w2", "w3", "w4", "w5", "w6", "w7"].map((k) => (
                <Skeleton key={k} className="h-10" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {strategiesWithWeights.map((strat, i) => (
                <div
                  key={strat.name}
                  data-ocid={`admin.strategy.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">
                      {strat.name}
                    </span>
                    <span className="text-xs font-bold font-mono-data text-primary">
                      {strat.value}%
                    </span>
                  </div>
                  <Slider
                    value={[strat.value]}
                    onValueChange={([v]) => handleWeightChange(strat.name, v)}
                    min={0}
                    max={100}
                    step={5}
                    data-ocid={`admin.weight.slider.${i + 1}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signal Thresholds */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Signal Thresholds
            </h3>
            <Button
              size="sm"
              onClick={handleSaveThresholds}
              disabled={setThreshold.isPending}
              data-ocid="admin.thresholds.save_button"
              className="h-7 text-xs uppercase tracking-wider"
            >
              {setThreshold.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>

          {thresholdsLoading ? (
            <div
              className="space-y-3"
              data-ocid="admin.thresholds.loading_state"
            >
              {["t1", "t2", "t3"].map((k) => (
                <Skeleton key={k} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {thresholdList.map((threshold, i) => (
                <div
                  key={threshold.name}
                  data-ocid={`admin.threshold.item.${i + 1}`}
                >
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    {threshold.label}
                  </Label>
                  <Input
                    value={getThresholdValue(threshold.name, threshold.default)}
                    onChange={(e) =>
                      setLocalThresholds((prev) => ({
                        ...prev,
                        [threshold.name]: e.target.value,
                      }))
                    }
                    data-ocid={`admin.threshold.input.${i + 1}`}
                    className="h-9 text-sm bg-background"
                    type="number"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Platform Metrics */}
          {metrics && (
            <div className="mt-6 pt-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Platform Metrics
              </h4>
              <div className="space-y-2">
                <MetricRow
                  label="Triggered Signals"
                  value={metrics.triggeredSignals.toString()}
                />
                <MetricRow
                  label="Winning Signals"
                  value={metrics.winningSignals.toString()}
                  color="text-buy"
                />
                <MetricRow
                  label="Losing Signals"
                  value={metrics.losingSignals.toString()}
                  color="text-sell"
                />
                <MetricRow
                  label="Accuracy"
                  value={`${metrics.accuracy}%`}
                  color="text-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={cn("mb-2", color)}>{icon}</div>
      <p className={cn("text-2xl font-bold font-mono-data", color)}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  color,
}: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xs font-bold font-mono-data",
          color ?? "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
