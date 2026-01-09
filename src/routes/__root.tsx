import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '../components/header'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/providers'
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getUser } from '@/lib/server/functions'
import { initializePushNotifications } from '@/lib/push-notifications'
import { NotFound } from '@/components/not-found'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>;
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: ({ signal }) => getUser({ signal }),
    }); // we're using react-query for caching, see router.tsx

    return { user };
  },
  loader: ({ context }) => {
    return { user: context.user };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "BhayanakCast",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootComponent,
});

function RootComponent({ children }: { children: React.ReactNode }) {
  const { user } = Route.useLoaderData();

  // Use React Query to periodically check and initialize push notifications
  useSuspenseQuery({
    queryKey: ['pushNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID not available');
      }
      console.log('Checking/initializing push notifications for user:', user.id);
      await initializePushNotifications(user.id);
      return { success: true };
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 0, // Always consider the data stale to force refetch
    retry: 1, // Retry once on failure
  });

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen min-w-sm flex flex-col bg-background text-foreground">
        <Providers>
          <div className="flex-col min-h-screen flex grow">
            <Header title="Pinger!" user={user} />
            <div className='flex flex-col grow'>
              {children}
              <Toaster />
            </div>
          </div>
        </Providers>
        <Scripts />
      </body>
    </html >
  )
}
