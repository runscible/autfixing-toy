import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import type { Todo } from "../types.js";

interface TodoRow {
  id: number;
  title: string;
  description: string | null;
  done: number;
  due_date: string | null;
  created_at: string;
}

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    done: Boolean(row.done),
    dueDate: row.due_date,
    createdAt: row.created_at,
  };
}

interface CreateTodoBody {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

interface UpdateTodoBody {
  title?: string;
  description?: string | null;
  done?: boolean;
  dueDate?: string | null;
}

export function registerTodoRoutes(app: FastifyInstance, db: Database.Database): void {
  app.get("/todos", async () => {
    const rows = db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all() as TodoRow[];
    return rows.map(toTodo);
  });

  app.post<{ Body: CreateTodoBody }>("/todos", async (request, reply) => {
    const { title, description, dueDate } = request.body;
    if (!title || typeof title !== "string") {
      return reply.code(400).send({ error: "title is required" });
    }

    const result = db
      .prepare(
        "INSERT INTO todos (title, description, due_date) VALUES (?, ?, ?)",
      )
      .run(title, description ?? null, dueDate ?? null);

    const row = db
      .prepare("SELECT * FROM todos WHERE id = ?")
      .get(result.lastInsertRowid) as TodoRow;

    return reply.code(201).send(toTodo(row));
  });

  app.patch<{ Params: { id: string }; Body: UpdateTodoBody }>(
    "/todos/:id",
    async (request, reply) => {
      const id = Number(request.params.id);
      const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as
        | TodoRow
        | undefined;
      if (!existing) {
        return reply.code(404).send({ error: "not found" });
      }

      const { title, description, done, dueDate } = request.body;
      db.prepare(
        `UPDATE todos SET
          title = ?, description = ?, done = ?, due_date = ?
         WHERE id = ?`,
      ).run(
        title ?? existing.title,
        description === undefined ? existing.description : description,
        done === undefined ? existing.done : done ? 1 : 0,
        dueDate === undefined ? existing.due_date : dueDate,
        id,
      );

      const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow;
      return toTodo(row);
    },
  );

  app.delete<{ Params: { id: string } }>("/todos/:id", async (request, reply) => {
    const id = Number(request.params.id);
    db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    return reply.code(204).send();
  });
}
