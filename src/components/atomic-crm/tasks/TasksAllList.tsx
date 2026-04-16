import { useMemo } from "react";
import {
  ListContextProvider,
  ResourceContextProvider,
  useList,
  useTranslate,
} from "ra-core";
import { Skeleton } from "@/components/ui/skeleton";

import type { Task } from "../types";
import { TasksIterator } from "./TasksIterator";
import { AddTask } from "./AddTask";
import type { TasksTab } from "./TasksTabBar";
import {
  isDone,
  isDueLater,
  isDueThisWeek,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  isRecentlyDone,
} from "./tasksPredicate";

type GroupedListProps = {
  tasks: Task[];
  title: string;
};

const GroupedList = ({ tasks, title }: GroupedListProps) => {
  const listContext = useList({ data: tasks, resource: "tasks", perPage: 50 });
  if (!tasks.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wider text-ghost-muted font-medium mb-2">
        {title}
      </p>
      <ResourceContextProvider value="tasks">
        <ListContextProvider value={listContext}>
          <TasksIterator showContact />
        </ListContextProvider>
      </ResourceContextProvider>
    </div>
  );
};

const filterByTab = (tasks: Task[], tab: TasksTab): Task[] => {
  switch (tab) {
    case "today":
      return tasks.filter(
        (t) => !isDone(t) && (isDueToday(t.due_date) || isOverdue(t.due_date)),
      );
    case "this_week":
      return tasks.filter((t) => !isDone(t) && isDueThisWeek(t.due_date));
    case "pending":
      return tasks.filter((t) => !isDone(t));
    case "completed":
      return tasks.filter(isDone);
    case "all":
    default:
      return tasks.filter((t) => !isDone(t) || isRecentlyDone(t));
  }
};

type TasksAllListProps = {
  tasks: Task[];
  activeTab: TasksTab;
  isPending: boolean;
};

export const TasksAllList = ({
  tasks,
  activeTab,
  isPending,
}: TasksAllListProps) => {
  const translate = useTranslate();

  const filtered = useMemo(
    () => filterByTab(tasks, activeTab),
    [tasks, activeTab],
  );

  const overdue = useMemo(
    () => filtered.filter((t) => !isDone(t) && isOverdue(t.due_date)),
    [filtered],
  );
  const today = useMemo(
    () => filtered.filter((t) => !isDone(t) && isDueToday(t.due_date)),
    [filtered],
  );
  const tomorrow = useMemo(
    () => filtered.filter((t) => !isDone(t) && isDueTomorrow(t.due_date)),
    [filtered],
  );
  const thisWeek = useMemo(
    () => filtered.filter((t) => !isDone(t) && isDueThisWeek(t.due_date)),
    [filtered],
  );
  const later = useMemo(
    () => filtered.filter((t) => !isDone(t) && isDueLater(t.due_date)),
    [filtered],
  );
  const done = useMemo(() => filtered.filter(isDone), [filtered]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="text-center py-12 text-ghost-muted">
        <p className="text-base font-medium">Sin tareas en esta categoría</p>
        <p className="text-sm mt-1">
          {translate("resources.tasks.empty_list_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {activeTab === "completed" ? (
        <GroupedList tasks={done} title="Completadas" />
      ) : (
        <>
          <GroupedList
            tasks={overdue}
            title={translate("resources.tasks.filters.overdue")}
          />
          <GroupedList
            tasks={today}
            title={translate("resources.tasks.filters.today")}
          />
          <GroupedList
            tasks={tomorrow}
            title={translate("resources.tasks.filters.tomorrow")}
          />
          <GroupedList
            tasks={thisWeek}
            title={translate("resources.tasks.filters.this_week")}
          />
          <GroupedList
            tasks={later}
            title={translate("resources.tasks.filters.later")}
          />
        </>
      )}
    </div>
  );
};

export const NewTaskButton = () => <AddTask selectContact display="chip" />;
