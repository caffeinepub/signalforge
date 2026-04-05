import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bell,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Radio,
  Settings,
  ShieldAlert,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWatchlist } from "../hooks/useQueries";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "signals", label: "Live Signals", icon: Radio },
  { id: "charts", label: "Chart Analysis", icon: LineChart },
  { id: "backtest", label: "Backtesting", icon: FlaskConical },
  { id: "watchlist", label: "Watchlist", icon: BookMarked },
  { id: "risk", label: "Risk Management", icon: ShieldAlert },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "admin", label: "Admin Panel", icon: Settings },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

export function Sidebar({ activePage, onNavigate, isAdmin }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const { data: watchlist = [] } = useWatchlist();

  const navItems = isAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((n) => n.id !== "admin");

  const SidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-5 border-b border-sidebar-border",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-bold uppercase tracking-wider text-foreground">
              SignalForge
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              F&O Signals
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0",
                    collapsed ? "w-5 h-5" : "w-4 h-4",
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.id === "signals" && (
                  <span className="ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Watchlist Preview */}
        {!collapsed && watchlist.length > 0 && (
          <div className="mt-4 px-3">
            <Separator className="mb-3" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium px-1 mb-2">
              Watchlist
            </p>
            <div className="space-y-1">
              {watchlist.slice(0, 5).map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => onNavigate("watchlist")}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent/60 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground">
                    {sym}
                  </span>
                  <CircleDot className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        {!collapsed && (
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </button>
        )}
        <button
          type="button"
          onClick={clear}
          data-ocid="nav.logout.button"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors",
            collapsed ? "justify-center" : "",
          )}
        >
          <LogOut
            className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")}
          />
          {!collapsed && "Sign Out"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center justify-center w-full py-2 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        {SidebarContent}
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        onClick={() => setMobileOpen(true)}
        data-ocid="nav.menu.button"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex"
            >
              <div className="relative flex-1">
                <button
                  type="button"
                  className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
                {SidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
