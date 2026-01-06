import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold">404</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Page not found
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/">
                        <Button className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
