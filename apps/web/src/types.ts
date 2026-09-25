export interface Todo {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface NewTodoInput {
  title: string;
  description?: string;
  dueDate?: string;
}
