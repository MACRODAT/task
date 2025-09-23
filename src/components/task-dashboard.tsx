'use client';

import { useState, useMemo } from "react";
import type { Task } from "@/lib/data";
import { initialEntities, services as initialServices } from "@/lib/data";
import { useFolders, getDb } from '@/lib/task-list'
import { Button } from "@/components/ui/button";
import { TaskList, type FilterState, type SortState } from "@/components/task-list";
import { TaskModal } from "@/components/task-modal";
import { FolderModal } from "@/components/folder-modal";
import { CommentModal } from "@/components/comment-modal";
import { SettingsModal } from "@/components/settings-modal";
import { PrintModal } from "@/components/print-modal"; // Import PrintModal
import { PlusCircle, XCircle, FolderEdit, Settings, Printer } from "lucide-react"; // Import Printer icon
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

interface TaskDashboardProps {
  tasks: Task[]; 
  filters: FilterState;
  sort: SortState;
  globalSearch: string;
  searchableFields: Array<keyof Task>;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onSortChange: (newSort: SortState) => void;
  onGlobalSearchChange: (value: string) => void;
  onSearchableFieldsChange: (fields: Array<keyof Task>) => void;
  onClearAllFilters: () => void;
}

export function TaskDashboard({
  tasks,
  filters,
  sort,
  globalSearch,
  searchableFields,
  onFilterChange,
  onSortChange,
  onGlobalSearchChange,
  onSearchableFieldsChange,
  onClearAllFilters,
}: TaskDashboardProps) {
  const folders_ = useFolders();
  const [entities, setEntities] = useState(initialEntities);
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // Add state for PrintModal
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const allSearchableFields: Array<keyof Task> = ["from", "service", "date", "details", "comments"];

  const folders = useMemo(() => folders_.map(f => ({ label: f.name, value: f.id })), [folders_]);
  
  const isAnyFilterActive =
    globalSearch !== '' ||
    Object.values(filters).some(value => value !== '' && value !== null) ||
    searchableFields.length !== allSearchableFields.length;

  const handleOpenModal = (task: Task | null) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };
  
  const handleOpenCommentModal = (task: Task) => {
    setTaskToEdit(task);
    setIsCommentModalOpen(true);
  };

  const handleOpenFolderModal = (folder: { id: string; name: string } | null) => {
    setFolderToEdit(folder);
    setIsFolderModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'done'>) => {
    const fromValue = taskData.from;
    if (fromValue && !entities.some(e => e.value === fromValue)) {
      setEntities(prev => [...prev, { value: fromValue, label: fromValue }]);
    }

    const serviceValue = taskData.service;
    if (serviceValue && !services.some(s => s.value === serviceValue)) {
      setServices(prev => [...prev, { value: serviceValue, label: serviceValue }]);
    }
    
    const db = await getDb();
    const dateValue = taskData.date instanceof Date ? taskData.date.getTime() : typeof taskData.date === 'string' ? new Date(taskData.date).getTime() : taskData.date;

    if (taskToEdit && taskToEdit.id) {
      await db.tasks.upsert({
        id: taskToEdit.id,
        ...taskData,
        date: dateValue,
        done: taskToEdit.done, 
      });
      toast({ title: "Task updated successfully!" });
    } else {
      await db.tasks.insert({
        ...taskData,
        date: dateValue,
        id: `TASK-${Math.floor(Math.random() * 10000)}`,
        done: false,
        folder: taskData.folder || 'ALL', 
      });
      toast({ title: "Task added successfully!" });
    }
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveComment = async (taskId: string, comments: string) => {
    const db = await getDb();
    const taskDoc = await db.tasks.findOne({ selector: { id: taskId } }).exec();
    if (taskDoc) {
        const oldData = taskDoc.toJSON();
        const newData = { ...oldData, comments };
        await db.tasks.upsert(newData);
    }
    setIsCommentModalOpen(false);
    setTaskToEdit(null);
    toast({ title: "Comment updated." });
  }

  const handleSaveFolder = async (folderName: string) => {
    const db = await getDb();
    if (folderToEdit) {
      await db.folders.upsert({ id: folderToEdit.id, name: folderName });
      toast({ title: "Folder updated successfully!" });
    } else {
      const newFolderId = folderName.toUpperCase().replace(/[^A-Z0-9]/g, '');
      await db.folders.insert({ id: newFolderId, name: folderName });
      toast({ title: "Folder added successfully!" });
    }
    setIsFolderModalOpen(false);
    setFolderToEdit(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const db = await getDb();
    const taskDoc = await db.tasks.findOne({ selector: { id: taskId } }).exec();
    if (taskDoc) {
      await taskDoc.remove();
      toast({ title: "Task deleted", variant: "destructive" });
    }
  };
  
  const handleUpdateTaskInline = async (taskId: string, updates: Partial<Task>) => {
    const db = await getDb();
    const taskDoc = await db.tasks.findOne({ selector: { id: taskId } }).exec();
    if (taskDoc) {
        const oldData = taskDoc.toJSON();
        const newData = { ...oldData, ...updates };
        await db.tasks.upsert(newData);
    }
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
            <Input
                placeholder="Search..."
                value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Filter Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {allSearchableFields.map(field => (
                        <DropdownMenuCheckboxItem
                            key={field}
                            checked={searchableFields.includes(field)}
                            onCheckedChange={(checked) => {
                                const newFields = checked ? [...searchableFields, field] : searchableFields.filter(f => f !== field);
                                onSearchableFieldsChange(newFields);
                            }}
                        >
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {isAnyFilterActive && (
              <Button variant="outline" onClick={onClearAllFilters}>
                <XCircle className="mr-2" />
                Clear Filters
              </Button>
            )}
            <Button onClick={() => setIsPrintModalOpen(true)}> {/* Add Print Button */}
              <Printer className="mr-2" />
              Print
            </Button>
            <Button onClick={() => handleOpenFolderModal(null)}>
              <FolderEdit className="mr-2" />
              Edit Folders
            </Button>
            <Button onClick={() => handleOpenModal(null)}>
              <PlusCircle className="mr-2" />
              Add Task
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
        </div>
        <TaskList 
            tasks={tasks}
            filters={filters}
            sort={sort}
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
            onEdit={task => handleOpenModal(task)}
            onEditComment={handleOpenCommentModal}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTaskInline}
        />
        <TaskModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSave={handleSaveTask}
            task={taskToEdit}
            entities={entities}
            services={services}
            folders={folders}
        />
        <CommentModal
            isOpen={isCommentModalOpen}
            onOpenChange={setIsCommentModalOpen}
            onSave={handleSaveComment}
            task={taskToEdit}
        />
        <FolderModal
            isOpen={isFolderModalOpen}
            onOpenChange={setIsFolderModalOpen}
            onSave={handleSaveFolder}
            folder={folderToEdit}
        />
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onOpenChange={setIsSettingsModalOpen}
        />
        <PrintModal // Render PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          tasks={tasks}
        />
    </div>
  );
}