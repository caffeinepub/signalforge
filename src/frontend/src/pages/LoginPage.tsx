import { Button } from "@/components/ui/button";
import { Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-chart-4/5 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(var(--border)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">
            SignalForge
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">
            Institutional F&O Trading Signals
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Authenticate with Internet Identity to access your trading
            dashboard.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Secure Authentication
                </p>
                <p className="text-xs text-muted-foreground">
                  Powered by Internet Computer Identity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Real-Time Signals
                </p>
                <p className="text-xs text-muted-foreground">
                  Multi-strategy confluence engine
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
            className="w-full h-11 text-sm font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our terms of service and trading risk
          disclaimer.
        </p>
      </motion.div>
    </div>
  );
}
