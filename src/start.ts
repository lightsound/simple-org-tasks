import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

// Clerk のリクエストミドルウェアを全リクエストに適用する。
// これにより Server Function 内で auth() から { userId, orgId } を取得できる。
export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  }
})
