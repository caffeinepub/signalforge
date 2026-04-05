import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
}

const BASE_TICKERS: TickerItem[] = [
  { symbol: "NIFTY 50", price: "22,347.50", change: "+0.74%", positive: true },
  {
    symbol: "BANKNIFTY",
    price: "47,892.00",
    change: "-0.32%",
    positive: false,
  },
  { symbol: "SENSEX", price: "73,542.30", change: "+0.61%", positive: true },
  { symbol: "INDIA VIX", price: "13.45", change: "+2.18%", positive: false },
  { symbol: "USDINR", price: "83.42", change: "-0.05%", positive: true },
  { symbol: "RELIANCE", price: "2,918.45", change: "+1.12%", positive: true },
  { symbol: "HDFCBANK", price: "1,683.20", change: "-0.45%", positive: false },
  { symbol: "TCS", price: "3,812.75", change: "+0.89%", positive: true },
  { symbol: "INFY", price: "1,547.90", change: "+0.22%", positive: true },
  { symbol: "SBIN", price: "812.60", change: "-0.71%", positive: false },
  { symbol: "WIPRO", price: "487.30", change: "+0.38%", positive: true },
  { symbol: "GOLD", price: "71,240.00", change: "+0.15%", positive: true },
];

export function TickerBar() {
  const [tickers, setTickers] = useState(BASE_TICKERS);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          const delta = (Math.random() - 0.48) * 0.1;
          const pctNum = Number.parseFloat(t.change.replace("%", ""));
          const newPct = (pctNum + delta).toFixed(2);
          const positive = Number.parseFloat(newPct) >= 0;
          return {
            ...t,
            change: `${positive ? "+" : ""}${newPct}%`,
            positive,
          };
        }),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickers, ...tickers];

  return (
    <div className="h-10 border-b border-border bg-card/50 flex items-center overflow-hidden flex-shrink-0">
      <div className="ticker-scroll flex items-center gap-0 whitespace-nowrap">
        {doubled.map((item, idx) => (
          <div
            key={`${item.symbol}-${idx}`}
            className="flex items-center gap-2 px-4 border-r border-border/50 h-10"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.symbol}
            </span>
            <span className="text-xs font-mono-data font-medium text-foreground">
              {item.price}
            </span>
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                item.positive ? "text-buy" : "text-sell",
              )}
            >
              {item.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
