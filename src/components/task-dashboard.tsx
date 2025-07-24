"use client";

import { useState, useMemo, useEffect } from "react";
import type { Task } from "@/lib/data";
import { initialEntities, services as initialServices } from "@/lib/data";
import { useTasks, getDb } from '@/lib/task-list'
import { Button } from "@/components/ui/button";
import { TaskList, type FilterState, type SortState } from "@/components/task-list";
import { TaskModal } from "@/components/task-modal";
import { CommentModal } from "@/components/comment-modal";
import { PlusCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TaskDashboardProps {
  activeFolder: string;
  onTaskCountChange: (count: number) => void;
}

export function TaskDashboard({ activeFolder, onTaskCountChange }: TaskDashboardProps) {
  const tasks_: Task[] = useTasks();
  const [entities, setEntities] = useState(initialEntities);
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({
    from: "",
    txt: "",
    date: null,
    details: "",
    service: "",
  });

  const [sort, setSort] = useState<SortState>({ column: null, direction: null });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  };

  const handleSortChange = (newSort: SortState) => {
    setSort(newSort);
  }
  
  const clearFilters = () => {
    setFilters({ from: "", txt: "", date: null, details: "", service: "" });
  };
  
  const isAnyFilterActive = Object.values(filters).some(value => value !== "" && value !== null);

  const processedTasks = useMemo(() => {
    let folderTasks: Task[];
    switch (activeFolder) {
      case "instance":
        folderTasks = tasks_
          .filter((task) => !task.done);
        break;
      case "classed":
        folderTasks = tasks_.filter((task) => task.done);
        break;

      case "main":
      default:
        folderTasks = tasks_;
    }

    const filtered = folderTasks.filter(task => {
        const fromMatch = filters.from
          ? new RegExp(filters.from.replace(/\*/g, '.*'), 'i').test(task.from)
          : true;
        const txtMatch = filters.txt
          ? new RegExp(filters.txt.replace(/\*/g, '.*'), 'i').test(task.txt)
          : true;
        const detailsMatch = filters.details
          ? new RegExp(filters.details.replace(/\*/g, '.*'), 'i').test(task.details || '')
          : true;
        const serviceMatch = filters.service
          ? new RegExp(filters.service.replace(/\*/g, '.*'), 'i').test(task.service)
          : true;
        let dateMatch = true;
        if (filters.date) {
          try {
            if (
              !task.date ||
              isNaN(new Date(task.date).getTime()) ||
              format(new Date(task.date), 'yyyy-MM-dd') !== format(filters.date, 'yyyy-MM-dd')
            ) {
              dateMatch = false;
            }
          } catch (e) {
            console.error('Invalid date in task:', task, e);
            dateMatch = false;
          }
        }
        return fromMatch && txtMatch && detailsMatch && dateMatch && serviceMatch;
      });

    if (sort.column && sort.direction) {
      return [...filtered].sort((a, b) => {
        const aValue = a[sort.column as keyof Task];
        const bValue = b[sort.column as keyof Task];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
        }


        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    if(activeFolder === 'instance') {
        return filtered.sort((a, b) => {
          let aTime = 0;
          let bTime = 0;
          try {
            aTime = a.date && !isNaN(new Date(a.date).getTime()) ? new Date(a.date).getTime() : 0;
          } catch (e) {
            console.error('Invalid date in task (a):', a, e);
            aTime = 0;
          }
          try {
            bTime = b.date && !isNaN(new Date(b.date).getTime()) ? new Date(b.date).getTime() : 0;
          } catch (e) {
            console.error('Invalid date in task (b):', b, e);
            bTime = 0;
          }
          return aTime - bTime;
        });
    }

    return filtered;

  }, [tasks_, activeFolder, filters, sort]);

  useEffect(() => {
    onTaskCountChange(processedTasks.length);
  }, [processedTasks, onTaskCountChange]);

  const handleOpenModal = (task: Task | null) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };
  
  const handleOpenCommentModal = (task: Task) => {
    setTaskToEdit(task);
    setIsCommentModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'done'>) => {
    console.log(taskData);
    const fromValue = taskData.from;
    if (fromValue && !entities.some(e => e.value === fromValue)) {
      const newEntity = { value: fromValue, label: fromValue };
      setEntities(prev => [...prev, newEntity]);
    }

    const serviceValue = taskData.service;
    if (serviceValue && !services.some(s => s.value === serviceValue)) {
      const newService = { value: serviceValue, label: serviceValue };
      setServices(prev => [...prev, newService]);
    }
    
    const db = await getDb();

    console.log(taskData)

    const dateValue = taskData.date instanceof Date
      ? taskData.date.getTime()
      : typeof taskData.date === 'string'
        ? new Date(taskData.date).getTime()
        : taskData.date;
    console.log(dateValue)
    // No setTasks needed, handled by DB and useTasks
    if (taskToEdit && taskToEdit.id) {
      await db.tasks.upsert({
        id: taskToEdit.id,
        from: taskData.from,
        service: taskData.service,
        txt: taskData.txt,
        date: dateValue,
        comments: taskData.comments,
        details: taskData.details,
        done: taskToEdit.done
      });
      toast({ title: "Task updated successfully!" });
    } else {
      const newTask: Task = {
        ...taskData,
        date: dateValue, // <-- This is always a number (timestamp)
        id: `TASK-${Math.floor(Math.random() * 10000)}`,
        done: false,
      };
      await db.tasks.insert(newTask);
      toast({ title: "Task added successfully!" });
    }
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveComment = async (taskId: string, comments: string) => {
    await handleUpdateTaskInline(taskId, { comments });
    setIsCommentModalOpen(false);
    setTaskToEdit(null);
    toast({ title: "Comment updated." });
  }

  const handleDeleteTask = async (taskId: string) => {
    const db = await getDb();
    const taskDoc = await db.tasks.findOne({ selector: { id: taskId } }).exec();
    if (taskDoc) {
      await taskDoc.remove();
      toast({ title: "Task deleted", variant: "destructive" });
    }
    // No setTasks needed, handled by DB and useTasks
  };
  
  const handleUpdateTaskInline = async (taskId: string, updates: Partial<Task>) => {
    const db = await getDb();
    const taskDoc = await db.tasks.findOne({ selector: { id: taskId } }).exec();
    if (taskDoc) {
      await taskDoc.patch(updates);
    }
    // No setTasks needed, handled by DB and useTasks
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {isAnyFilterActive && (
          <Button variant="outline" onClick={clearFilters}>
            <XCircle className="mr-2" />
            Clear Filters
          </Button>
        )}
        <Button onClick={() => handleOpenModal(null)}>
          <PlusCircle className="mr-2" />
          Add Task
        </Button>
      </div>
      <TaskList 
        tasks={processedTasks}
        filters={filters}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
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
      />
      <CommentModal
        isOpen={isCommentModalOpen}
        onOpenChange={setIsCommentModalOpen}
        onSave={handleSaveComment}
        task={taskToEdit}
      />
    </div>
  );
}
