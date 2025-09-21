
"use client";

import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuBadge } from "@/components/ui/sidebar";
import { TaskDashboard } from "@/components/task-dashboard";
import { Briefcase, Folder, FolderCheck, FolderClock } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTasks, useFolders } from '@/lib/task-list';
import type { Task } from "@/lib/data";
import { type FilterState, type SortState } from "@/components/task-list";
import { format } from "date-fns";

const FOLDER_NAMES: { [key: string]: string } = {
  main: "Tout les messages",
  instance: "En instance",
  classed: "Classé",
};

export default function Home() {
  const allTasks = useTasks();
  const folders = useFolders();
  const [activeFolder, setActiveFolder] = useState<string>("main");

  const [filters, setFilters] = useState<FilterState>({ from: "", txt: "", date: null, details: "", service: "" });
  const [globalSearch, setGlobalSearch] = useState("");
  const allSearchableFields: Array<keyof Task> = ["from", "service", "date", "details", "comments"];
  const [searchableFields, setSearchableFields] = useState<Array<keyof Task>>(allSearchableFields);
  const [sort, setSort] = useState<SortState>({ column: null, direction: null });

  const handleFilterChange = (newFilters: Partial<FilterState>) => setFilters(prev => ({...prev, ...newFilters}));
  const handleSortChange = (newSort: SortState) => setSort(newSort);
  const handleGlobalSearchChange = (value: string) => setGlobalSearch(value);
  const handleSearchableFieldsChange = (fields: Array<keyof Task>) => setSearchableFields(fields);

  const clearAllFilters = () => {
    setFilters({ from: "", txt: "", date: null, details: "", service: "" });
    setGlobalSearch("");
    setSearchableFields(allSearchableFields);
  };

  const processedTasks = useMemo(() => {
    let filteredTasks: Task[];

    const parts = activeFolder.split('-');
    const type = parts[0];
    const folderId = parts.length > 1 ? parts.slice(1).join('-') : null;

    if (folderId) {
      const baseFolderTasks = allTasks.filter((task: Task) => task.folder === folderId);
      if (type === 'instance') {
        filteredTasks = baseFolderTasks.filter((task: Task) => !task.done);
      } else if (type === 'classed') {
        filteredTasks = baseFolderTasks.filter((task: Task) => task.done);
      } else { // main
        filteredTasks = baseFolderTasks;
      }
    } else {
      if (activeFolder === "instance") {
        filteredTasks = allTasks.filter((task: Task) => !task.done);
      } else if (activeFolder === "classed") {
        filteredTasks = allTasks.filter((task: Task) => task.done);
      } else { // main
        filteredTasks = allTasks;
      }
    }

    const searched = filteredTasks.filter(task => {
        if (globalSearch) {
          const found = searchableFields.some(field => {
            const value = task[field as keyof Task];
            if (!value) return false;
            if (field === 'date') {
              try {
                const date = new Date(value as string | number | Date);
                return !isNaN(date.getTime()) && format(date, 'yyyy-MM-dd').includes(globalSearch);
              } catch { return false; }
            }
            return typeof value === 'string' && value.toLowerCase().includes(globalSearch.toLowerCase());
          });
          if (!found) return false;
        }

        const fromMatch = filters.from ? new RegExp(filters.from.replace(/\*/g, '.*'), 'i').test(task.from) : true;
        const txtMatch = filters.txt ? new RegExp(filters.txt.replace(/\*/g, '.*'), 'i').test(task.txt) : true;
        const detailsMatch = filters.details ? new RegExp(filters.details.replace(/\*/g, '.*'), 'i').test(task.details || '') : true;
        const serviceMatch = filters.service ? new RegExp(filters.service.replace(/\*/g, '.*'), 'i').test(task.service) : true;
        let dateMatch = true;
        if (filters.date) {
          try {
            dateMatch = task.date && !isNaN(new Date(task.date).getTime()) && format(new Date(task.date), 'yyyy-MM-dd') === format(filters.date, 'yyyy-MM-dd');
          } catch { dateMatch = false; }
        }
        return fromMatch && txtMatch && detailsMatch && dateMatch && serviceMatch;
      });

    if (sort.column && sort.direction) {
        return [...searched].sort((a, b) => {
            const aValue = a[sort.column as keyof Task];
            const bValue = b[sort.column as keyof Task];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (sort.column === 'date') {
              const aTime = a.date && !isNaN(new Date(a.date).getTime()) ? new Date(a.date).getTime() : 0;
              const bTime = b.date && !isNaN(new Date(b.date).getTime()) ? new Date(b.date).getTime() : 0;
              comparison = aTime - bTime;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                comparison = aValue === bValue ? 0 : (aValue ? -1 : 1);
            }

            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }

    return searched;
  }, [allTasks, activeFolder, filters, sort, globalSearch, searchableFields]);

  const getTitle = () => {
    const parts = activeFolder.split('-');
    const type = parts[0];
    const folderId = parts.length > 1 ? parts.slice(1).join('-') : null;

    const folder = folderId ? folders.find(f => f.id === folderId) : null;
    
    let folderName = FOLDER_NAMES[activeFolder]; // For main, instance, classed

    if (folder) {
        const typeName = FOLDER_NAMES[type];
        folderName = typeName ? `${typeName}: ${folder.name}` : folder.name;
    } else if (!folderName) {
        folderName = "Liste de taches"
    }

    return `${folderName}`;
  }

  const folderTaskCounts = useMemo(() => {
    const counts: { [key: string]: { main: number; instance: number; classed: number } } = {};
    folders.forEach(folder => {
      counts[folder.id] = { main: 0, instance: 0, classed: 0 };
    });

    allTasks.forEach((task: Task) => {
      const folderId = task.folder || 'ALL';
      if (counts[folderId]) {
        counts[folderId].main++;
        if (task.done) {
          counts[folderId].classed++;
        } else {
          counts[folderId].instance++;
        }
      }
    });

    return counts;
  }, [allTasks, folders]);

  const totalTaskCounts = useMemo(() => {
    let main = 0;
    let instance = 0;
    let classed = 0;
    allTasks.forEach((task: Task) => {
      main++;
      if (task.done) {
        classed++;
      } else {
        instance++;
      }
    });
    return { main, instance, classed };
  }, [allTasks]);

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
                <SidebarMenuBadge>{totalTaskCounts.main}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarMenuSub>
                {folders.map((folder) => (
                  <SidebarMenuSubItem key={folder.id}>
                    <SidebarMenuSubButton isActive={activeFolder === `main-${folder.id}`} onClick={() => setActiveFolder(`main-${folder.id}`)}>
                      <Folder />
                      {folder.name}
                      <SidebarMenuBadge>{folderTaskCounts[folder.id]?.main || 0}</SidebarMenuBadge>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroup>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeFolder === 'instance'} onClick={() => setActiveFolder('instance')}>
                <FolderClock />
                INSTANCE
                <SidebarMenuBadge>{totalTaskCounts.instance}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarMenuSub>
                {folders.map((folder) => (
                  <SidebarMenuSubItem key={folder.id}>
                    <SidebarMenuSubButton isActive={activeFolder === `instance-${folder.id}`} onClick={() => setActiveFolder(`instance-${folder.id}`)}>
                      <FolderClock />
                      {folder.name}
                      <SidebarMenuBadge>{folderTaskCounts[folder.id]?.instance || 0}</SidebarMenuBadge>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroup>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeFolder === 'classed'} onClick={() => setActiveFolder('classed')}>
                <FolderCheck />
                CLASSED
                <SidebarMenuBadge>{totalTaskCounts.classed}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarMenuSub>
                {folders.map((folder) => (
                  <SidebarMenuSubItem key={folder.id}>
                    <SidebarMenuSubButton isActive={activeFolder === `classed-${folder.id}`} onClick={() => setActiveFolder(`classed-${folder.id}`)}>
                      <FolderCheck />
                      {folder.name}
                      <SidebarMenuBadge>{folderTaskCounts[folder.id]?.classed || 0}</SidebarMenuBadge>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroup>
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
                <span className="font-headline">{getTitle()} ({processedTasks.length})</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <TaskDashboard 
            tasks={processedTasks} 
            filters={filters}
            sort={sort}
            globalSearch={globalSearch}
            searchableFields={searchableFields}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onGlobalSearchChange={handleGlobalSearchChange}
            onSearchableFieldsChange={handleSearchableFieldsChange}
            onClearAllFilters={clearAllFilters}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
