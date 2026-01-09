'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllUsers, addFriendsToList, getAcceptedFriends, getSentPendingFriendRequests, getSentBlockedFriendRequests } from '@/lib/server/functions';
import { useAuthenticate } from '@daveyplate/better-auth-ui'
import { QueryClient, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react';

export const Route = createFileRoute('/friends/add')({
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
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch accepted friends to check if user is already a friend
  const { data: acceptedFriends = [] } = useQuery({
    queryKey: ['acceptedFriends'],
    queryFn: async () => {
      const data = await getAcceptedFriends();
      return data as Array<{ id: string }>;
    },
  });

  // Fetch sent pending requests to check if request is already pending
  const { data: sentPendingRequests = [] } = useQuery({
    queryKey: ['sentPendingRequests'],
    queryFn: async () => {
      const data = await getSentPendingFriendRequests();
      return data as Array<{ id: string }>;
    },
  });

  // Fetch sent blocked requests to check if user is blocked
  const { data: sentBlockedRequests = [] } = useQuery({
    queryKey: ['sentBlockedRequests'],
    queryFn: async () => {
      const data = await getSentBlockedFriendRequests();
      return data as Array<{ id: string }>;
    },
  });

  const friendIds = new Set(acceptedFriends.map(f => f.id));
  const pendingRequestIds = new Set(sentPendingRequests.map(r => r.id));
  const blockedUserIds = new Set(sentBlockedRequests.map(r => r.id));

  const selectedUsers = useMemo(() => {
    return users.filter(user => selectedUserIds.has(user.id));
  }, [users, selectedUserIds]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      !selectedUserIds.has(user.id) &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, selectedUserIds, searchQuery]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAddFriends = async () => {
    try {
      const friendIds = Array.from(selectedUserIds);

      const result = await addFriendsToList({ data: friendIds });
      if (result.success) {
        console.log(`Successfully sent ${result.count} friend requests`);
        setSelectedUserIds(new Set());
      }
    } catch (error) {
      console.error('Error adding friends:', error);
    }
  };

  return (
    <div className="items-center justify-center flex flex-col p-4 container mx-auto gap-4">
      <h1 className='text-2xl font-bold'>Add Friends</h1>
      <Input
        className='bg-gray-900 p-3 w-full rounded'
        placeholder='Search users...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {selectedUsers.length > 0 && (
        <>
          <div className='w-full'>
            <div className='flex justify-between items-center mb-3'>
              <h2 className='text-lg font-semibold'>Selected users ({selectedUsers.length})</h2>
              <button
                onClick={handleAddFriends}
                className='bg-green-600 hover:bg-green-700 border border-green-600 p-2 rounded text-sm font-medium text-white transition-colors'
              >
                Send Friend Requests
              </button>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-rows-auto gap-4">
              {selectedUsers.map((user) => <UserCard key={user.id} user={user} isSelected={true} isAlreadyFriend={friendIds.has(user.id)} hasPendingRequest={pendingRequestIds.has(user.id)} isBlocked={blockedUserIds.has(user.id)} onToggle={() => toggleUserSelection(user.id)} />)}
            </div>
          </div>
        </>
      )}

      <div className='w-full'>
        <h2 className='text-lg font-semibold mb-3'>All users ({filteredUsers.length})</h2>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-rows-auto gap-4">
          {filteredUsers.map(user => <UserCard key={user.id} user={user} isSelected={false} isAlreadyFriend={friendIds.has(user.id)} hasPendingRequest={pendingRequestIds.has(user.id)} isBlocked={blockedUserIds.has(user.id)} onToggle={() => toggleUserSelection(user.id)} />)}
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, isSelected, isAlreadyFriend, hasPendingRequest, isBlocked, onToggle }: { user: any; isSelected: boolean; isAlreadyFriend: boolean; hasPendingRequest: boolean; isBlocked: boolean; onToggle: () => void }) {
  return (
    <Card className={`sm:max-w-sm flex flex-col rounded p-4 gap-2 cursor-pointer transition-all ${isSelected ? `border-blue-500 border-2 bg-blue-950/30` : `hover:border-gray-700`}`}>
      <div className='flex items-center gap-2 justify-between'>
        <div className='flex gap-2 items-center flex-1'>
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='text-sm font-medium flex-1'>
            {user.name}
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={isAlreadyFriend || hasPendingRequest || isBlocked}
          className={`border p-1 rounded text-xs font-medium transition-colors ${isSelected
            ? 'bg-blue-600 border-blue-600 text-white'
            : isBlocked
              ? 'bg-red-700 border-red-700 text-white cursor-not-allowed opacity-50'
              : isAlreadyFriend
                ? 'bg-green-500 border-green-500 text-white cursor-not-allowed opacity-90'
                : hasPendingRequest
                  ? 'bg-yellow-600 border-yellow-600 text-white cursor-not-allowed opacity-75'
                  : 'border-gray-600 hover:border-gray-500'
            }`}
        >
          {isBlocked ? 'Blocked' : isAlreadyFriend ? 'Friend' : hasPendingRequest ? 'Pending' : isSelected ? 'Remove' : 'Select'}
        </button>
      </div>
      <div className='flex flex-col gap-1 text-center'>
        <div>Last Online:time or Online</div>
      </div>
    </Card>
  )
}
