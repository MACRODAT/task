// app/components/tasks-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { createRxDatabase, RxCollection, RxDatabase, addRxPlugin } from 'rxdb'; // Import addRxPlugin
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'; // Corrected import for the migration schema plugin

import { folderSchema } from './folder-schema'; // Your folder schema
import { MIGRATION_STATE_TASK_V0, MIGRATION_STATE_TASK_V1, MIGRATION_STATE_TASK_V2, MIGRATION_STATE_FOLDER_V0 } from './migrations'; // Import new migration functions

// Add plugins
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

// Define custom RxCollection types
interface TaskCollection extends RxCollection<any> {}
interface FolderCollection extends RxCollection<any> {}

interface MyDatabaseCollections {
  tasks: TaskCollection;
  folders: FolderCollection;
}

// This should be managed in a singleton/context, not in the component
let dbPromise: Promise<RxDatabase<MyDatabaseCollections>> | null = null;

const createDb = async () => {
  const db = await createRxDatabase<MyDatabaseCollections>({
    name: 'tasksdbx2',
    storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
    }),
  });
  await db.addCollections({
    tasks: {
        schema: {
            version: 3, // Incremented schema version
            primaryKey: 'id',
            type: 'object',
            properties: {
                id: { type: 'string', maxLength: 100 },
                done: { type: 'boolean' },
                from: { type: 'string' },
                service: { type: 'string' },
                txt: {
                    type: 'string',
                    pattern: '^[0-9]{3,}/[a-zA-Z0-9]+/[0-9]{6}$', // Updated pattern to be case-insensitive
                },
                date: { type: 'number' },
                comments: { type: 'string' },
                details: { type: 'string', maxLength: 200 },
                folder: { type: 'string', default: 'ALL' },
            },
            required: ['id', 'done', 'from', 'service', 'txt', 'date', 'folder'],
        },
        migrationStrategies: {
            1: MIGRATION_STATE_TASK_V0,
            2: MIGRATION_STATE_TASK_V1,
            3: MIGRATION_STATE_TASK_V2, // Added new migration strategy
        },
    },
    folders: {
      schema: folderSchema
    },
  });

  // Ensure 'ALL' folder exists
  const allFolder = await db.folders.findOne({ selector: { id: 'ALL' } }).exec();
  if (!allFolder) {
    await db.folders.insert({
      id: 'ALL',
      name: 'ALL',
    });
  }

  return db;
};

const getDb = (): Promise<RxDatabase<MyDatabaseCollections>> => {
    if (process.env.NODE_ENV === 'development') {
        // In dev mode, use a global variable so that the value is not lost on module reload
        if (!(global as any).dbPromise) {
            (global as any).dbPromise = createDb();
        }
        return (global as any).dbPromise;
    }
    // In production, this can be a module-scope variable
    if (!dbPromise) {
        dbPromise = createDb();
    }
    return dbPromise;
};

export { getDb };

export function useTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const setup = async () => {
      const db = await getDb();
      const sub = db.tasks.find().$.subscribe((tasksFromDb:any) => {
        if (tasksFromDb) {
          setTasks(tasksFromDb);
        }
      });

      return () => sub.unsubscribe();
    };
    setup();
  }, []);

  return tasks;
}

export function useFolders() {
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const setup = async () => {
      const db = await getDb(); // Await the promise

      const sub = db.folders.find().$.subscribe((foldersFromDb: any) => {
        if (foldersFromDb) {
          setFolders(foldersFromDb);
        }
      });

      return () => sub.unsubscribe();
    };
    setup();
  }, []);

  return folders;
}
