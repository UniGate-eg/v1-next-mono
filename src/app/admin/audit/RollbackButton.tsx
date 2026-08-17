"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import { toast } from "sonner";
import { rollbackAction } from "../actions/audit.actions";

export function RollbackButton({ logId }: { logId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRollback = async () => {
    if (!confirm("Are you sure you want to rollback this change? This will restore the previous state.")) return;
    
    setLoading(true);
    try {
      const res = await rollbackAction(logId);
      if (res.success) {
        toast.success("Rollback successful");
      } else {
        toast.error(res.error || "Rollback failed");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRollback}
      disabled={loading}
    >
      <Undo className="w-3 h-3 mr-1" />
      {loading ? "Reverting..." : "Rollback"}
    </Button>
  );
}
