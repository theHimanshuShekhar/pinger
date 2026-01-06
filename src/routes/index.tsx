import { FriendsList } from "@/components/friendslist";
import { sendTestNotification } from "@/lib/push-notifications";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,

});

function App() {
  useAuthenticate();


  return (
    <div className="grow items-center justify-center flex flex-col gap-4">
      <h1>Pinger!</h1>

      <button onClick={() => sendTestNotification('Test Notification')} className="border p-1 rounded text-xs">Push a Notification!</button>
      <Link to="/pinger">Go to Pinger Page</Link>
      <Link to="/ping">Go to Ping Page</Link>
      <FriendsList />
    </div>
  );
}