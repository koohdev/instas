"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  Volume2Icon,
  VolumeXIcon,
  RotateCcwIcon,
} from "lucide-react"
import { useSoundContext } from "@/components/sound-provider"

export function NavUser({
  user,
  onSyncStore,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  onSyncStore?: () => void
}) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { isMuted, toggleMute } = useSoundContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {onSyncStore && (
                <DropdownMenuItem onClick={onSyncStore} className="cursor-pointer">
                  <RotateCcwIcon className="size-4 text-primary" />
                  <span>Sync Store Data</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Sound Effects Toggle */}
              <DropdownMenuItem
                onClick={toggleMute}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeXIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <Volume2Icon className="size-4 text-primary" />
                  )}
                  <span className="text-xs font-medium">Sound Effects</span>
                </div>
                <Switch checked={!isMuted} onCheckedChange={toggleMute} />
              </DropdownMenuItem>

              {/* Dark Mode Toggle */}
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  {mounted && theme === "dark" ? (
                    <MoonIcon className="size-4 text-indigo-400" />
                  ) : (
                    <SunIcon className="size-4 text-amber-500" />
                  )}
                  <span className="text-xs font-medium">Dark Mode</span>
                </div>
                <Switch
                  checked={mounted && theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

