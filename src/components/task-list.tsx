
"use client";

import React from "react";
import type { Task } from "@/lib/data";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterPopover } from "@/components/filter-popover";
import { Textarea } from "@/components/ui/textarea";

export interface FilterState {
  from: string;
  txt: string;
  date: Date | null;
  details: string;
  service: string;
}

export interface SortState {
    column: string | null;
    direction: 'asc' | 'desc' | null;
}

interface TaskListProps {
  tasks: Task[];
  filters: FilterState;
  sort: SortState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onSortChange: (newSort: SortState) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onEdit: (task: Task) => void;
  onEditComment: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const serviceColorMap: { [key: string]: string } = {
  PROP: "bg-service-prop",
  ELEC: "bg-service-elec",
  CHAUD: "bg-service-chaud",
  SIC: "bg-service-sic",
};

export function TaskList({ tasks, filters, sort, onFilterChange, onSortChange, onUpdate, onEdit, onEditComment, onDelete }: TaskListProps) {
  const getServiceColorClass = (service: string) => {
    return serviceColorMap[service] || "";
  };

  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    if (sort.column === column && sort.direction === direction) {
        onSortChange({ column: null, direction: null });
    } else {
        onSortChange({ column, direction });
    }
  }

  const formatDateWithTryCatch = (date: any): string => {
    try {
      // Attempt to format the date
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      // If format() throws an error, return a fallback string
      console.error("Failed to format date:", error);
      return "Invalid Date";
    }
  };
  

  return (
    <>
      {/* Desktop View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">DONE</TableHead>
              <TableHead>
                <FilterPopover
                  column="from"
                  label="FROM"
                  value={filters.from}
                  sortDirection={sort.column === 'from' ? sort.direction : null}
                  onFilterChange={(value) => onFilterChange({ from: value as string })}
                  onSortChange={(direction) => handleSort('from', direction)}
                />
              </TableHead>
              <TableHead>
                <FilterPopover
                  column="txt"
                  label="TXT"
                  value={filters.txt}
                  sortDirection={sort.column === 'txt' ? sort.direction : null}
                  onFilterChange={(value) => onFilterChange({ txt: value as string })}
                  onSortChange={(direction) => handleSort('txt', direction)}
                />
              </TableHead>
              <TableHead>
                <FilterPopover
                  column="date"
                  label="DATE"
                  value={filters.date}
                  onFilterChange={(value) => onFilterChange({ date: value as Date | null })}
                  sortDirection={sort.column === 'date' ? sort.direction : null}
                  onSortChange={(direction) => handleSort('date', direction)}
                  isDatePicker
                />
              </TableHead>
              <TableHead>
                <FilterPopover
                  column="service"
                  label="SERVICE"
                  value={filters.service}
                  sortDirection={sort.column === 'service' ? sort.direction : null}
                  onFilterChange={(value) => onFilterChange({ service: value as string })}
                  onSortChange={(direction) => handleSort('service', direction)}
                />
              </TableHead>
              <TableHead>COMMENTS</TableHead>
              <TableHead className="w-[100px] text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <TableRow
                  className={cn(task.done ? "bg-muted/50" : getServiceColorClass(task.service), "border-b-0")}
                  onDoubleClick={() => onEdit(task)}
                >
                  <TableCell className="py-1 align-top">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={(checked) =>
                        onUpdate(task.id, { done: !!checked })
                      }
                      aria-label={`Mark task ${task.txt} as ${task.done ? 'not done' : 'done'}`}
                    />
                  </TableCell>
                  <TableCell className="py-1 align-top">{task.from}</TableCell>
                  <TableCell className="py-1 align-top">
                    <span className="font-code">{task.txt}</span>
                  </TableCell>
                  <TableCell className="py-1 align-top">{formatDateWithTryCatch(task.date)}</TableCell>
                  <TableCell className="py-1 align-top">
                    <Badge variant="secondary">{task.service}</Badge>
                  </TableCell>
                  <TableCell className="py-1" onDoubleClick={(e) => { e.stopPropagation(); onEditComment(task); }}>
                    <Textarea
                      value={task.comments}
                      onChange={(e) =>
                        onUpdate(task.id, { comments: e.target.value })
                      }
                      className="h-full w-full bg-transparent"
                      aria-label={`Comments for task ${task.txt}`}
                      rows={1}
                    />
                  </TableCell>
                  <TableCell className="py-1 text-right align-top">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Task</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                       <span className="sr-only">Delete Task</span>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className={cn(task.done ? "bg-muted/50" : getServiceColorClass(task.service), 'border-t-4 border-transparent')}>
                   <TableCell colSpan={7} className="py-1 text-base text-muted-foreground pt-0">
                      <p className="ml-8 text-lg my-2">{task.details}</p>
                   </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {tasks.map((task) => (
          <Card key={task.id} className={cn(task.done ? "bg-muted/50" : getServiceColorClass(task.service))}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-code text-base">{task.txt}</span>
                 <Checkbox
                    checked={task.done}
                    onCheckedChange={(checked) =>
                      onUpdate(task.id, { done: !!checked })
                    }
                    aria-label={`Mark task ${task.txt} as ${task.done ? 'not done' : 'done'}`}
                  />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div><strong>From:</strong> {task.from}</div>
                <div><strong>Service:</strong> <Badge variant="secondary">{task.service}</Badge></div>
                <div><strong>Date:</strong> {formatDateWithTryCatch(task.date)}</div>
                <div onDoubleClick={() => onEditComment(task)}>
                   <Textarea
                    value={task.comments}
                    onChange={(e) =>
                      onUpdate(task.id, { comments: e.target.value })
                    }
                    placeholder="Comments..."
                    aria-label={`Comments for task ${task.txt}`}
                  />
                </div>
                 <div className="space-y-1">
                  <strong>Details:</strong>
                  <p className="text-muted-foreground p-2 text-lg my-2">{task.details}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
               <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
