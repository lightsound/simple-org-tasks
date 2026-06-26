import { Button, Card, Input, Separator, TextArea } from '@heroui/react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { STATUS_LABEL, TASK_STATUSES } from '#/lib/tasks'
import {
  createTask,
  deleteTask,
  getTasks,
  setTaskStatus,
  updateTask,
} from '#/server/tasks'

import type { Task } from '#/db/schema'
import type { TaskStatus } from '#/lib/tasks'

export const Route = createFileRoute('/_authed/tasks')({
  loader: () => getTasks(),
  component: TasksPage,
})

function TasksPage() {
  const tasks = Route.useLoaderData()
  const router = useRouter()

  const create = useServerFn(createTask)
  const update = useServerFn(updateTask)
  const setStatus = useServerFn(setTaskStatus)
  const remove = useServerFn(deleteTask)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || creating) return
    setCreating(true)
    try {
      await create({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      })
      setTitle('')
      setDescription('')
      await router.invalidate()
    } finally {
      setCreating(false)
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return
    await update({
      data: {
        id,
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      },
    })
    setEditingId(null)
    await router.invalidate()
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return
    await setStatus({ data: { id: task.id, status } })
    await router.invalidate()
  }

  async function handleDelete(id: string) {
    await remove({ data: { id } })
    if (editingId === id) setEditingId(null)
    await router.invalidate()
  }

  const grouped = TASK_STATUSES.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status),
  }))

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="mb-4 text-2xl font-bold">タスク</h1>
        <Card className="rounded-2xl">
          <Card.Content className="p-4">
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Input
                aria-label="タスクのタイトル"
                placeholder="新しいタスクを入力…"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <TextArea
                aria-label="タスクの説明（任意）"
                placeholder="説明（任意）"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={!title.trim()}
                  isPending={creating}
                >
                  <Plus className="size-4" />
                  追加
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </section>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted">
          まだタスクがありません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ status, items }) => (
            <section key={status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-muted">
                  {STATUS_LABEL[status]}
                </h2>
                <span className="text-xs text-muted">{items.length}</span>
                <Separator className="flex-1" />
              </div>

              {items.length === 0 ? (
                <p className="px-1 text-sm text-muted">なし</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {items.map((task) => (
                    <li key={task.id}>
                      <Card className="rounded-2xl">
                        <Card.Content className="flex flex-col gap-3 p-4">
                          {editingId === task.id ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                aria-label="タイトルを編集"
                                value={editTitle}
                                onChange={(event) =>
                                  setEditTitle(event.target.value)
                                }
                              />
                              <TextArea
                                aria-label="説明を編集"
                                value={editDescription}
                                onChange={(event) =>
                                  setEditDescription(event.target.value)
                                }
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onPress={() => setEditingId(null)}
                                >
                                  <X className="size-4" />
                                  キャンセル
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  isDisabled={!editTitle.trim()}
                                  onPress={() => saveEdit(task.id)}
                                >
                                  <Check className="size-4" />
                                  保存
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className={
                                    task.status === 'done'
                                      ? 'font-medium text-muted line-through'
                                      : 'font-medium'
                                  }
                                >
                                  {task.title}
                                </p>
                                {task.description ? (
                                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                                    {task.description}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  aria-label="編集"
                                  onPress={() => startEdit(task)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="danger-soft"
                                  aria-label="削除"
                                  onPress={() => handleDelete(task.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {TASK_STATUSES.map((value) => (
                              <Button
                                key={value}
                                size="sm"
                                variant={
                                  task.status === value ? 'primary' : 'ghost'
                                }
                                onPress={() => changeStatus(task, value)}
                              >
                                {STATUS_LABEL[value]}
                              </Button>
                            ))}
                          </div>
                        </Card.Content>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
