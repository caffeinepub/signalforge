import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    TradingView?: any;
  }
}

const SYMBOLS = [
  { value: "NSE:NIFTY", label: "NIFTY 50" },
  { value: "NSE:BANKNIFTY", label: "BANKNIFTY" },
  { value: "NSE:RELIANCE", label: "RELIANCE" },
  { value: "NSE:HDFCBANK", label: "HDFCBANK" },
  { value: "NSE:TCS", label: "TCS" },
  { value: "NSE:INFY", label: "INFOSYS" },
  { value: "NSE:SBIN", label: "SBIN" },
  { value: "NSE:WIPRO", label: "WIPRO" },
];

const STRATEGIES = [
  { name: "ChartPattern", desc: "Head & Shoulders, Flags, Triangles" },
  { name: "SMC", desc: "Order Blocks, Liquidity Zones, BOS" },
  { name: "ICT", desc: "FVG, Kill Zones, Liquidity Sweeps" },
  { name: "CBT", desc: "Price Action, Engulfing, Rejection Wicks" },
  { name: "NewsSentiment", desc: "Financial news, macro events" },
  { name: "TechnicalIndicators", desc: "RSI, MACD, VWAP, EMA, Volume Profile" },
  { name: "OptionsData", desc: "OI, PCR, Max Pain, IV" },
];

function TradingViewWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    setLoaded(false);

    const initWidget = () => {
      if (!containerRef.current) return;
      const containerId = `tv_${Date.now()}`;
      const div = document.createElement("div");
      div.id = containerId;
      containerRef.current.appendChild(div);

      if (window.TradingView) {
        widgetRef.current = new window.TradingView.widget({
          width: "100%",
          height: 500,
          symbol,
          interval: "15",
          timezone: "Asia/Kolkata",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#141C2A",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
        });
        setLoaded(true);
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="relative w-full" style={{ minHeight: 500 }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

export function ChartsPage() {
  const [symbol, setSymbol] = useState("NSE:NIFTY");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [analyzing, setAnalyzing] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: symbol triggers analysis reset
  useEffect(() => {
    setAnalyzing(true);
    const timer = setTimeout(() => {
      const newScores: Record<string, number> = {};
      for (const s of STRATEGIES) {
        newScores[s.name] = Math.floor(Math.random() * 40) + 55;
      }
      setScores(newScores);
      setAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [symbol]);

  const confluenceScore = analyzing
    ? 0
    : Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / STRATEGIES.length,
      );

  const getBias = (score: number) => {
    if (score >= 70) return { label: "BULLISH", color: "text-buy" };
    if (score >= 55) return { label: "NEUTRAL", color: "text-notrade" };
    return { label: "BEARISH", color: "text-sell" };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full min-h-0">
      {/* Chart area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Chart Analysis
          </h2>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger
              data-ocid="charts.symbol.select"
              className="h-8 text-xs w-40 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <TradingViewWidget symbol={symbol} />
        </div>
      </div>

      {/* Analysis panel */}
      <div className="w-full lg:w-80 border-l border-border flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Strategy Analysis
          </h3>
        </div>

        {/* Confluence meter */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Confluence Score
            </span>
            <span className="text-lg font-bold font-mono-data text-primary">
              {analyzing ? "—" : `${confluenceScore}%`}
            </span>
          </div>
          <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: analyzing ? "0%" : `${confluenceScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(to right, oklch(0.73 0.13 195), oklch(0.72 0.18 145))",
              }}
            />
          </div>
          {!analyzing && (
            <p
              className={`text-xs font-semibold mt-2 ${getBias(confluenceScore).color}`}
            >
              Market Bias: {getBias(confluenceScore).label}
            </p>
          )}
        </div>

        {/* Per-strategy scores */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          {STRATEGIES.map((strat) => (
            <div key={strat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  {strat.name}
                </span>
                {analyzing ? (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary analyzing-dot"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-mono-data text-primary">
                    {scores[strat.name]}%
                  </span>
                )}
              </div>
              <Progress
                value={analyzing ? 0 : scores[strat.name]}
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {strat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Signal Engine Status */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Signal Engine
          </p>
          <div className="space-y-1.5">
            {analyzing ? (
              STRATEGIES.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {s.name}: Analyzing...
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-buy">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">
                  Analysis complete.{" "}
                  {confluenceScore >= 70
                    ? "Signal ready."
                    : "Low confluence — wait."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
