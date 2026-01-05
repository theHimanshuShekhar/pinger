import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pinger/')({
  component: PingerComponent,
})

function PingerComponent() {
  return <div className="grow items-center justify-center flex flex-col"><div>Create a new ping for your friends!</div></div>
}
