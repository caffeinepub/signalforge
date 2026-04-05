import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SignalType } from "../backend.d";
import { useActiveSignals, useAlertPreference } from "../hooks/useQueries";

export function AlertsPage() {
  const { data: pref, isLoading, mutation } = useAlertPreference();
  const { data: activeSignals = [] } = useActiveSignals();
  const [webNotifs, setWebNotifs] = useState(
    pref?.enableWebNotifications ?? false,
  );
  const [minConfidence, setMinConfidence] = useState([
    pref ? Number(pref.minimumConfidenceForAlert) : 80,
  ]);

  const handleSave = async () => {
    await mutation.mutateAsync({
      enableWebNotifications: webNotifs,
      minimumConfidenceForAlert: BigInt(minConfidence[0]),
    });
    if (webNotifs && "Notification" in window) {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        toast.warning("Notification permission denied");
      }
    }
  };

  // Recent alerts from active signals
  const recentAlerts = activeSignals
    .filter((s) => Number(s.confidenceScore) >= minConfidence[0])
    .slice(0, 10)
    .map((s, i) => ({
      id: i,
      symbol: s.symbol,
      type: s.signalType,
      confidence: Number(s.confidenceScore),
      time: new Date(Date.now() - i * 3 * 60 * 1000).toLocaleTimeString(),
    }));

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Alerts & Notifications
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-5">
            Notification Settings
          </h3>

          {isLoading ? (
            <div className="space-y-3" data-ocid="alerts.loading_state">
              {["a1", "a2", "a3"].map((k) => (
                <Skeleton key={k} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Web notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Web Notifications
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={webNotifs}
                  onCheckedChange={setWebNotifs}
                  data-ocid="alerts.web.switch"
                />
              </div>

              {/* Minimum confidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Minimum Confidence
                  </Label>
                  <span className="text-sm font-bold font-mono-data text-primary">
                    {minConfidence[0]}%
                  </span>
                </div>
                <Slider
                  value={minConfidence}
                  onValueChange={setMinConfidence}
                  min={50}
                  max={95}
                  step={5}
                  data-ocid="alerts.confidence.slider"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50% (More alerts)</span>
                  <span>95% (Sniper only)</span>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={mutation.isPending}
                data-ocid="alerts.save.button"
                className="w-full h-9 text-xs uppercase tracking-wider"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
            Recent Alerts
          </h3>
          {recentAlerts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 gap-3"
              data-ocid="alerts.empty_state"
            >
              <BellOff className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No alerts above {minConfidence[0]}% confidence
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`alerts.item.${i + 1}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    alert.type === SignalType.buy
                      ? "bg-buy/5 border-buy/20"
                      : alert.type === SignalType.sell
                        ? "bg-sell/5 border-sell/20"
                        : "bg-notrade/5 border-notrade/20",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {alert.type === SignalType.buy ? (
                      <TrendingUp className="w-3.5 h-3.5 text-buy" />
                    ) : alert.type === SignalType.sell ? (
                      <TrendingDown className="w-3.5 h-3.5 text-sell" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-notrade" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      {alert.symbol}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold uppercase",
                        alert.type === SignalType.buy
                          ? "text-buy"
                          : alert.type === SignalType.sell
                            ? "text-sell"
                            : "text-notrade",
                      )}
                    >
                      {alert.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-data text-primary">
                      {alert.confidence}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
