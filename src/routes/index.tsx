import { FriendsList } from "@/components/friendslist";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  useAuthenticate();

  const { mutate } = useSendPushNotification();

  const handleSend = () => {
    mutate({
      recipientUserIds: ['we899lfxH1ZiHa0YUexkJQjKsO0T0NSd', 'maKwI37o2arnGWKUogR4pRvDEjInPTiW'],
      title: 'Hello!',
      message: 'This is a test notification.',
      icon: 'icon-url',
    });
  };

  return (
    <div className="grow items-center justify-center flex flex-col gap-4">
      <h1>Pinger!</h1>
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send Test Notification
      </button>
      <FriendsList />
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

