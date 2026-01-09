'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, blockFriendRequest } from '@/lib/server/functions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PendingRequest {
    id: string;
    name: string;
    image: string | null;
    email: string;
}

export function PendingFriendRequests() {
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['pendingFriendRequests'],
        queryFn: async () => {
            const data = await getPendingFriendRequests();
            return data as PendingRequest[];
        },
        staleTime: 1000 * 30, // 1 minute
        refetchInterval: 1000 * 10, // 30 seconds
    });

    const acceptMutation = useMutation({
        mutationFn: (friendId: string) => acceptFriendRequest({ data: friendId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (friendId: string) => rejectFriendRequest({ data: friendId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
        },
    });

    const blockMutation = useMutation({
        mutationFn: (friendId: string) => blockFriendRequest({ data: friendId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
        },
    });

    const handleAccept = (friendId: string) => {
        acceptMutation.mutate(friendId);
    };

    const handleReject = (friendId: string) => {
        rejectMutation.mutate(friendId);
    };

    const handleBlock = (friendId: string) => {
        blockMutation.mutate(friendId);
    };

    if (isLoading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    if (requests.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Pending Requests ({requests.length})</h2>
            {requests.map((request) => (
                <Card key={request.id} className="p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={request.image || ''} alt={request.name} />
                            <AvatarFallback>{request.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{request.name}</div>
                            <div className="text-xs text-gray-400 truncate">{request.email}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-between">
                        <button
                            onClick={() => handleAccept(request.id)}
                            disabled={acceptMutation.isPending}
                            className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(request.id)}
                            disabled={rejectMutation.isPending}
                            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleBlock(request.id)}
                            disabled={blockMutation.isPending}
                            className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
                        >
                            Block
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
