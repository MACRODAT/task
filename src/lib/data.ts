
import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  done: z.boolean(),
  from: z.string().min(1, { message: "FROM field is required." }),
  service: z.string().min(1, { message: "SERVICE field is required." }),
  txt: z.string().regex(/^[0-9]{3,}\/[A-Z0-9]+\/[0-9]{6}$/i, { message: "Format must be NNN/CCC/DDMMYY" }),
  date: z.date({ required_error: "A date is required."}),
  comments: z.string().optional(),
  details: z.string().max(200, { message: "Details cannot exceed 200 characters." }).optional(),
});

export type Task = z.infer<typeof taskSchema>;

// export const initialTasks: Task[] = [
//   {
//     id: "TASK-8782",
//     done: true,
//     from: "3BN",
//     service: "PROP",
//     txt: "123/ABC/010123",
//     date: new Date("2023-01-01"),
//     comments: "Initial setup",
//     details: "This is a detailed description for the initial setup of the API Gateway.",
//   },
//   {
//     id: "TASK-5516",
//     done: false,
//     from: "SECMAR",
//     service: "ELEC",
//     txt: "456/DEF/150223",
//     date: new Date("2023-02-15"),
//     comments: "Needs password reset flow",
//     details: "Implement the full password reset flow including email notifications and secure token handling.",
//   },
//   {
//     id: "TASK-4231",
//     done: false,
//     from: "AFZS",
//     service: "CHAUD",
//     txt: "789/GHI/300324",
//     date: new Date("2024-03-30"),
//     comments: "Deploy new templates",
//     details: "New marketing email templates for the spring campaign need to be deployed to production.",
//   },
//     {
//     id: "TASK-7890",
//     done: false,
//     from: "AFAN",
//     service: "SIC",
//     txt: "111/JKL/120424",
//     date: new Date("2024-04-12"),
//     comments: "Schema migration required",
//     details: "A database schema migration is required to support the new features in Q2. Downtime must be scheduled.",
//   },
//   {
//     id: "TASK-2345",
//     done: true,
//     from: "KHOUTAT LBAR",
//     service: "PROP",
//     txt: "222/MNO/180524",
//     date: new Date("2024-05-18"),
//     comments: "Tests are passing",
//     details: "All unit and integration tests are passing in the CI/CD pipeline after the latest dependency updates.",
//   },
//   {
//     id: "TASK-6789",
//     done: false,
//     from: "ERRACHIQ",
//     service: "ELEC",
//     txt: "333/PQR/250624",
//     date: new Date("2024-06-25"),
//     comments: "Fix responsive layout bug on safari",
//     details: "There is a critical responsive layout bug affecting users on Safari browsers on iOS. This needs to be fixed ASAP.",
//   },
// ];

export const initialEntities = [
  { value: "3BN", label: "3BN" },
  { value: "SECMAR", label: "SECMAR" },
  { value: "AFZS", label: "AFZS" },
  { value: "AFAN", label: "AFAN" },
  { value: "KHOUTAT LBAR", label: "KHOUTAT LBAR" },
  { value: "ERRACHIQ", label: "ERRACHIQ" },
  { value: "AKID", label: "AKID" },
  { value: "BARGACH", label: "BARGACH" },
  { value: "MONASTIRI", label: "MONASTIRI" },
  { value: "Gc136", label: "Gc136" },
  { value: "3BIMAR", label: "3BIMAR" },
  { value: "DPMDK", label: "DPMDK" },
  { value: "ELMAJID", label: "ELMAJID" },
  { value: "PR TRIKI", label: "PR TRIKI" },
];

export const services = [
  { value: "PROP", label: "PROP" },
  { value: "ELEC", label: "ELEC" },
  { value: "CHAUD", label: "CHAUD" },
  { value: "SIC", label: "SIC" },
];
