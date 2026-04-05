import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SignalStatus } from "../backend.d";
import { SignalCard } from "../components/SignalCard";
import {
  useActiveSignals,
  useAutoSeedSignals,
  useExpiredSignals,
  usePlatformMetrics,
  useTriggeredSignals,
} from "../hooks/useQueries";

const ALL_STRATEGIES = [
  "All",
  "ChartPattern",
  "SMC",
  "ICT",
  "CBT",
  "NewsSentiment",
  "TechnicalIndicators",
  "OptionsData",
];

interface FilterState {
  asset: string;
  timeframe: string;
  strategy: string;
  confidence: string;
}

const INITIAL_FILTERS: FilterState = {
  asset: "All",
  timeframe: "All",
  strategy: "All",
  confidence: "All",
};

export function DashboardPage() {
  const {
    data: activeSignals = [],
    isLoading: loadingActive,
    refetch,
    updateStatusMutation,
  } = useActiveSignals();
  const { data: triggeredSignals = [], isLoading: loadingTriggered } =
    useTriggeredSignals();
  const { data: expiredSignals = [], isLoading: loadingExpired } =
    useExpiredSignals();
  const { data: metrics } = usePlatformMetrics();
  const seeded = useAutoSeedSignals();

  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTERS);

  const symbols = useMemo(() => {
    const all = new Set<string>(activeSignals.map((s) => s.symbol));
    return ["All", ...Array.from(all)];
  }, [activeSignals]);

  const filteredActive = useMemo(() => {
    return activeSignals.filter((s) => {
      if (filterState.asset !== "All" && s.symbol !== filterState.asset)
        return false;
      if (
        filterState.timeframe !== "All" &&
        s.tradeType !== filterState.timeframe.toLowerCase()
      )
        return false;
      if (
        filterState.strategy !== "All" &&
        !s.strategiesConfirmed.includes(filterState.strategy)
      )
        return false;
      if (filterState.confidence !== "All") {
        const score = Number(s.confidenceScore);
        if (filterState.confidence === "90+" && score < 90) return false;
        if (filterState.confidence === "80+" && score < 80) return false;
        if (filterState.confidence === "70+" && score < 70) return false;
      }
      return true;
    });
  }, [activeSignals, filterState]);

  const handleDismiss = async (signalId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({
        signalId,
        status: SignalStatus.cancelled,
      });
      toast.success("Signal dismissed");
    } catch {
      toast.error("Failed to dismiss");
    }
  };

  const handleExecute = async (signalId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({
        signalId,
        status: SignalStatus.triggered,
      });
      toast.success("Trade executed!");
    } catch {
      toast.error("Failed to execute");
    }
  };

  const isLoading = loadingActive || !seeded;

  return (
    <div className="flex flex-col gap-0 h-full">
      <Tabs defaultValue="live" className="flex flex-col flex-1 min-h-0">
        {/* Tabs header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-0 border-b border-border flex-shrink-0">
          <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none">
            <TabsTrigger
              value="live"
              data-ocid="signals.live.tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-4 pb-3 text-xs uppercase tracking-wider font-semibold"
            >
              Live Signals
              <span className="ml-2 text-xs bg-primary/15 text-primary rounded px-1.5">
                {activeSignals.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              data-ocid="signals.active.tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-4 pb-3 text-xs uppercase tracking-wider font-semibold"
            >
              Active Trades
              <span className="ml-2 text-xs bg-muted/50 text-muted-foreground rounded px-1.5">
                {triggeredSignals.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              data-ocid="signals.history.tab"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground px-4 pb-3 text-xs uppercase tracking-wider font-semibold"
            >
              Signal History
              <span className="ml-2 text-xs bg-muted/50 text-muted-foreground rounded px-1.5">
                {expiredSignals.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            data-ocid="signals.refresh.button"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>

        <TabsContent
          value="live"
          className="flex-1 flex flex-col mt-0 overflow-auto"
        >
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <Select
              value={filterState.asset}
              onValueChange={(v) => setFilterState((p) => ({ ...p, asset: v }))}
            >
              <SelectTrigger
                data-ocid="signals.asset.select"
                className="h-7 text-xs w-32 bg-card"
              >
                <SelectValue placeholder="Asset" />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterState.timeframe}
              onValueChange={(v) =>
                setFilterState((p) => ({ ...p, timeframe: v }))
              }
            >
              <SelectTrigger
                data-ocid="signals.timeframe.select"
                className="h-7 text-xs w-32 bg-card"
              >
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Timeframes</SelectItem>
                <SelectItem value="Intraday">Intraday</SelectItem>
                <SelectItem value="Swing">Swing</SelectItem>
                <SelectItem value="Scalping">Scalping</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterState.strategy}
              onValueChange={(v) =>
                setFilterState((p) => ({ ...p, strategy: v }))
              }
            >
              <SelectTrigger
                data-ocid="signals.strategy.select"
                className="h-7 text-xs w-40 bg-card"
              >
                <SelectValue placeholder="Strategy" />
              </SelectTrigger>
              <SelectContent>
                {ALL_STRATEGIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterState.confidence}
              onValueChange={(v) =>
                setFilterState((p) => ({ ...p, confidence: v }))
              }
            >
              <SelectTrigger
                data-ocid="signals.confidence.select"
                className="h-7 text-xs w-32 bg-card"
              >
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="90+">&ge;90%</SelectItem>
                <SelectItem value="80+">&ge;80%</SelectItem>
                <SelectItem value="70+">&ge;70%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Signal Grid */}
          <div className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => (
                  <div
                    key={k}
                    className="rounded-xl border border-border bg-card p-4 space-y-3"
                    data-ocid="signals.loading_state"
                  >
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-2/4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredActive.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 gap-3"
                data-ocid="signals.empty_state"
              >
                <AlertTriangle className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No signals match your filters
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterState(INITIAL_FILTERS)}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActive.map((signal, i) => (
                  <SignalCard
                    key={`${signal.symbol}-${i}`}
                    signal={signal}
                    index={i}
                    onExecute={() => handleExecute(BigInt(i))}
                    onDismiss={() => handleDismiss(BigInt(i))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Performance band */}
          <PerformanceBand
            metrics={metrics}
            activeCount={activeSignals.length}
          />
        </TabsContent>

        <TabsContent value="active" className="flex-1 overflow-auto p-6 mt-0">
          {loadingTriggered ? (
            <div className="space-y-3" data-ocid="trades.loading_state">
              {["t1", "t2", "t3"].map((k) => (
                <Skeleton key={k} className="h-16 w-full" />
              ))}
            </div>
          ) : triggeredSignals.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
              data-ocid="trades.empty_state"
            >
              <Activity className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">No active trades yet</p>
              <p className="text-xs text-muted-foreground">
                Execute signals from Live Signals tab to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {triggeredSignals.map((s, i) => (
                <SignalCard
                  key={`${s.symbol}-${s.tradeType}-${i}`}
                  signal={s}
                  index={i}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-6 mt-0">
          {loadingExpired ? (
            <div className="space-y-3" data-ocid="history.loading_state">
              {["h1", "h2", "h3"].map((k) => (
                <Skeleton key={k} className="h-16 w-full" />
              ))}
            </div>
          ) : expiredSignals.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
              data-ocid="history.empty_state"
            >
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">No signal history yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {expiredSignals.map((s, i) => (
                <SignalCard
                  key={`${s.symbol}-${s.signalType}-${i}`}
                  signal={s}
                  index={i}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerformanceBand({
  metrics,
  activeCount,
}: {
  metrics:
    | {
        overallWinRate: string;
        totalSignals: bigint;
        accuracy: string;
        winningSignals: bigint;
        losingSignals: bigint;
      }
    | null
    | undefined;
  activeCount: number;
}) {
  return (
    <div className="border-t border-border bg-card/50 px-6 py-3 flex items-center gap-6 flex-wrap flex-shrink-0">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        Signal Performance
      </p>
      <MetricBadge
        label="Active Signals"
        value={activeCount.toString()}
        color="text-primary"
      />
      <MetricBadge
        label="Win Rate"
        value={metrics ? `${metrics.overallWinRate}%` : "—"}
        color="text-buy"
      />
      <MetricBadge
        label="Total Signals"
        value={metrics ? metrics.totalSignals.toString() : "—"}
        color="text-foreground"
      />
      <MetricBadge
        label="Accuracy"
        value={metrics ? `${metrics.accuracy}%` : "—"}
        color="text-primary"
      />
      <MetricBadge
        label="Winning"
        value={metrics ? metrics.winningSignals.toString() : "—"}
        color="text-buy"
      />
      <MetricBadge
        label="Losing"
        value={metrics ? metrics.losingSignals.toString() : "—"}
        color="text-sell"
      />
    </div>
  );
}

function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className={cn("text-xs font-bold font-mono-data", color)}>
        {value}
      </span>
    </div>
  );
}
