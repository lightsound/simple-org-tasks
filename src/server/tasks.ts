import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db/client'
import { tasks } from '#/db/schema'
import { TASK_STATUSES } from '#/lib/tasks'
import { getScope, requireScope, type Scope } from '#/server/auth'

// スコープ条件: 組織コンテキストなら org 全体、個人なら自分の orgId=null タスクのみ
function scopeWhere(scope: Scope) {
  return scope.orgId
    ? eq(tasks.orgId, scope.orgId)
    : and(eq(tasks.userId, scope.userId), isNull(tasks.orgId))
}

const statusSchema = z.enum(TASK_STATUSES)

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
})

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

export const getTasks = createServerFn({ method: 'GET' }).handler(async () => {
  const scope = await getScope()
  if (!scope.userId) return []
  return db
    .select()
    .from(tasks)
    .where(scopeWhere({ userId: scope.userId, orgId: scope.orgId }))
    .orderBy(desc(tasks.createdAt))
    .all()
})

export const createTask = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const scope = await requireScope()
    const [row] = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description,
        userId: scope.userId,
        orgId: scope.orgId,
      })
      .returning()
    return row
  })

export const updateTask = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    const scope = await requireScope()
    const { id, ...rest } = data
    const [row] = await db
      .update(tasks)
      .set({ ...rest, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), scopeWhere(scope)))
      .returning()
    if (!row) throw new Error('NOT_FOUND')
    return row
  })

export const setTaskStatus = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1), status: statusSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const scope = await requireScope()
    const [row] = await db
      .update(tasks)
      .set({ status: data.status, updatedAt: new Date() })
      .where(and(eq(tasks.id, data.id), scopeWhere(scope)))
      .returning()
    if (!row) throw new Error('NOT_FOUND')
    return row
  })

export const deleteTask = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const scope = await requireScope()
    await db.delete(tasks).where(and(eq(tasks.id, data.id), scopeWhere(scope)))
    return { id: data.id }
  })
