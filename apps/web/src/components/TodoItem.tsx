import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  onToggleDone: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggleDone, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item${todo.done ? " todo-item--done" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={(e) => onToggleDone(todo.id, e.target.checked)}
        />
        <span className="todo-item__title">{todo.title}</span>
      </label>
      {todo.description ? (
        <p className="todo-item__description">{todo.description}</p>
      ) : null}
      {todo.dueDate ? <p className="todo-item__due">Due {todo.dueDate}</p> : null}
      <button type="button" onClick={() => onDelete(todo.id)}>
        Abandon forever
      </button>
    </li>
  );
}
