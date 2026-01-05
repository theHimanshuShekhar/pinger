import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Login with Discord</CardTitle>
          <CardDescription>
            Login to your Discord account below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button" className="cursor-pointer">
                  Login with <span className="font-bold text-[#7289da]">Discord</span>
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="https://discord.com/">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
