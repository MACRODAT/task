import { RxJsonSchema } from 'rxdb';

export const folderSchema: RxJsonSchema<any> = {
  version: 0, // Set the version to 0
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 100 },
  },
  required: ['id', 'name'],
};
