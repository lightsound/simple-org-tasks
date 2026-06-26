// タスクのステータス定義（DB スキーマからもクライアント UI からも参照する純粋モジュール。
// drizzle などサーバー専用の依存を持ち込まないこと）
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
}
