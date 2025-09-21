
export const MIGRATION_STATE_TASK_V0 = async (oldDoc: any) => {
  return {
    ...oldDoc,
    folder: oldDoc.folder || 'ALL',
  };
};

export const MIGRATION_STATE_TASK_V1 = async (oldDoc: any) => {
  return {
    ...oldDoc,
    folder: oldDoc.folderId || oldDoc.folder || 'ALL',
  };
};

export const MIGRATION_STATE_TASK_V2 = async (oldDoc: any) => {
    return oldDoc;
};

export const MIGRATION_STATE_TASK_V3 = async (oldDoc: any) => {
    return oldDoc;
};

export const MIGRATION_STATE_FOLDER_V0 = async (oldDoc: any) => {
  return {
    id: oldDoc.id,
    name: oldDoc.name,
  };
};
