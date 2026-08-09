"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, SlidersHorizontal, ImagePlay, ImageIcon, Type, FolderCheck } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Analytics",
      url: "#",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      title: "Projects",
      url: "#",
      icon: (
        <FolderIcon
        />
      ),
    },
    {
      title: "Team",
      url: "#",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ 
  activeTab, 
  setActiveTab, 
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  activeTab: string; 
  setActiveTab: (val: string) => void;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! gap-2"
              render={<a href="#" />}
            >
              <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <CommandIcon className="size-4!" />
              </div>
              <span className="text-base font-extrabold tracking-wider">INSTAS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main App Navigation */}
        <SidebarMenu className="px-2 mt-4 gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "studio"}
              onClick={() => setActiveTab("studio")}
              render={<button />}
            >
              <LayoutDashboardIcon />
              <span>Studio Generator</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "outputs"}
              onClick={() => setActiveTab("outputs")}
              render={<button />}
            >
              <FolderCheck />
              <span>Outputs Gallery</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
              render={<button />}
            >
              <SlidersHorizontal />
              <span>Design Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "backgrounds"}
              onClick={() => setActiveTab("backgrounds")}
              render={<button />}
            >
              <ImageIcon />
              <span>Custom Backgrounds</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeTab === "fonts"}
              onClick={() => setActiveTab("fonts")}
              render={<button />}
            >
              <Type />
              <span>Custom Fonts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <NavDocuments
          groupLabel="Archive"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          items={[
            { id: "urls-db", name: "Library", url: "#", icon: <DatabaseIcon /> }
          ]}
        />
        
        <NavSecondary items={[
          { title: "Settings", url: "#", icon: <Settings2Icon /> },
          { title: "Get Help", url: "#", icon: <CircleHelpIcon /> },
          { title: "Search", url: "#", icon: <SearchIcon /> }
        ]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: "Admin",
          email: "admin@instascrape.app",
          avatar: ""
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
