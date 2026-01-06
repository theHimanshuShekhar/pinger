import { useAuthenticate } from '@daveyplate/better-auth-ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/friends/')({
  component: RouteComponent,
})

function RouteComponent() {
  useAuthenticate();
  return <div className="grow items-center justify-center flex flex-col">
    <div>Add friends!</div>
  </div>
}
