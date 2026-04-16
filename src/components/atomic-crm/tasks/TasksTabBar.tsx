import { cn } from "@/lib/utils";
import type { Task } from "../types";
import { isDone, isDueThisWeek, isDueToday, isOverdue } from "./tasksPredicate";

export type TasksTab =
  | "all"
  | "today"
  | "this_week"
  | "pending"
  | "completed"
  | "no_task";

type Tab = {
  id: TasksTab;
  label: string;
  count?: number;
};

const buildTabs = (tasks: Task[], contactsWithoutTaskCount: number): Tab[] => {
  const pending = tasks.filter((t) => !isDone(t));
  const todayCount = pending.filter(
    (t) => isDueToday(t.due_date) || isOverdue(t.due_date),
  ).length;
  const weekCount = pending.filter((t) => isDueThisWeek(t.due_date)).length;

  return [
    { id: "all", label: "Todas", count: pending.length },
    { id: "today", label: "Vencen hoy", count: todayCount },
    { id: "this_week", label: "Esta semana", count: weekCount },
    { id: "pending", label: "Pendientes", count: pending.length },
    {
      id: "completed",
      label: "Completadas",
      count: tasks.filter(isDone).length,
    },
    { id: "no_task", label: "Sin tarea", count: contactsWithoutTaskCount },
  ];
};

type TasksTabBarProps = {
  tasks: Task[];
  contactsWithoutTaskCount: number;
  activeTab: TasksTab;
  onTabChange: (tab: TasksTab) => void;
};

export const TasksTabBar = ({
  tasks,
  contactsWithoutTaskCount,
  activeTab,
  onTabChange,
}: TasksTabBarProps) => {
  const tabs = buildTabs(tasks, contactsWithoutTaskCount);

  return (
    <div className="flex flex-wrap gap-1 border-b border-border pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md transition-colors",
            activeTab === tab.id
              ? "bg-surface text-ghost border-b-2 border-emerald"
              : "text-ghost-muted hover:text-ghost hover:bg-surface/50",
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
                activeTab === tab.id
                  ? "bg-emerald text-void"
                  : "bg-border text-ghost-muted",
              )}
            >
              {tab.count > 99 ? "99+" : tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
