import { Link } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface HeaderProps {
  title?: string
}

export function Header({ title = "Pinger!" }: HeaderProps) {
  return (
    <header className="w-full border-b border-muted bg-background/50 backdrop-blur-sm">
      <div className="mx-auto flex justify-between h-14 max-w-7xl items-center gap-4 px-4">
        <Link  to="/" className="flex items-center gap-3">
          <div className="text-3xl font-semibold">{title}</div>
        </Link>

        <div className="flex items-center gap-2">
           <Avatar className="size-12">
            <AvatarImage
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

export default Header
