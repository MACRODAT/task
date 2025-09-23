import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { ProgressStep, printTasks } from '@/lib/print';
import { Task } from '@/lib/task-schema';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, tasks }) => {
  const [title, setTitle] = useState('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePrint = async () => {
    if (!title.trim()) {
      alert('Please enter a document title.');
      return;
    }

    setIsPrinting(true);
    setPrintStatus('idle');
    setErrorMessage(null);
    setOverallProgress(0);
    setProgressSteps([]);

    try {
      await printTasks(tasks, title, (steps, progress) => {
        setProgressSteps(steps);
        setOverallProgress(progress);
      });
      setPrintStatus('success');
    } catch (error: any) {
      console.error('Printing failed:', error);
      setPrintStatus('failed');
      setErrorMessage(error.message || 'An unknown error occurred during printing.');
    } finally {
      setIsPrinting(false);
    }
  };

  const resetModal = () => {
    setTitle('');
    setProgressSteps([]);
    setOverallProgress(0);
    setIsPrinting(false);
    setPrintStatus('idle');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Tasks</DialogTitle>
          <DialogDescription>
            Enter a title for your document and click print. Only the currently selected tasks will be included.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              disabled={isPrinting}
            />
          </div>
          {isPrinting || printStatus !== 'idle' ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Progress:</h3>
              <Progress value={overallProgress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                {progressSteps.map((step, index) => (
                  <p key={index} className={
                    step.status === 'failed' ? 'text-red-500' :
                    step.status === 'completed' ? 'text-green-500' :
                    ''
                  }>
                    {step.name}: {step.status} {step.message ? `(${step.message})` : ''}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
          {printStatus === 'success' && (
            <p className="text-green-500 text-sm">Document generated successfully!</p>
          )}
          {printStatus === 'failed' && errorMessage && (
            <p className="text-red-500 text-sm">Error: {errorMessage}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetModal} disabled={isPrinting}>
            {printStatus === 'success' || printStatus === 'failed' ? 'Close' : 'Cancel'}
          </Button>
          <Button type="submit" onClick={handlePrint} disabled={isPrinting || !title.trim()}>
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
