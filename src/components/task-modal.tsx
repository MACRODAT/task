
"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Task } from "@/lib/data";
import { taskSchema } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/datepicker";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (taskData: Omit<Task, 'id' | 'done'>) => void;
  task: Task | null;
  entities: { label: string; value: string }[];
  services: { label: string; value: string }[];
}

export function TaskModal({ isOpen, onOpenChange, onSave, task, entities, services }: TaskModalProps) {
  const form = useForm<Omit<Task, 'id' | 'done'>>({
    resolver: zodResolver(taskSchema.omit({ id: true, done: true})),
    defaultValues: {
      from: "",
      service: "",
      txt: "",
      date: undefined,
      comments: "",
      details: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        form.reset({
          from: task.from,
          service: task.service,
          txt: task.txt,
          date: task.date,
          comments: task.comments,
          details: task.details,
        });
      } else {
        form.reset({
          from: "SECMAR",
          service: "",
          txt: "",
          date: new Date(),
          comments: "",
          details: "",
        });
      }
    }
  }, [task, form, isOpen]);
  
  const handleTxtKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
        const value = e.currentTarget.value;
        const parts = value.split('/');
        
        if (parts.length === 1 && parts[0].length > 0) {
            const firstPart = parts[0].padStart(3, '0');
            form.setValue('txt', `${firstPart}/`);
            e.preventDefault(); 
        }
    }
  }, [form]);
  
  const handleTxtBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parts = value.split('/');
    if(parts.length > 0 && parts[0].length > 0 && parts[0].length < 3) {
      const firstPart = parts[0].padStart(3, '0');
      const restOfParts = parts.slice(1);
      form.setValue('txt', [firstPart, ...restOfParts].join('/'));
    }
  }, [form]);

  const onSubmit = (data: Omit<Task, 'id' | 'done'>) => {
    const datePart = format(data.date, 'ddMMyy');
    const txtParts = data.txt.split('/');
    if (txtParts.length === 3) {
      txtParts[2] = datePart;
      data.txt = txtParts.join('/');
    } else if (txtParts.length === 2) {
      data.txt = `${txtParts[0]}/${txtParts[1]}/${datePart}`;
    }
    
    onSave(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg h-5/6 flex flex-col">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FROM</FormLabel>
                    <FormControl>
                       <Combobox
                        options={entities}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select entity..."
                        emptyText="No entity found. Type to create a new one."
                        allowCustom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SERVICE</FormLabel>
                    <FormControl>
                      <Combobox
                        options={services}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select service..."
                        emptyText="No service found. Type to create new one."
                        allowCustom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="txt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TXT</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 123/ABC/010124"
                        {...field}
                        onKeyDown={handleTxtKeyDown}
                        onBlur={handleTxtBlur}
                        className="font-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DATE</FormLabel>
                    <FormControl>
                       <DatePicker
                         value={field.value}
                         onChange={field.onChange}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex-1 grid gap-4">
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>DETAILS</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add all the details (max 200 chars)..."
                          {...field}
                          className="flex-1 h-[50%]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
