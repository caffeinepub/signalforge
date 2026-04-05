import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TickerBar } from "./components/TickerBar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { AlertsPage } from "./pages/AlertsPage";
import { BacktestPage } from "./pages/BacktestPage";
import { ChartsPage } from "./pages/ChartsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RiskManagementPage } from "./pages/RiskManagementPage";
import { WatchlistPage } from "./pages/WatchlistPage";

type Page =
  | "dashboard"
  | "signals"
  | "charts"
  | "backtest"
  | "watchlist"
  | "risk"
  | "alerts"
  | "admin";

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case "dashboard":
    case "signals":
      return <DashboardPage />;
    case "charts":
      return <ChartsPage />;
    case "backtest":
      return <BacktestPage />;
    case "watchlist":
      return <WatchlistPage />;
    case "risk":
      return <RiskManagementPage />;
    case "alerts":
      return <AlertsPage />;
    case "admin":
      return <AdminPage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [activePage, setActivePage] = useState<Page>("signals");

  // Show loading spinner while identity initializes
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster richColors theme="dark" />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
        isAdmin={isAdmin}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Ticker bar */}
        <TickerBar />

        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
          <PageTitle page={activePage} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Principal:</span>
            <span className="text-xs font-mono-data text-foreground">
              {identity.getPrincipal().toString().slice(0, 12)}...
            </span>
            <div
              className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
              title="Connected"
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <PageContent page={activePage} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-border px-6 py-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            SignalForge &mdash; Institutional F&O Signals
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      <Toaster richColors theme="dark" />
    </div>
  );
}

function PageTitle({ page }: { page: Page }) {
  const titles: Record<Page, { label: string; sub: string }> = {
    dashboard: {
      label: "Dashboard",
      sub: "Overview of all signals and performance",
    },
    signals: { label: "Live Signals", sub: "Real-time F&O trading signals" },
    charts: {
      label: "Chart Analysis",
      sub: "Multi-strategy technical analysis",
    },
    backtest: {
      label: "Backtesting",
      sub: "Test strategies on historical data",
    },
    watchlist: { label: "Watchlist", sub: "Track your instruments" },
    risk: {
      label: "Risk Management",
      sub: "Configure position sizing and risk",
    },
    alerts: { label: "Alerts", sub: "Notification preferences" },
    admin: { label: "Admin Panel", sub: "System configuration and metrics" },
  };
  const t = titles[page];
  return (
    <div>
      <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">
        {t.label}
      </h1>
      <p className="text-xs text-muted-foreground">{t.sub}</p>
    </div>
  );
}
