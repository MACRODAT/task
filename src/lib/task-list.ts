// app/components/tasks-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateWebRTC } from 'rxdb/plugins/replication-webrtc';
import { taskSchema } from './task-schema'; // Your RxDB-compatible schema

// This should be managed in a singleton/context, not in the component
let dbPromise:any = null;

const createDb = async () => {
  const db = await createRxDatabase({
    name: 'tasksdbx',
    storage: getRxStorageDexie(),
  });
  await db.addCollections({
    tasks: {
      schema: taskSchema,
    },
  });
  return db;
};

const getDb = () => {
  if (!dbPromise) dbPromise = createDb();
  return dbPromise;
};

export { getDb };

export function useTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const setup = async () => {
      const db = await getDb();

      // Fetch initial tasks
      const initialTasks = await db.tasks.find().exec();
      setTasks(initialTasks);

      // Subscribe to changes
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
