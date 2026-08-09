"use client"

import React from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  groupLabel = "Archive",
  activeTab,
  setActiveTab,
  items,
}: {
  groupLabel?: string
  activeTab?: string
  setActiveTab?: (val: string) => void
  items: {
    id?: string
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              isActive={item.id ? activeTab === item.id : false}
              onClick={() => {
                if (item.id && setActiveTab) {
                  setActiveTab(item.id)
                }
              }}
              render={<button />}
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
