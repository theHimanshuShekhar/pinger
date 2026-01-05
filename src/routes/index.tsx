import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="grow items-center justify-center flex flex-col gap-4">
      <h1>Pinger!</h1>
      <Link to="/login">Go to Login Page</Link>
      <Link to="/pinger">Go to Pinger Page</Link>
      <Link to="/ping">Go to Ping Page</Link>
    </div>
  );
}