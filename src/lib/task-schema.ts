import { RxJsonSchema } from 'rxdb';

export const taskSchema: RxJsonSchema<any> = {
  version: 2, // Increment the version again for a new migration
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    done: { type: 'boolean' },
    from: { type: 'string' },
    service: { type: 'string' },
    txt: {
      type: 'string',
      pattern: '^[0-9]{3,}/[A-Z0-9]+/[0-9]{6}$',
    },
    date: { type: 'number' }, // Store date as a timestamp
    comments: { type: 'string' },
    details: { type: 'string', maxLength: 200 },
    folder: { type: 'string', default: 'ALL' }, // The correct folder property
  },
  required: ['id', 'done', 'from', 'service', 'txt', 'date', 'folder'], // The correct required fields
};
