import type { Todo } from "./types";

function isUrgent(todo: Todo): boolean {
  return todo.description.trim().toLowerCase().includes("urgente");
}

export function sortByUrgency(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => Number(isUrgent(b)) - Number(isUrgent(a)));
}
