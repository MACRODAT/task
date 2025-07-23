"use client";

import { useState, useMemo, useEffect } from "react";
import type { Task } from "@/lib/data";
import { initialTasks, initialEntities, services as initialServices } from "@/lib/data";
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
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
        folderTasks = tasks.filter((task) => !task.done);
        break;
      case "classed":
        folderTasks = tasks.filter((task) => task.done);
        break;
      case "main":
      default:
        folderTasks = tasks;
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
  }, [tasks, activeFolder, filters, sort]);

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

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'done'>) => {
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
    
    if (taskToEdit) {
      setTasks(tasks.map((task) =>
        task.id === taskToEdit.id ? { ...taskToEdit, ...taskData, done: taskToEdit.done } : task
      ));
      toast({ title: "Task updated successfully!" });
    } else {
      const newTask: Task = {
        ...taskData,
        id: `TASK-${Math.floor(Math.random() * 10000)}`,
        done: false,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task added successfully!" });
    }
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveComment = (taskId: string, comments: string) => {
    handleUpdateTaskInline(taskId, { comments });
    setIsCommentModalOpen(false);
    setTaskToEdit(null);
    toast({ title: "Comment updated." });
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast({ title: "Task deleted", variant: "destructive" });
  };
  
  const handleUpdateTaskInline = (taskId: string, updates: Partial<Task>) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates } 
          : task
      )
    );
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
