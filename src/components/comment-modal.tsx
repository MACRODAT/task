
"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface CommentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (taskId: string, comments: string) => void;
  task: Task | null;
}

export function CommentModal({ isOpen, onOpenChange, onSave, task }: CommentModalProps) {
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (isOpen && task) {
      setComments(task.comments || "");
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (task) {
      onSave(task.id, comments);
    }
  };
  
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl flex flex-col h-auto">
        <DialogHeader>
          <DialogTitle>Edit Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong>FROM:</strong> {task.from}</p>
                <p><strong>SERVICE:</strong> {task.service}</p>
                <p><strong>TXT:</strong> <span className="font-code">{task.txt}</span></p>
                <p><strong>DATE:</strong> {format(task.date, "dd/MM/yyyy")}</p>
            </div>
             <div>
                <p className="font-medium">DETAILS:</p>
                <p className="text-muted-foreground p-2 border rounded-md mt-1 bg-muted/50">{task.details}</p>
            </div>
            <div className="flex-1 grid gap-2">
                <label htmlFor="comments" className="font-medium">COMMENTS</label>
                <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add comments here..."
                    className="flex-1 h-32"
                />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Comments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
