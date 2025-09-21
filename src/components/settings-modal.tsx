"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/task-list";

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("preferences");

  const handleExport = async () => {
    const db = await getDb();
    const tasks = await db.tasks.find().exec();
    const folders = await db.folders.find().exec();
    const data = {
      tasks: tasks.map((t) => t.toJSON()),
      folders: folders.map((f) => f.toJSON()),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "inbox-data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
          <div className="col-span-1 border-r pr-4 overflow-y-auto">
            <nav className="flex flex-col space-y-1 text-sm">
              <div className="px-2 py-1.5">
                <span className="font-semibold text-xs text-muted-foreground">
                  Account
                </span>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("preferences");
                }}
                className={
                  activeTab === "preferences"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Preferences
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("notifications");
                }}
                className={
                  activeTab === "notifications"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Notifications
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("connections");
                }}
                className={
                  activeTab === "connections"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Connections
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("offline");
                }}
                className={
                  activeTab === "offline"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Offline
              </a>

              <div className="px-2 py-1.5 mt-4">
                <span className="font-semibold text-xs text-muted-foreground">
                  Workspace
                </span>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("general");
                }}
                className={
                  activeTab === "general"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                General
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("people");
                }}
                className={
                  activeTab === "people"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                People
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("teamspaces");
                }}
                className={
                  activeTab === "teamspaces"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Teamspaces
              </a>
              <div className="px-2 py-1.5 mt-4">
                <span className="font-semibold text-xs text-muted-foreground">
                  Data
                </span>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("data");
                }}
                className={
                  activeTab === "data"
                    ? "bg-muted font-semibold rounded-md px-2 py-1.5"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2 py-1.5"
                }
              >
                Data
              </a>
            </nav>
          </div>
          <div className="col-span-4 overflow-y-auto">
            {activeTab === "preferences" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize how Notion looks on your device.
                    </p>
                    <Separator />
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold">Language & Time</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change the language used in the user interface.
                    </p>
                    <Separator />
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold">Desktop app</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can configure browser links to open in this app.
                    </p>
                    <Separator />
                  </section>
                </div>
              </div>
            )}
            {activeTab === "data" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Data</h2>
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold">Export</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export all tasks and folders to a JSON file.
                    </p>
                    <Button onClick={handleExport}>Export data</Button>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}