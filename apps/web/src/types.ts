export interface Todo {
  id: number;
  title: string;
  description: string;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface NewTodoInput {
  title: string;
  description?: string;
  dueDate?: string;
}
