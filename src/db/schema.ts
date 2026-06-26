import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { TASK_STATUSES } from '#/lib/tasks'

export const tasks = sqliteTable('tasks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: TASK_STATUSES }).notNull().default('todo'),
  // 個人スコープの所有者（Clerk ユーザー ID）
  userId: text('user_id').notNull(),
  // 組織コンテキストのときのみ Clerk 組織 ID。個人タスクは null
  orgId: text('org_id'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
