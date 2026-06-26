import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in/$')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <SignIn />
    </div>
  )
}
