import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ping/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="grow items-center justify-center flex flex-col"><div>Ping status response and chat!</div></div>
}
