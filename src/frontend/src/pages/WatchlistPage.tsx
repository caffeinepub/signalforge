import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useWatchlist } from "../hooks/useQueries";

const MOCK_PRICES: Record<
  string,
  { price: string; change: string; positive: boolean }
> = {
  NIFTY50: { price: "22,347.50", change: "+0.74%", positive: true },
  BANKNIFTY: { price: "47,892.00", change: "-0.32%", positive: false },
  RELIANCE: { price: "2,918.45", change: "+1.12%", positive: true },
  HDFCBANK: { price: "1,683.20", change: "-0.45%", positive: false },
  TCS: { price: "3,812.75", change: "+0.89%", positive: true },
  INFY: { price: "1,547.90", change: "+0.22%", positive: true },
  SBIN: { price: "812.60", change: "-0.71%", positive: false },
  WIPRO: { price: "487.30", change: "+0.38%", positive: true },
  SENSEX: { price: "73,542.30", change: "+0.61%", positive: true },
};

export function WatchlistPage() {
  const {
    data: watchlist = [],
    isLoading,
    addMutation,
    removeMutation,
  } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState("");

  const handleAdd = async () => {
    if (!newSymbol.trim()) return;
    await addMutation.mutateAsync(newSymbol.toUpperCase().trim());
    setNewSymbol("");
  };

  const handleRemove = async (symbol: string) => {
    await removeMutation.mutateAsync(symbol);
  };

  const defaultSymbols = [
    "NIFTY50",
    "BANKNIFTY",
    "RELIANCE",
    "HDFCBANK",
    "TCS",
    "INFY",
  ];
  const displayList = watchlist.length > 0 ? watchlist : defaultSymbols;

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Watchlist
          </h2>
        </div>
      </div>

      {/* Add Symbol */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add symbol (e.g., NIFTY50)"
          data-ocid="watchlist.input"
          className="h-9 text-sm bg-card"
        />
        <Button
          onClick={handleAdd}
          disabled={addMutation.isPending}
          data-ocid="watchlist.add_button"
          size="sm"
          className="h-9 text-xs uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>

      {/* Watchlist grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="watchlist.loading_state"
        >
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3"
          data-ocid="watchlist.empty_state"
        >
          <BookMarked className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">Your watchlist is empty</p>
          <p className="text-xs text-muted-foreground">
            Add symbols to track them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayList.map((symbol, i) => {
            const priceData = MOCK_PRICES[symbol] ?? {
              price: "—",
              change: "0.00%",
              positive: true,
            };
            return (
              <motion.div
                key={symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`watchlist.item.${i + 1}`}
                className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                      {symbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">NSE</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(symbol)}
                    data-ocid={`watchlist.delete_button.${i + 1}`}
                    className="text-muted-foreground hover:text-sell transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-mono-data text-foreground">
                    {priceData.price}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      priceData.positive ? "text-buy" : "text-sell",
                    )}
                  >
                    {priceData.positive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {priceData.change}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid={`watchlist.signal.button.${i + 1}`}
                  className="h-7 text-xs uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Zap className="w-3 h-3 mr-1" /> Generate Signal
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
