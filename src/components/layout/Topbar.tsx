"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Menu,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "./ThemeContext";

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNewTask: () => void;
}

export default function Topbar({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNewTask,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<{
    overdueCount: number;
    urgentCount: number;
    items: Array<{ id: string; title: string; type: "overdue" | "urgent"; deadline?: string }>;
  }>({
    overdueCount: 0,
    urgentCount: 0,
    items: [],
  });

  useEffect(() => {
    // Busca alertas de demandas atrasadas e urgentes
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/tasks/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch {
        // Silently catch in initial render
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = alerts.overdueCount + alerts.urgentCount;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition w-44 sm:w-64 md:w-80 text-left"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 truncate text-xs sm:text-sm">Buscar em tudo...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Task */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm shadow-blue-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Demanda</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Alertas e Atenção
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                  {totalAlerts} pendência{totalAlerts === 1 ? "" : "s"}
                </span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {alerts.items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <span>Tudo em dia! Nenhuma demanda atrasada.</span>
                  </div>
                ) : (
                  alerts.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs"
                    >
                      {item.type === "overdue" ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.type === "overdue" ? "Prazo expirado" : "Prazo próximo"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}
