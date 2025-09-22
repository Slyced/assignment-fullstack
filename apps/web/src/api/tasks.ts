const API_URL = "http://localhost:3000/api";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  priority: Priority;
  completed: boolean;
  due_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  category: string;
};

export type NewTask = {
  title: string;
  description?: string | null;
  priority?: Priority;
  category?: string;
  due_date?: string | null;
};

export type SortBy = "title" | "priority" | "due_date";
export type SortOrder = "asc" | "desc";

export type TaskFilters = {
  priority?: Priority;
  category?: string;
  completed?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const fetchTasks = async (
  filters: TaskFilters = {}
): Promise<Task[]> => {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const url = searchParams.toString()
    ? `${API_URL}/tasks?${searchParams.toString()}`
    : `${API_URL}/tasks`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const json = await response.json();
  return Array.isArray(json) ? (json as Task[]) : (json.data as Task[]);
};

export const fetchTasksWithMeta = async (
  filters: TaskFilters = {}
): Promise<{ data: Task[]; pagination: Pagination }> => {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const url = searchParams.toString()
    ? `${API_URL}/tasks?${searchParams.toString()}`
    : `${API_URL}/tasks`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const json = await response.json();
  if (Array.isArray(json)) {
    return {
      data: json as Task[],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: (json as Task[]).length,
        itemsPerPage: (json as Task[]).length,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
  return json as { data: Task[]; pagination: Pagination };
};

export const createTask = async (task: NewTask): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!response.ok) throw new Error("Failed to create task");
  return response.json() as Promise<Task>;
};

export const deleteTask = async (id: number): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete task");
  return response.json() as Promise<{ success: boolean }>;
};

export const toggleTask = async (id: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
    method: "PATCH",
  });

  if (!response.ok) throw new Error("Failed to toggle task");
  return response.json() as Promise<Task>;
};
