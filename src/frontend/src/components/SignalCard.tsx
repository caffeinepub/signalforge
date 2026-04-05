import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronDown,
  Minus,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SignalType, type TradeSignal, TradeType } from "../backend.d";
import { STRATEGY_COLORS, getConfidenceColor } from "../lib/signals";

interface SignalCardProps {
  signal: TradeSignal;
  index: number;
  onExecute?: () => void;
  onDismiss?: () => void;
}

const TRADE_TYPE_LABELS: Record<TradeType, string> = {
  [TradeType.intraday]: "INTRADAY",
  [TradeType.swing]: "SWING",
  [TradeType.scalping]: "SCALPING",
};

export function SignalCard({
  signal,
  index,
  onExecute,
  onDismiss,
}: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const score = Number(signal.confidenceScore);
  const isNoTrade = signal.signalType === SignalType.noTrade;
  const isBuy = signal.signalType === SignalType.buy;

  const borderClass = isNoTrade
    ? "border-l-notrade"
    : isBuy
      ? "border-l-buy"
      : "border-l-sell";
  const glowClass = isNoTrade
    ? "glow-notrade"
    : isBuy
      ? "glow-buy"
      : "glow-sell";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`signals.item.${index + 1}`}
      className={cn(
        "relative rounded-xl bg-card border border-border flex flex-col overflow-hidden",
        borderClass,
        glowClass,
      )}
    >
      {/* No Trade Banner */}
      {isNoTrade && (
        <div className="flex items-center gap-2 px-4 py-2 bg-notrade/10 border-b border-border">
          <AlertTriangle className="w-3.5 h-3.5 text-notrade" />
          <span className="text-xs font-semibold text-notrade uppercase tracking-wide">
            NO TRADE ZONE
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold uppercase tracking-wider text-foreground">
              {signal.symbol}
            </span>
            <SignalBadge type={signal.signalType} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {TRADE_TYPE_LABELS[signal.tradeType]}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground uppercase">
              {signal.contractType}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "text-lg font-bold font-mono-data",
              getConfidenceColor(score),
            )}
          >
            {score}%
          </span>
          <span className="text-xs text-muted-foreground uppercase">
            Confidence
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="px-4 pb-3">
        <Progress
          value={score}
          className="h-1"
          style={{
            background: "oklch(var(--muted))",
          }}
        />
      </div>

      {/* Price Levels */}
      {!isNoTrade && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <PriceLine label="Entry" value={signal.entryPrice} highlight />
          <PriceLine label="Stop Loss" value={signal.stopLoss} danger />
          <PriceLine label="Target 1" value={signal.target1} positive />
          {signal.target2 && (
            <PriceLine label="Target 2" value={signal.target2} positive />
          )}
          {signal.target3 && (
            <PriceLine label="Target 3" value={signal.target3} positive />
          )}
          <PriceLine label="R:R" value={signal.riskRewardRatio} accent />
        </div>
      )}

      {isNoTrade && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {signal.noTradeReason}
          </p>
        </div>
      )}

      {/* Strategy Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {signal.strategiesConfirmed.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
              STRATEGY_COLORS[s] ??
                "text-muted-foreground bg-muted/30 border-border",
            )}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Reasoning expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 px-4 pb-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            expanded && "rotate-180",
          )}
        />
        {expanded ? "Hide analysis" : "View analysis"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {signal.reasoningBreakdown}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!isNoTrade && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border mt-auto">
          <Button
            size="sm"
            onClick={onExecute}
            data-ocid={`signals.execute.button.${index + 1}`}
            className="flex-1 text-xs uppercase tracking-wider font-semibold h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Zap className="w-3 h-3 mr-1" />
            Execute Trade
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            data-ocid={`signals.dismiss.button.${index + 1}`}
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground h-8 px-3"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {isNoTrade && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border mt-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            data-ocid={`signals.dismiss.button.${index + 1}`}
            className="flex-1 text-xs uppercase tracking-wider text-muted-foreground h-8"
          >
            Dismiss
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function SignalBadge({ type }: { type: SignalType }) {
  if (type === SignalType.buy)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-buy/15 text-buy border border-buy/30 text-xs font-bold uppercase">
        <TrendingUp className="w-3 h-3" /> BUY
      </span>
    );
  if (type === SignalType.sell)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sell/15 text-sell border border-sell/30 text-xs font-bold uppercase">
        <TrendingDown className="w-3 h-3" /> SELL
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-notrade/10 text-notrade border border-notrade/20 text-xs font-bold uppercase">
      <Minus className="w-3 h-3" /> NO TRADE
    </span>
  );
}

function PriceLine({
  label,
  value,
  highlight,
  danger,
  positive,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
  positive?: boolean;
  accent?: boolean;
}) {
  const valueClass = cn(
    "text-xs font-mono-data font-semibold",
    highlight && "text-foreground",
    danger && "text-sell",
    positive && "text-buy",
    accent && "text-primary",
    !highlight && !danger && !positive && !accent && "text-muted-foreground",
  );
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
