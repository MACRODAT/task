import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Task } from "./task-schema";

export interface ProgressStep {
  name: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  message?: string;
}

export type ProgressCallback = (steps: ProgressStep[], progress: number) => void;

export const printTasks = async (
  tasks: Task[],
  title: string,
  onProgress: ProgressCallback
) => {
  const steps: ProgressStep[] = [
    { name: "Fetching template", status: "pending" },
    { name: "Loading template", status: "pending" },
    { name: "Preparing data", status: "pending" },
    { name: "Rendering document", status: "pending" },
    { name: "Generating output file", status: "pending" },
  ];

  const updateProgress = (
    stepIndex: number,
    status: ProgressStep["status"],
    message?: string
  ) => {
    steps[stepIndex].status = status;
    if (message) steps[stepIndex].message = message;
    const completedSteps = steps.filter((s) => s.status === "completed").length;
    onProgress([...steps], (completedSteps / steps.length) * 100);
  };

  try {
    // Step 1: Fetch template
    updateProgress(0, "in-progress");
    const response = await fetch("/model.docx");
    if (!response.ok) {
      throw new Error(`Failed to fetch model.docx: ${response.statusText}`);
    }
    const content = await response.arrayBuffer();
    updateProgress(0, "completed");

    // Step 2: Load template
    updateProgress(1, "in-progress");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    updateProgress(1, "completed");

    // Step 3: Prepare data
    updateProgress(2, "in-progress");
    const today = new Date();
    const formattedDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    const mappedTasks = tasks.map((t) => {
      const task = (t as any).toJSON ? (t as any).toJSON() : t;
      return {
        SERVICE: task.service || "",
        FROM: task.from || "",
        DETAILS: task.details || "",
        TXT: task.txt || "",
        COMMENTS: task.comments || "",
      };
    });

    const data = {
      TODAY: formattedDate,
      TITLE: title, // make sure template uses {{TITLE}} not {{title}}
      tasks: mappedTasks,
    };
    updateProgress(2, "completed");

    // Step 4: Render document
    updateProgress(3, "in-progress");
    doc.render(data);
    updateProgress(3, "completed");

    // Step 5: Generate output
    updateProgress(4, "in-progress");
    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    saveAs(out, `${title}.docx`);
    updateProgress(4, "completed");
  } catch (error: any) {
    const failedStepIndex = steps.findIndex(
      (s) => s.status === "in-progress"
    );
    if (failedStepIndex !== -1) {
      let message = error.message;
      if (error.properties && error.properties.errors) {
        message = error.properties.errors
          .map(
            (err: any) => `[${err.id}] ${err.properties.explanation}`
          )
          .join("\n");
      }
      updateProgress(failedStepIndex, "failed", message);
    }
    console.error("Printing error:", error);
    throw error;
  }
};
