import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { getAcceptedFriends } from '@/lib/server/functions';
import { useQuery } from '@tanstack/react-query';

interface Friend {
    id: string;
    name: string;
    image: string | null;
    email: string;
}

export function FriendsList() {
    const { data: friends = [], isLoading } = useQuery({
        queryKey: ['acceptedFriends'],
        queryFn: async () => {
            const data = await getAcceptedFriends();
            return data as Friend[];
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="border rounded p-4">
                <h2 className="text-lg font-semibold mb-3">Friends ({0})</h2>
                <div className="text-sm text-gray-400">Loading...</div>
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="border rounded p-4">
                <h2 className="text-lg font-semibold mb-3">Friends (0)</h2>
                <div className="text-sm text-gray-400">No friends yet. Add some!</div>
            </div>
        );
    }

    return (
        <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-3">Friends ({friends.length})</h2>
            <div className="flex flex-col gap-3">
                {friends.map((friend) => (
                    <Card key={friend.id} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={friend.image || ''} alt={friend.name} />
                                <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{friend.name}</div>
                                <div className="text-xs text-gray-400 truncate">{friend.email}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
