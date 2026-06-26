import {
  OrganizationSwitcher,
  RedirectToSignIn,
  Show,
  UserButton,
  useAuth,
} from '@clerk/tanstack-react-start'
import { Link, Outlet, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

// Clerk の組織コンテキスト（個人 ⇔ 組織）が切り替わったらタスク一覧を再取得する。
function ScopeReloader() {
  const { orgId } = useAuth()
  const router = useRouter()
  const previous = useRef(orgId)

  useEffect(() => {
    if (previous.current !== orgId) {
      previous.current = orgId
      router.invalidate()
    }
  }, [orgId, router])

  return null
}

function AuthedLayout() {
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
      <Show when="signed-in">
        <ScopeReloader />
        <div className="min-h-screen bg-background text-foreground">
          <header className="flex items-center justify-between border-b border-border px-6 py-3">
            <Link
              to="/tasks"
              className="text-lg font-semibold text-foreground no-underline"
            >
              タスク管理
            </Link>
            <div className="flex items-center gap-3">
              <OrganizationSwitcher hidePersonal={false} />
              <UserButton />
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl px-6 py-8">
            <Outlet />
          </main>
        </div>
      </Show>
    </>
  )
}
