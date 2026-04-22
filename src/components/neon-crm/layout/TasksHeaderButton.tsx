import { CheckSquare } from "lucide-react";
import { useGetList, useTranslate } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";

import type { Task } from "../types";
import { TasksPage } from "../tasks/TasksPage";
import { isDone, isDueToday, isOverdue } from "../tasks/tasksPredicate";

export const TasksHeaderButton = () => {
  const location = useLocation();
  const isActive = !!matchPath("/tasks/*", location.pathname);
  const translate = useTranslate();

  const { data: tasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "due_date", order: "ASC" },
    filter: {},
  });

  const urgentCount = tasks
    ? tasks.filter(
        (t) => !isDone(t) && (isDueToday(t.due_date) || isOverdue(t.due_date)),
      ).length
    : 0;

  return (
    <Link
      to={TasksPage.path}
      className={`relative flex items-center gap-1.5 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? "text-secondary-foreground border-secondary-foreground"
          : "text-secondary-foreground/70 border-transparent hover:text-secondary-foreground/80"
      }`}
    >
      <CheckSquare className="w-3.5 h-3.5" />
      <span>{translate("resources.tasks.name", { smart_count: 2 })}</span>
      {urgentCount > 0 && (
        <span className="absolute top-1.5 right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {urgentCount > 9 ? "9+" : urgentCount}
        </span>
      )}
    </Link>
  );
};
