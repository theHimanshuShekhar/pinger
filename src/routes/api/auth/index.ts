import { auth } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const session = await auth.api.getSession({
                    headers: await request.headers
                });
                return new Response(JSON.stringify(session), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

        }
    }
})

