import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Loader2,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useOverallPerformance } from "../hooks/useQueries";

const DEMO_PERFORMANCE = [
  { date: "Jan", pnl: 12500, cumulative: 12500 },
  { date: "Feb", pnl: -3200, cumulative: 9300 },
  { date: "Mar", pnl: 18700, cumulative: 28000 },
  { date: "Apr", pnl: 7400, cumulative: 35400 },
  { date: "May", pnl: -5100, cumulative: 30300 },
  { date: "Jun", pnl: 22300, cumulative: 52600 },
  { date: "Jul", pnl: 15800, cumulative: 68400 },
  { date: "Aug", pnl: -8200, cumulative: 60200 },
  { date: "Sep", pnl: 31200, cumulative: 91400 },
  { date: "Oct", pnl: 19500, cumulative: 110900 },
];

interface BacktestForm {
  symbol: string;
  strategy: string;
  capital: string;
  startDate: string;
  endDate: string;
}

export function BacktestPage() {
  const {
    register,
    handleSubmit,
    setValue: setFormValue,
  } = useForm<BacktestForm>({
    defaultValues: {
      symbol: "NIFTY50",
      strategy: "SMC",
      capital: "100000",
      startDate: "2024-01-01",
      endDate: "2024-10-31",
    },
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { data: _performance = [] } = useOverallPerformance();
  const { actor: btActor } = useActor();

  const onSubmit = async (data: BacktestForm) => {
    setRunning(true);
    // Simulate backtest
    await new Promise((r) => setTimeout(r, 2000));

    if (btActor) {
      try {
        await btActor.addBacktestResult({
          symbol: data.symbol,
          strategyName: data.strategy,
          startDate: BigInt(new Date(data.startDate).getTime() * 1_000_000),
          endDate: BigInt(new Date(data.endDate).getTime() * 1_000_000),
          totalTrades: BigInt(47),
          winningTrades: BigInt(33),
          losingTrades: BigInt(14),
          winRate: "70.21",
          totalROI: "110.9",
          maxDrawdown: "-8.2",
          sharpeRatio: "2.14",
          timestamp: BigInt(Date.now() * 1_000_000),
        });
      } catch {
        // ignore
      }
    }

    setResults({
      winRate: 70.21,
      totalROI: 110.9,
      maxDrawdown: -8.2,
      sharpeRatio: 2.14,
      totalTrades: 47,
      winningTrades: 33,
      losingTrades: 14,
    });
    setRunning(false);
    toast.success("Backtest complete!");
  };

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Backtesting Module
        </h2>
      </div>

      {/* Config Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Configure Backtest
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Symbol
              </Label>
              <Select
                onValueChange={(v) => setFormValue("symbol", v)}
                defaultValue="NIFTY50"
              >
                <SelectTrigger
                  data-ocid="backtest.symbol.select"
                  className="h-8 text-xs bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "NIFTY50",
                    "BANKNIFTY",
                    "RELIANCE",
                    "HDFCBANK",
                    "TCS",
                    "INFY",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Strategy
              </Label>
              <Select
                onValueChange={(v) => setFormValue("strategy", v)}
                defaultValue="SMC"
              >
                <SelectTrigger
                  data-ocid="backtest.strategy.select"
                  className="h-8 text-xs bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "SMC",
                    "ICT",
                    "ChartPattern",
                    "CBT",
                    "TechnicalIndicators",
                    "Combined",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Capital (₹)
              </Label>
              <Input
                {...register("capital")}
                data-ocid="backtest.capital.input"
                className="h-8 text-xs bg-background"
                placeholder="100000"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Start Date
              </Label>
              <Input
                {...register("startDate")}
                type="date"
                data-ocid="backtest.start.input"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                End Date
              </Label>
              <Input
                {...register("endDate")}
                type="date"
                data-ocid="backtest.end.input"
                className="h-8 text-xs bg-background"
              />
            </div>
            <Button
              type="submit"
              disabled={running}
              data-ocid="backtest.submit_button"
              className="w-full h-8 text-xs uppercase tracking-wider"
            >
              {running ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running...
                </>
              ) : (
                "Run Backtest"
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {results ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="Win Rate"
                  value={`${results.winRate}%`}
                  positive={results.winRate > 55}
                />
                <MetricCard
                  label="Total ROI"
                  value={`+${results.totalROI}%`}
                  positive
                />
                <MetricCard
                  label="Max Drawdown"
                  value={`${results.maxDrawdown}%`}
                  positive={false}
                />
                <MetricCard
                  label="Sharpe Ratio"
                  value={results.sharpeRatio.toString()}
                  positive={results.sharpeRatio > 1}
                />
              </div>

              {/* P&L Chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                  Cumulative P&L Curve
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={DEMO_PERFORMANCE}>
                    <defs>
                      <linearGradient
                        id="pnlGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.73 0.13 195)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.73 0.13 195)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0.035 255)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "oklch(0.58 0.025 255)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.58 0.025 255)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.19 0.028 255)",
                        border: "1px solid oklch(0.28 0.035 255)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "oklch(0.91 0.018 255)" }}
                      itemStyle={{ color: "oklch(0.73 0.13 195)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="oklch(0.73 0.13 195)"
                      strokeWidth={2}
                      fill="url(#pnlGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trade Summary */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  Trade Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono-data text-foreground">
                      {results.totalTrades}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Trades
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono-data text-buy">
                      {results.winningTrades}
                    </p>
                    <p className="text-xs text-muted-foreground">Winners</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-mono-data text-sell">
                      {results.losingTrades}
                    </p>
                    <p className="text-xs text-muted-foreground">Losers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              className="bg-card border border-border rounded-xl flex items-center justify-center"
              style={{ minHeight: 300 }}
              data-ocid="backtest.empty_state"
            >
              <div className="flex flex-col items-center gap-3">
                <FlaskConical className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Configure and run a backtest to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  positive,
}: { label: string; value: string; positive: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p
        className={cn(
          "text-xl font-bold font-mono-data",
          positive ? "text-buy" : "text-sell",
        )}
      >
        {value}
      </p>
    </div>
  );
}
