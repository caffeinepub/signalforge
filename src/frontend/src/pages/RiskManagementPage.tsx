import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calculator, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRiskSettings } from "../hooks/useQueries";

interface RiskForm {
  capitalAmount: string;
  riskPercentage: string;
  maxLotSize: string;
  maxDailyLoss: string;
  drawdownLimit: string;
  maxOpenTrades: string;
  riskRewardTarget: string;
}

export function RiskManagementPage() {
  const { data: settings, isLoading, mutation } = useRiskSettings();
  const { register, handleSubmit, watch, reset } = useForm<RiskForm>({
    defaultValues: {
      capitalAmount: "500000",
      riskPercentage: "2",
      maxLotSize: "50",
      maxDailyLoss: "10000",
      drawdownLimit: "15",
      maxOpenTrades: "5",
      riskRewardTarget: "2",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        capitalAmount: settings.capitalAmount.toString(),
        riskPercentage: settings.riskPercentage.toString(),
        maxLotSize: settings.maxLotSize.toString(),
        maxDailyLoss: settings.maxDailyLoss.toString(),
        drawdownLimit: settings.drawdownLimit.toString(),
        maxOpenTrades: settings.maxOpenTrades.toString(),
        riskRewardTarget: settings.riskRewardTarget,
      });
    }
  }, [settings, reset]);

  const watchValues = watch();
  const capital = Number.parseFloat(watchValues.capitalAmount) || 0;
  const riskPct = Number.parseFloat(watchValues.riskPercentage) || 0;
  const riskAmount = (capital * riskPct) / 100;
  const costPerLot = 50;
  const maxLots = riskAmount > 0 ? Math.floor(riskAmount / costPerLot) : 0;
  const drawdownAmt =
    (capital * Number.parseFloat(watchValues.drawdownLimit || "0")) / 100;

  const onSubmit = async (data: RiskForm) => {
    await mutation.mutateAsync({
      capitalAmount: BigInt(
        Math.round(Number.parseFloat(data.capitalAmount) || 0),
      ),
      riskPercentage: BigInt(
        Math.round(Number.parseFloat(data.riskPercentage) || 0),
      ),
      maxLotSize: BigInt(Math.round(Number.parseFloat(data.maxLotSize) || 0)),
      maxDailyLoss: BigInt(
        Math.round(Number.parseFloat(data.maxDailyLoss) || 0),
      ),
      drawdownLimit: BigInt(
        Math.round(Number.parseFloat(data.drawdownLimit) || 0),
      ),
      maxOpenTrades: BigInt(
        Math.round(Number.parseFloat(data.maxOpenTrades) || 0),
      ),
      riskRewardTarget: data.riskRewardTarget,
    });
  };

  const riskLevel =
    riskPct <= 1
      ? "Conservative"
      : riskPct <= 2
        ? "Moderate"
        : riskPct <= 3
          ? "Aggressive"
          : "Very High Risk";
  const riskColor =
    riskPct <= 1
      ? "text-buy"
      : riskPct <= 2
        ? "text-primary"
        : riskPct <= 3
          ? "text-notrade"
          : "text-sell";
  const riskBarWidth = Math.min((riskPct / 5) * 100, 100);

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Risk Management
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
            Risk Parameters
          </h3>

          {isLoading ? (
            <div className="space-y-3" data-ocid="risk.loading_state">
              {[...Array(7)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Capital Amount (₹)" htmlFor="capital">
                <Input
                  {...register("capitalAmount")}
                  id="capital"
                  data-ocid="risk.capital.input"
                  className="h-9 text-sm bg-background"
                  placeholder="500000"
                />
              </FormField>
              <FormField label="Risk Per Trade (%)" htmlFor="risk">
                <Input
                  {...register("riskPercentage")}
                  id="risk"
                  data-ocid="risk.percentage.input"
                  className="h-9 text-sm bg-background"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </FormField>
              <FormField label="Max Lot Size" htmlFor="lotsize">
                <Input
                  {...register("maxLotSize")}
                  id="lotsize"
                  data-ocid="risk.lotsize.input"
                  className="h-9 text-sm bg-background"
                  type="number"
                />
              </FormField>
              <FormField label="Max Daily Loss (₹)" htmlFor="dailyloss">
                <Input
                  {...register("maxDailyLoss")}
                  id="dailyloss"
                  data-ocid="risk.dailyloss.input"
                  className="h-9 text-sm bg-background"
                  placeholder="10000"
                />
              </FormField>
              <FormField label="Max Drawdown Limit (%)" htmlFor="drawdown">
                <Input
                  {...register("drawdownLimit")}
                  id="drawdown"
                  data-ocid="risk.drawdown.input"
                  className="h-9 text-sm bg-background"
                  type="number"
                  min="1"
                  max="50"
                />
              </FormField>
              <FormField label="Max Open Trades" htmlFor="opentrades">
                <Input
                  {...register("maxOpenTrades")}
                  id="opentrades"
                  data-ocid="risk.opentrades.input"
                  className="h-9 text-sm bg-background"
                  type="number"
                  min="1"
                  max="20"
                />
              </FormField>
              <FormField label="R:R Target (e.g. 1:2)" htmlFor="rr">
                <Input
                  {...register("riskRewardTarget")}
                  id="rr"
                  data-ocid="risk.rr.input"
                  className="h-9 text-sm bg-background"
                  placeholder="2"
                />
              </FormField>

              <Button
                type="submit"
                disabled={mutation.isPending}
                data-ocid="risk.save.button"
                className="w-full h-9 text-xs uppercase tracking-wider"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  "Save Risk Settings"
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Calculator & Gauge */}
        <div className="space-y-4">
          {/* Risk Level Gauge */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Risk Level Gauge
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                Current Risk Level
              </span>
              <span className={cn("text-sm font-bold", riskColor)}>
                {riskLevel}
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskBarWidth}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background:
                    riskPct <= 1
                      ? "oklch(0.72 0.18 145)"
                      : riskPct <= 2
                        ? "oklch(0.73 0.13 195)"
                        : riskPct <= 3
                          ? "oklch(0.78 0.16 85)"
                          : "oklch(0.62 0.22 25)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>Conservative</span>
              <span>Moderate</span>
              <span>5%+</span>
            </div>
          </div>

          {/* Position Size Calculator */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Position Size Calculator
              </h3>
            </div>
            <div className="space-y-3">
              <CalcRow
                label="Capital"
                value={`₹${capital.toLocaleString("en-IN")}`}
              />
              <CalcRow
                label={`Risk Amount (${riskPct}%)`}
                value={`₹${riskAmount.toLocaleString("en-IN")}`}
                highlight
              />
              <CalcRow
                label="Max Lots (est.)"
                value={maxLots.toString()}
                accent
              />
              <CalcRow
                label={`Drawdown Limit (${watchValues.drawdownLimit}%)`}
                value={`₹${drawdownAmt.toLocaleString("en-IN")}`}
                danger
              />
              <CalcRow
                label="Max Open Trades"
                value={watchValues.maxOpenTrades}
              />
              <CalcRow
                label="R:R Target"
                value={`1:${watchValues.riskRewardTarget}`}
                accent
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className="text-xs text-muted-foreground mb-1.5 block"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function CalcRow({
  label,
  value,
  highlight,
  accent,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xs font-bold font-mono-data",
          highlight && "text-foreground",
          accent && "text-primary",
          danger && "text-sell",
          !highlight && !accent && !danger && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
