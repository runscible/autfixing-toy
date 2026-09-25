import { useEffect, useState } from "react";
import { createTodo, deleteTodo, fetchTodos, toggleTodoDone } from "./api";
import { sortByUrgency } from "./sortByUrgency";
import type { NewTodoInput, Todo } from "./types";
import { TodoList } from "./components/TodoList";
import { NewTodoForm } from "./components/NewTodoForm";

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos().then(setTodos);
  }, []);

  async function handleCreate(input: NewTodoInput) {
    const todo = await createTodo(input);
    setTodos((prev) => [todo, ...prev]);
  }

  async function handleToggleDone(id: number, done: boolean) {
    const updated = await toggleTodoDone(id, done);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: number) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function handleSortByUrgency() {
    setTodos((prev) => sortByUrgency(prev));
  }

  return (
    <main className="app">
      <div className="title-bar">
        <span>tasks.exe</span>
        <span className="title-bar__dots">
          <span>_</span>
          <span>□</span>
          <span>X</span>
        </span>
      </div>

      <h1>Tasks You'll Never Do</h1>
      <p className="tagline">Extreme productivity, zero output.</p>

      <div className="marquee">
        <span>
          ★彡 WELCOME TO MY TODO LIST 彡★ BEST VIEWED IN NETSCAPE NAVIGATOR ★彡 NOW
          WITH 100% MORE PROCRASTINATION 彡★
        </span>
      </div>

      <NewTodoForm onCreate={handleCreate} />

      <div className="sort-row">
        <button type="button" className="sort-button" onClick={handleSortByUrgency}>
          Sort by urgency
        </button>
        <span className="blink">★ NEW! ★</span>
      </div>

      <TodoList todos={todos} onToggleDone={handleToggleDone} onDelete={handleDelete} />

      <div className="under-construction" title="under construction" />

      <div className="badge-row">
        <span>100% WEB 1.0</span>
        <span>NO FRAMES</span>
        <span>Y2K READY</span>
      </div>

      <div className="hit-counter">
        You are visitor number
        <div className="hit-counter__display">000042</div>
      </div>
    </main>
  );
}
