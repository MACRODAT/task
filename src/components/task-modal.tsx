"use client";

import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Task } from "@/lib/data";
import { taskSchema } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { DateInput } from "@/components/ui/date-input";
import { parse, format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (taskData: Omit<Task, "id" | "done">) => void;
  task: Task | null;
  entities: { label: string; value: string }[];
  services: { label: string; value: string }[];
  folders: { label: string; value: string }[];
}

const modalSchema = taskSchema
  .omit({ id: true, done: true, txt: true, from: true, date: true })
  .extend({
    txtNumber: z.string().min(1, "Number is required."),
    txtFrom: z.string().min(1, "From is required."),
    txtDate: z.string().length(6, "Date must be in ddMMyy format."),
  });

type ModalTask = z.infer<typeof modalSchema>;

export function TaskModal({
  isOpen,
  onOpenChange,
  onSave,
  task,
  entities,
  services,
  folders,
}: TaskModalProps) {
  const form = useForm<ModalTask>({
    resolver: zodResolver(modalSchema),
    defaultValues: {
      txtNumber: "",
      txtFrom: "SECMAR",
      txtDate: format(new Date(), 'ddMMyy'),
      service: "PROP",
      comments: "RAS.",
      details: "",
      folder: "ALL",
    },
  });
  
  const fromComboboxRef = useRef<{ focus: () => void }>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        const txtParts = task.txt.split('/');
        form.reset({
          service: task.service,
          comments: task.comments,
          details: task.details,
          folder: task.folder,
          txtNumber: txtParts[0] || "",
          txtFrom: txtParts[1] || "",
          txtDate: txtParts[2] ? format(parse(txtParts[2], 'ddMMyy', new Date()), 'ddMMyy') : "",
        });
      } else {
        form.reset({
          txtNumber: "",
          txtFrom: "SECMAR",
          txtDate: format(new Date(), 'ddMMyy'),
          service: "PROP",
          comments: "RAS.",
          details: "",
          folder: "ALL",
        });
      }
    }
  }, [task, form, isOpen]);

  const onSubmit = (data: ModalTask) => {
    const { txtNumber, txtFrom, txtDate, ...rest } = data;
    const txt = `${txtNumber.padStart(3, '0')}/${txtFrom}/${txtDate}`;
    
    const parsedDate = parse(txtDate, "ddMMyy", new Date());
    
    const taskToSave: Omit<Task, 'id' | 'done'> = {
      ...rest,
      from: txtFrom,
      txt,
      date: !isNaN(parsedDate.getTime()) ? parsedDate : new Date(),
    };

    onSave(taskToSave);
    onOpenChange(false);
  };
  
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      fromComboboxRef.current?.focus();
    }
  };
  
  const handleFromEnter = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg h-5/6 flex flex-col">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex-1 flex flex-col"
          >
            <div className="grid grid-cols-[1fr,auto,1fr,auto,1fr] items-center gap-2">
              <FormField
                control={form.control}
                name="txtNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NUMBER</FormLabel>
                    <FormControl>
                      <Input {...field} onKeyDown={handleNumberKeyDown} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="mt-8">/</span>
              <FormField
                control={form.control}
                name="txtFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FROM</FormLabel>
                    <FormControl>
                      <Combobox
                        ref={fromComboboxRef}
                        options={entities}
                        value={field.value}
                        onChange={field.onChange}
                        onEnter={handleFromEnter}
                        placeholder="Select entity..."
                        emptyText="No entity found."
                        allowCustom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="mt-8">/</span>
               <FormField
                control={form.control}
                name="txtDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DATE</FormLabel>
                    <FormControl>
                      <DateInput
                        ref={dateInputRef}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
               <FormField
                control={form.control}
                name="folder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FOLDER</FormLabel>
                    <FormControl>
                      <Combobox
                        options={folders}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select folder..."
                        emptyText="No folder found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
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
                        className="flex-1 h-full resize-none"
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                    <FormLabel>COMMENTS</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Add comments (max 200 chars)..."
                        {...field}
                        className="flex-1 h-full resize-none"
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