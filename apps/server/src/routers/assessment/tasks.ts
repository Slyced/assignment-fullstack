import { createClient } from "@libsql/client";
import { Hono } from "hono";

const client = createClient({
  url: "file:./dev.db",
});

const router = new Hono();

// GET all tasks - NO BUG HERE
router.get("/tasks", async (c) => {
  const {
    priority,
    category,
    completed,
    search,
    page: rawPage,
    limit: rawLimit,
    sortBy: rawSortBy,
    sortOrder: rawSortOrder,
  } = c.req.query();

  const page = Math.max(parseInt(rawPage || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(rawLimit || "10", 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const allowedSortBy = new Set(["title", "priority", "due_date"]);
  const sortBy = allowedSortBy.has((rawSortBy || "").toLowerCase())
    ? (rawSortBy as string)
    : "due_date";
  const sortOrder = (rawSortOrder || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereConditions: string[] = [];
  const whereParams: (string | number)[] = [];

  if (priority) {
    whereConditions.push("priority = ?");
    whereParams.push(priority);
  }
  if (category) {
    whereConditions.push("category = ?");
    whereParams.push(category);
  }
  if (typeof completed !== "undefined") {
    const completedBool = String(completed).toLowerCase() === "true";
    whereConditions.push("completed = ?");
    whereParams.push(completedBool ? 1 : 0);
  }
  if (search) {
    whereConditions.push("(title LIKE ? OR description LIKE ?)");
    const term = `%${search}%`;
    whereParams.push(term, term);
  }

  let whereClause = "";
  if (whereConditions.length > 0) {
    whereClause = " WHERE " + whereConditions.join(" AND ");
  }

  // Total count for pagination
  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as count FROM tasks${whereClause}`,
    args: whereParams,
  });
  const totalItems = Number((countResult.rows?.[0] as any)?.count || 0);
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  // Data query with sorting and pagination
  const dataSql = `SELECT * FROM tasks${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  const dataArgs = [...whereParams, limit, offset];

  const dataResult = await client.execute({
    sql: dataSql,
    args: dataArgs,
  });

  return c.json({
    data: dataResult.rows,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
});

router.post("/tasks", async (c) => {
  const {
    title,
    description,
    priority = "medium",
    category = "general",
    due_date,
  } = await c.req.json();

  console.log(title, description, priority, category, due_date);

  const result = await client.execute({
    sql: `INSERT INTO tasks (title, description, priority, category, due_date) 
              VALUES (?, ?, ?, ?, ?)`,
    args: [title, description, priority, category, due_date],
  });

  const task = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [result.lastInsertRowid?.toString() || "0"],
  });
  return c.json(task.rows[0]);
});

router.delete("/tasks/:id", async (c) => {
  const id = c.req.param("id");
  client.execute({
    sql: "DELETE FROM tasks WHERE id = ?",
    args: [id],
  });
  return c.json({ success: true });
});

export default router;
