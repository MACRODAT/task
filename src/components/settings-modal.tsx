'use client';

import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDb, listDatabases, setActiveDatabase } from '@/lib/task-list';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/lib/data';

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface Conflict {
  type: 'task' | 'folder';
  id: string;
  original: any;
  new: any;
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [newDbName, setNewDbName] = useState('');


  useEffect(() => {
    if (isOpen) {
      listDatabases().then(dbs => {
        setDatabases(dbs);
        const currentDb = localStorage.getItem('inbox-selected-db') || 'tasksdbx2';
        setSelectedDb(currentDb);
      });
    }
  }, [isOpen]);

  const handleDbSelectionChange = (dbName: string) => {
    setSelectedDb(dbName);
    setActiveDatabase(dbName);
    window.location.reload();
  };

  const handleCreateNewDatabase = async () => {
    if (newDbName && !databases.includes(newDbName)) {
        await getDb(newDbName);
        setDatabases([...databases, newDbName]);
        handleDbSelectionChange(newDbName);
    } else {
        toast({
            title: 'Database already exists or name is invalid',
            variant: 'destructive'
        })
    }
  };

  const handleExport = async () => {
    const db = await getDb();
    const tasks = await db.tasks.find().exec();
    const folders = await db.folders.find().exec();
    const data = {
      tasks: tasks.map(t => t.toJSON()),
      folders: folders.map(f => f.toJSON()),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'inbox-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async e => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          await processImport(text);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const processImport = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const db = await getDb();
      const newConflicts: Conflict[] = [];

      if (data.tasks) {
        for (const task of data.tasks) {
          const existing = await db.tasks.findOne(task.id).exec();
          if (existing) {
            newConflicts.push({ type: 'task', id: task.id, original: existing.toJSON(), new: task });
          } else {
            await db.tasks.insert(task);
          }
        }
      }

      if (data.folders) {
        for (const folder of data.folders) {
          const existing = await db.folders.findOne(folder.id).exec();
          if (existing) {
            newConflicts.push({ type: 'folder', id: folder.id, original: existing.toJSON(), new: folder });
          } else {
            await db.folders.insert(folder);
          }
        }
      }

      if (newConflicts.length > 0) {
        setConflicts(newConflicts);
        toast({ title: 'Conflicts detected', description: 'Please resolve the conflicts below.' });
      } else {
        toast({ title: 'Import successful', description: 'All items have been imported.' });
        onOpenChange(false); // Close modal on successful import with no conflicts
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({ title: 'Import failed', description: 'Please check the file format.', variant: 'destructive' });
    }
  };

    const handleResolveConflict = async (index: number, resolution: 'original' | 'new') => {
        const conflict = conflicts[index];
        if (resolution === 'new') {
            const db = await getDb();
            if (conflict.type === 'task') {
                await db.tasks.upsert(conflict.new);
            } else if (conflict.type === 'folder') {
                await db.folders.upsert(conflict.new);
            }
        }
        
        const newConflicts = conflicts.filter((_, i) => i !== index);
        setConflicts(newConflicts);

        if (newConflicts.length === 0) {
            toast({ title: 'All conflicts resolved!', description: 'Data import is complete.' });
            onOpenChange(false);
        }
    };


  const renderNavlink = (label: string, tab: string, isDefault = false) => (
    <a
        href="#"
        onClick={e => {
            e.preventDefault();
            setActiveTab(tab);
        }}
        className={activeTab === tab ? 'bg-muted font-semibold rounded-md px-2 py-1.5' : 'text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5'}>
        {label}
    </a>
  )

  const renderSection = (title: string, description: string) => (
      <section>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Separator />
      </section>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
          <div className="col-span-1 border-r pr-4 overflow-y-auto">
            <nav className="flex flex-col space-y-1 text-sm">
                {renderNavlink('General', 'general', true)}
                {renderNavlink('Data', 'data')}
            </nav>
          </div>
          <div className="col-span-4 overflow-y-auto pr-2">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">General</h2>
                <div className="space-y-8">
                  {renderSection('Appearance', 'Customize how Notion looks on your device.')}
                  {renderSection('Language & Time', 'Change the language used in the user interface.')}
                  {renderSection('Desktop app', 'You can configure browser links to open in this app.')}
                </div>
              </div>
            )}
            {activeTab === 'data' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Data</h2>
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-semibold">Manage Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">Select, create, import, or export your data.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Select Database</h4>
                                <Select onValueChange={handleDbSelectionChange} value={selectedDb}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a database" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {databases.map(db => <SelectItem key={db} value={db}>{db}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <h4 className="font-medium">Create New Database</h4>
                                <div className="flex gap-2">
                                    <Input value={newDbName} onChange={(e) => setNewDbName(e.target.value)} placeholder="New database name" />
                                    <Button onClick={handleCreateNewDatabase}>Create</Button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium">Import / Export</h4>
                                <div className="flex gap-2">
                                    <Button onClick={handleExport}>Export data</Button>
                                    <Button onClick={handleImport} variant="outline">Import data</Button>
                                    <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                                </div>
                            </div>
                        </div>
                    </section>

                    {conflicts.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold">Resolve Conflicts</h3>
                            <p className="text-sm text-muted-foreground mb-4">The following items already exist in your workspace. Choose which version to keep.</p>
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {conflicts.map((conflict, index) => (
                                    <div key={conflict.id} className="border p-4 rounded-md bg-background">
                                        <h4 className="font-semibold">Conflict for {conflict.type}: {conflict.type === 'task' ? conflict.new.txt : conflict.new.name}</h4>
                                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                            <div>
                                                <h5 className="font-semibold mb-2">Original</h5>
                                                <pre className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap">{JSON.stringify(conflict.original, null, 2)}</pre>
                                                <Button onClick={() => handleResolveConflict(index, 'original')} variant="outline" size="sm" className="mt-2">Keep Original</Button>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold mb-2">New (from file)</h5>
                                                <pre className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap">{JSON.stringify(conflict.new, null, 2)}</pre>
                                                <Button onClick={() => handleResolveConflict(index, 'new')} size="sm" className="mt-2">Use New</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
