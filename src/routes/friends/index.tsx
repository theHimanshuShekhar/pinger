import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { getAllUsers } from '@/lib/server/functions';
import { useAuthenticate } from '@daveyplate/better-auth-ui'
import { QueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/friends/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient = new QueryClient();
    const users = await context.queryClient.fetchQuery({ queryKey: ['users'], queryFn: async () => await getAllUsers() })
    return { users };
  }
});


function RouteComponent() {
  useAuthenticate();
  const { users } = Route.useLoaderData();
  return <div className="items-center justify-center flex flex-col p-2">
    <div className='bg-gray-900 p-3 w-full rounded'>Search Bar</div>
    <div>All users</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-rows-auto gap-4">
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  </div>
}

function UserCard({ user }: { user: any }) {
  return (
    <Card className="max-w-sm flex rounded p-4 gap-1">
      <div className='flex gap-1 item-center'>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='text-lg flex items-center'>
          {user.name}
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <div>Last Online:time or Online</div>
      </div>
    </Card>
  )
}
