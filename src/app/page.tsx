
"use client";

import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { TaskDashboard } from "@/components/task-dashboard";
import { Briefcase, Folder, FolderCheck, FolderClock } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

const FOLDER_NAMES: { [key: string]: string } = {
  main: "Tout les messages",
  instance: "En instance",
  classed: "Classé",
};

export default function Home() {
  const [activeFolder, setActiveFolder] = useState<string>("main");
  const [taskCount, setTaskCount] = useState<number>(0);

  const getTitle = () => {
    const folderName = FOLDER_NAMES[activeFolder] || "Liste de taches";
    return `${folderName} (${taskCount})`;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 text-lg font-semibold">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-headline">Classes de taches</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeFolder === 'main'} onClick={() => setActiveFolder('main')}>
                <Folder />
                MAIN
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeFolder === 'instance'} onClick={() => setActiveFolder('instance')}>
                <FolderClock />
                INSTANCE
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeFolder === 'classed'} onClick={() => setActiveFolder('classed')}>
                <FolderCheck />
                CLASSED
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-4">
              <div className="block md:hidden">
                  <SidebarTrigger />
              </div>
              <h1 className="text-lg font-semibold">
                <span className="font-headline">{getTitle()}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <TaskDashboard activeFolder={activeFolder} onTaskCountChange={setTaskCount} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
