import { fetchTasksWithMeta, type Task, type Pagination } from "@/api/tasks";
import TaskForm from "@/components/assessment/TaskForm";
import TaskList from "@/components/assessment/TaskList";
import TaskStats from "@/components/assessment/TaskStats";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const { data, pagination } = await fetchTasksWithMeta({
          page,
          limit,
          search: searchTerm || undefined,
        });
        setTasks(data);
        setPagination(pagination);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, limit, searchTerm]);

  const loadTasks = async (): Promise<void> => {
    // Manual refresh using current state params
    setLoading(true);
    try {
      const { data, pagination } = await fetchTasksWithMeta({
        page,
        limit,
        search: searchTerm || undefined,
      });
      setTasks(data);
      setPagination(pagination);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask: Task): void => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (taskId: number, updates: Partial<Task>): void => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const handleTaskDeleted = (taskId: number): void => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="app">
      <h1>Task Management Assessment</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="main-content">
        <div className="left-panel">
          <TaskForm onTaskAdded={handleTaskAdded} />
          <TaskStats tasks={tasks} />
        </div>

        <div className="right-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination?.hasPreviousPage}
            >
              Prev
            </button>
            <span>
              Page {pagination?.currentPage ?? page} of {pagination?.totalPages ?? 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination?.hasNextPage}
            >
              Next
            </button>
          </div>
          <TaskList
            tasks={tasks}
            searchTerm={searchTerm}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;
