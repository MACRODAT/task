'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export interface ProgressStep {
  name: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  message?: string;
}

interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  steps: ProgressStep[];
  progress: number;
}

export function ProgressModal({
  isOpen,
  onOpenChange,
  steps,
  progress,
}: ProgressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Printing Progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Progress value={progress} />
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center">
                <span
                  className={`mr-2 ${
                    step.status === "completed"
                      ? "text-green-500"
                      : step.status === "failed"
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {step.status === "completed" && "✔"}
                  {step.status === "failed" && "✖"}
                  {step.status === "in-progress" && "..."}
                  {step.status === "pending" && "..."}
                </span>
                <span>{step.name}</span>
                {step.message && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    - {step.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
