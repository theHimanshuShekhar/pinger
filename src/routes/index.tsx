import { FriendsList } from "@/components/friendslist";
import { PendingFriendRequests } from "@/components/pending-friend-requests";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPendingFriendRequests } from "@/lib/server/functions";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  useAuthenticate();

  const { mutate } = useSendPushNotification();

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pendingFriendRequests'],
    queryFn: async () => await getPendingFriendRequests(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 10, // 1 minute
  });

  const hasPendingRequests = pendingRequests.length > 0;

  const handleSend = () => {
    mutate({
      recipientUserIds: ['we899lfxH1ZiHa0YUexkJQjKsO0T0NSd', 'maKwI37o2arnGWKUogR4pRvDEjInPTiW'],
      title: 'Hello!',
      message: 'This is a test notification.',
      icon: 'icon-url',
    });
  };

  return (
    <div className="grow items-center justify-center flex flex-col gap-8">
      <div className={`grid ${hasPendingRequests ? 'grid-cols-3' : 'grid-cols-1'} grow w-full h-full place-items-center`}>
        <div className="flex flex-col gap-4 col-span-2 p-4 h-full w-full">
          <button
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl transition-colors shadow-lg rounded"
          >
            Create a PINGER!
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send Test Notification
          </button>
          <FriendsList />
        </div>
        {hasPendingRequests && (
          <div className="w-full h-full border-2">
            <PendingFriendRequests />
          </div>
        )}
      </div>

    </div>
  );
}

const sendPushNotification = async (data: {
  recipientUserIds: string[];
  title: string;
  message?: string;
  icon?: string;
}) => {
  const response = await fetch("/api/push/send-to-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export function useSendPushNotification() {
  return useMutation({
    mutationFn: sendPushNotification,
  });
}

