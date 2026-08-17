"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverData: any;
  localData: any;
  onResolve: (strategy: "overwrite" | "discard") => void;
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  serverData,
  localData,
  onResolve
}: ConflictResolutionDialogProps) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = (strategy: "overwrite" | "discard") => {
    setResolving(true);
    try {
      onResolve(strategy);
      onOpenChange(false);
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Conflict Detected!</DialogTitle>
          <DialogDescription>
            Another user has modified this record since you last loaded it. Please choose how to proceed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border p-4 rounded-md bg-gray-50 overflow-hidden">
            <h3 className="font-semibold text-sm mb-2 text-gray-500">Current Server State</h3>
            <pre className="text-xs max-h-[300px] overflow-auto">
              {JSON.stringify(serverData, null, 2)}
            </pre>
          </div>
          <div className="border p-4 rounded-md bg-blue-50 overflow-hidden">
            <h3 className="font-semibold text-sm mb-2 text-blue-600">Your Changes</h3>
            <pre className="text-xs max-h-[300px] overflow-auto">
              {JSON.stringify(localData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleResolve("discard")}
            disabled={resolving}
          >
            Discard My Changes
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleResolve("overwrite")}
            disabled={resolving}
          >
            Overwrite Server Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
