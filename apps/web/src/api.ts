import type { NewTodoInput, Todo } from "./types";

const BASE_URL = "/api";

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos`);
  return res.json() as Promise<Todo[]>;
}

export async function createTodo(input: NewTodoInput): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json() as Promise<Todo>;
}

export async function toggleTodoDone(id: number, done: boolean): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  return res.json() as Promise<Todo>;
}

export async function deleteTodo(id: number): Promise<void> {
  await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });
}
