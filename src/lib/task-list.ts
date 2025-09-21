'use client';

import { useEffect, useState } from 'react';
import { createRxDatabase, RxCollection, RxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { useObservable, useRxData } from 'rxdb-hooks';
import { folderSchema } from './folder-schema';
import { MIGRATION_STATE_TASK_V0, MIGRATION_STATE_TASK_V1, MIGRATION_STATE_TASK_V2, MIGRATION_STATE_TASK_V3, MIGRATION_STATE_FOLDER_V0 } from './migrations';
import { from, switchMap } from 'rxjs';

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBUpdatePlugin);

interface TaskCollection extends RxCollection<any> {}
interface FolderCollection extends RxCollection<any> {}

interface MyDatabaseCollections {
  tasks: TaskCollection;
  folders: FolderCollection;
}

type MyDatabase = RxDatabase<MyDatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;
let activeDbName: string | null = null;

const createDb = async (name: string) => {
  const db = await createRxDatabase<MyDatabaseCollections>({
    name: name,
    storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
    }),
  });
  await db.addCollections({
    tasks: {
        schema: {
            version: 4,
            primaryKey: 'id',
            type: 'object',
            properties: {
                id: { type: 'string', maxLength: 100 },
                done: { type: 'boolean' },
                from: { type: 'string', maxLength: 100 },
                service: { type: 'string', maxLength: 100 },
                txt: {
                    type: 'string',
                    pattern: '^[0-9]{3,}/[a-zA-Z0-9]+/[0-9]{6}$',
                    maxLength: 100
                },
                date: { 
                    type: 'number', 
                    multipleOf: 1,
                    minimum: 0,
                    maximum: 10000000000000
                },
                comments: { type: 'string', maxLength: 500 },
                details: { type: 'string', maxLength: 200 },
                folder: { type: 'string', default: 'ALL', maxLength: 100 },
            },
            required: ['id', 'done', 'from', 'service', 'txt', 'date', 'details', 'folder'],
            indexes: ['from', 'service', 'date', 'folder'],
        },
        migrationStrategies: {
            1: MIGRATION_STATE_TASK_V0,
            2: MIGRATION_STATE_TASK_V1,
            3: MIGRATION_STATE_TASK_V2,
            4: MIGRATION_STATE_TASK_V3
        },
    },
    folders: {
        schema: folderSchema
    },
});
  return db;
};

export const getDb = (name?: string): Promise<MyDatabase> => {
    const dbName = name || localStorage.getItem('inbox-selected-db') || 'tasksdbx2';

    if (dbName === activeDbName && dbPromise) {
        return dbPromise;
    }
    
    activeDbName = dbName;
    dbPromise = createDb(dbName);
    return dbPromise;
};

export const setActiveDatabase = (name: string) => {
    localStorage.setItem('inbox-selected-db', name);
    dbPromise = null; 
    activeDbName = null;
};

export const listDatabases = async (): Promise<string[]> => {
    if (typeof window.indexedDB.databases === 'function') {
        const dbs = await window.indexedDB.databases();
        const dbNames = dbs
            .map(db => db.name)
            .filter((name): name is string => !!name)
            .filter(name => name.startsWith('rxdb-dexie-'))
            .map(name => name.replace('rxdb-dexie-', '').split('-')[0]);
        
        const uniqueNames = [...new Set(dbNames)];
        if (!uniqueNames.includes('tasksdbx2')) {
            uniqueNames.push('tasksdbx2');
        }
        return uniqueNames;
    }
    const mainDb = localStorage.getItem('inbox-selected-db') || 'tasksdbx2';
    return [mainDb];
};


export const useFolders = () => {
    const [folders, setFolders] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const sub = from(getDb()).pipe(
            switchMap(db => db.folders.find().$)
        ).subscribe(folderDocs => {
            if (folderDocs) {
                setFolders(folderDocs.map(d => d.toJSON()));
            }
        });

        return () => sub.unsubscribe();
    }, []);

    return folders;
};

export const useTasks = () => {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        const sub = from(getDb()).pipe(
            switchMap(db => db.tasks.find().$)
        ).subscribe(taskDocs => {
            if (taskDocs) {
                setTasks(taskDocs.map(d => d.toJSON()));
            }
        });

        return () => sub.unsubscribe();
    }, []);

    return tasks;
};