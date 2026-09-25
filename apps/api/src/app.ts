import Fastify, { type FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import { createDb } from "./db.js";
import { registerTodoRoutes } from "./routes/todos.js";
import { registerErrorRoutes } from "./routes/errors.js";

export type App = FastifyInstance & { db: Database.Database };

export function buildApp(dbPath: string): App {
  const db = createDb(dbPath);
  const app = Object.assign(Fastify({ logger: false }), { db });

  registerTodoRoutes(app, db);
  registerErrorRoutes(app, db);

  return app;
}
