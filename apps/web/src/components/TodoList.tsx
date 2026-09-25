import type { Todo } from "../types";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggleDone: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoList({ todos, onToggleDone, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-state">No tasks. Suspiciously productive of you.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggleDone={onToggleDone} onDelete={onDelete} />
      ))}
    </ul>
  );
}
