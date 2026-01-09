import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '../components/header'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/providers'
import { QueryClient } from '@tanstack/react-query'
import { getUser } from '@/lib/server/functions'
import { useEffect } from 'react'
import { initializePushNotifications } from '@/lib/push-notifications'
import { NotFound } from '@/components/not-found'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>;
}>()({
  beforeLoad: async ({ context }) => {
    context.queryClient = new QueryClient();
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

  // Initialize push notifications after user is authenticated
  useEffect(() => {
    console.log('User ID in RootComponent:', user?.id);
    if (user?.id) {
      initializePushNotifications(user.id).catch((error) => {
        console.warn('Failed to initialize push notifications:', error);
      });
    }
  }, [user?.id]);

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
