# **App Name**: Work Task Flow

## Core Features:

- Main Dashboard: Responsive main dashboard layout with a collapsible sidebar and task list.
- Task List: Task list with columns for DONE, FROM, SERVICE, TXT, DATE, COMMENTS, and Actions, adapting to mobile screens.
- Direct Interface Editing: Directly editable DONE checkboxes and COMMENTS fields within the task list for quick updates.
- Task Modal: Add/Edit Task modal with responsive form fields for task properties.
- Autocomplete Inputs: Autocomplete functionality for FROM and SERVICE fields, suggesting values from the Entities and Services collections.
- TXT Field Validation: Text input validation for the TXT field to enforce the NNN/CCC/DDMMYY format.
- Offline Persistence with CouchDB or similar (will never be offline): Stores tasks to the local database, including seamless synchronization with the backend when the network is restored from other devices.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to convey a sense of trust and reliability.
- Background color: Very light grey (#F5F5F5), providing a clean, distraction-free surface for tasks.
- Accent color: Vibrant amber (#FFC107) used sparingly for highlights and interactive elements.
- Body and headline font: 'Inter' sans-serif for a modern, objective, neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, geometric icons to represent actions and status indicators.
- Employ a clean and consistent grid-based layout, ensuring information is well-organized and easy to scan.