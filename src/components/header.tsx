import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from '@hugeicons/react';
import { GameController03FreeIcons } from '@hugeicons/core-free-icons'; import { UserButton } from "@daveyplate/better-auth-ui";

interface HeaderProps {
  title?: string
}

export function Header({ title = "Pinger!" }: HeaderProps) {
  return (
    <header className="w-full border-b border-muted bg-background/50 backdrop-blur-sm">
      <div className="mx-auto flex justify-between h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-1">
          <HugeiconsIcon
            icon={GameController03FreeIcons}
            strokeWidth={2}
            className="size-8 text-primary"
          />
          <div className="text-3xl font-semibold">{title}</div>
        </Link>

        <div className="flex items-center gap-2">
          <UserButton className="bg-background text-primary" />
        </div>
      </div>
    </header>
  )
}

export default Header
