import type { Task } from "@/api/tasks";
import { useEffect, useMemo, useState } from "react";

interface TaskStatsProps {
  tasks: Task[];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const [updateTime, setUpdateTime] = useState<number>(Date.now());

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t: Task) => t.completed).length,
      pending: tasks.filter((t: Task) => !t.completed).length,
      highPriority: tasks.filter((t: Task) => t.priority === "high").length,
      mediumPriority: tasks.filter((t: Task) => t.priority === "medium").length,
      lowPriority: tasks.filter((t: Task) => t.priority === "low").length,
      overdueCount: calculateOverdueTasks(tasks),
      averageCompletionTime: calculateAverageCompletionTime(tasks),
    };
  }, [tasks]);

  function calculateOverdueTasks(taskList: Task[]): number {
    console.log("🔥 Calculating overdue tasks..."); // This will log too frequently
    const now = new Date();
    return taskList.filter((task: Task) => {
      if (task.completed) return false;
      if (!task.due_date) return false;
      return new Date(task.due_date as string) < now;
    }).length;
  }

  function calculateAverageCompletionTime(taskList: Task[]): number {
    console.log("🔥 Calculating average completion time..."); // This will log too frequently
    const completedTasks = taskList.filter(
      (t: Task) => t.completed && t.completed_at
    );
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at).getTime();
      const completed = new Date(task.completed_at as string).getTime();
      return sum + (completed - created);
    }, 0);

    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // hours
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUpdateTime(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="stats-container">
      <h2>📊 Task Statistics</h2>
      <div>
        Total Tasks: <strong>{stats.total}</strong>
      </div>
      <div>
        Completed: <strong>{stats.completed}</strong>
      </div>
      <div>
        Pending: <strong>{stats.pending}</strong>
      </div>
      <hr />
      <div>
        High Priority: <strong>{stats.highPriority}</strong>
      </div>
      <div>
        Medium Priority: <strong>{stats.mediumPriority}</strong>
      </div>
      <div>
        Low Priority: <strong>{stats.lowPriority}</strong>
      </div>
      <hr />
      <div>
        Overdue: <strong>{stats.overdueCount}</strong>
      </div>
      <div>
        Avg Completion: <strong>{stats.averageCompletionTime} hours</strong>
      </div>
      <hr />
      <small>Last updated: {new Date(updateTime).toLocaleTimeString()}</small>
    </div>
  );
}

export default TaskStats;
