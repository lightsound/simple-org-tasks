import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'

export type Scope = {
  userId: string
  orgId: string | null
}

// 現在のリクエストの認証スコープを返す（未ログインなら userId は null）。
export async function getScope(): Promise<{ userId: string | null; orgId: string | null }> {
  const { userId, orgId } = await auth()
  return { userId: userId ?? null, orgId: orgId ?? null }
}

// ミューテーション用。未ログインなら例外を投げる。
export async function requireScope(): Promise<Scope> {
  const scope = await getScope()
  if (!scope.userId) {
    throw new Error('UNAUTHENTICATED')
  }
  return { userId: scope.userId, orgId: scope.orgId }
}

// ルートガード用に認証状態だけを返す Server Function。
export const fetchAuthState = createServerFn().handler(async () => {
  return getScope()
})
