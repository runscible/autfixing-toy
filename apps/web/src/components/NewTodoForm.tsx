import { useState, type FormEvent } from "react";
import type { NewTodoInput } from "../types";

interface NewTodoFormProps {
  onCreate: (input: NewTodoInput) => void;
}

export function NewTodoForm({ onCreate }: NewTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
    });

    setTitle("");
    setDescription("");
    setDueDate("");
  }

  return (
    <form className="new-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Something you'll never do"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description (optional, like your effort)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button type="submit">Add to the pile</button>
    </form>
  );
}
