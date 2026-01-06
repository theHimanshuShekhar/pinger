import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { Header } from '../components/header'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Pinger!',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          <div className="flex-col min-h-screen flex grow">
            <Header title="Pinger!" />
            <div className='flex grow'>
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
