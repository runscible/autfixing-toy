import { describe, expect, it } from "vitest";
import { sortByUrgency } from "./sortByUrgency";
import type { Todo } from "./types";

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 1,
    title: "some task",
    description: "",
    done: false,
    dueDate: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("sortByUrgency", () => {
  it("puts todos mentioning 'urgente' in the description first", () => {
    const todos = [
      makeTodo({ id: 1, title: "wash the dishes", description: "can wait" }),
      makeTodo({ id: 2, title: "fix prod", description: "this is urgente" }),
      makeTodo({ id: 3, title: "water the plants", description: "no rush" }),
    ];

    const sorted = sortByUrgency(todos);

    expect(sorted[0]!.id).toBe(2);
  });

  it("is case-insensitive and trims whitespace", () => {
    const todos = [
      makeTodo({ id: 1, description: "  URGENTE  " }),
      makeTodo({ id: 2, description: "chill" }),
    ];

    const sorted = sortByUrgency(todos);

    expect(sorted[0]!.id).toBe(1);
  });

  it("treats a null description as not urgent instead of throwing", () => {
    const todos = [
      makeTodo({ id: 1, description: null }),
      makeTodo({ id: 2, description: "urgente" }),
    ];

    const sorted = sortByUrgency(todos);

    expect(sorted[0]!.id).toBe(2);
  });

  it("does not mutate the original array", () => {
    const todos = [
      makeTodo({ id: 1, description: "chill" }),
      makeTodo({ id: 2, description: "urgente" }),
    ];

    const original = [...todos];
    sortByUrgency(todos);

    expect(todos).toEqual(original);
  });
});
