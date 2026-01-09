import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query';
import { NotFound } from './components/not-found';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

// Create a new router instance
export const getRouter = () => {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 minute
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      user: null,
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => <NotFound />,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router;
}
