import { useCallback, useState } from "react";
import { useGetList } from "ra-core";

import type { Task } from "../types";
import { TasksTabBar, type TasksTab } from "./TasksTabBar";
import { TasksAllList, NewTaskButton } from "./TasksAllList";
import { ContactsWithoutTasks } from "./ContactsWithoutTasks";

export const TasksPage = () => {
  const [activeTab, setActiveTab] = useState<TasksTab>("all");
  const [noTaskCount, setNoTaskCount] = useState(0);

  const { data: tasks = [], isPending } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "due_date", order: "ASC" },
    filter: {},
  });

  const handleCountChange = useCallback((count: number) => {
    setNoTaskCount(count);
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-6 px-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-ghost">Tareas</h1>
        <NewTaskButton />
      </div>

      <TasksTabBar
        tasks={tasks}
        contactsWithoutTaskCount={noTaskCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Always mount ContactsWithoutTasks to keep the count fresh */}
      <div className={activeTab === "no_task" ? "" : "hidden"}>
        <ContactsWithoutTasks onCountChange={handleCountChange} />
      </div>

      {activeTab !== "no_task" && (
        <TasksAllList
          tasks={tasks}
          activeTab={activeTab}
          isPending={isPending}
        />
      )}
    </div>
  );
};

TasksPage.path = "/tasks";
