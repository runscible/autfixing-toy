import { existsSync } from "node:fs";
import { buildApp } from "./app.js";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const app = buildApp("todo-autofix.sqlite");
const port = Number(process.env.PORT ?? 3001);

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
