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
  folder: z.string().default("ALL"), // New folder property
});

export type Task = z.infer<typeof taskSchema>;

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
