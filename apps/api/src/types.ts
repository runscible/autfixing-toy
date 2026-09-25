export interface Todo {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface StackFrame {
  filename?: string;
  function?: string;
  in_app?: boolean;
}

export interface SentryExceptionValue {
  type?: string;
  value?: string;
  stacktrace?: {
    frames?: StackFrame[];
  };
}

export interface SentryEvent {
  exception?: {
    values?: SentryExceptionValue[];
  };
  message?: string;
  [key: string]: unknown;
}

export interface ErrorEventRow {
  id: number;
  fingerprint: string;
  message: string;
  payload: string;
  count: number;
  first_seen: string;
  last_seen: string;
  github_issue_number: number | null;
}
