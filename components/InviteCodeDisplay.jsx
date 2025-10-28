import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy, RefreshCw, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { apiCall } from "../utils/supabase/client.jsx";
import { Badge } from "./ui/badge";

export function InviteCodeDisplay({ open, onOpenChange, groupId, groupName, accessToken }) {
  const [inviteCode, setInviteCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchInviteCode();
    }
  }, [open, groupId]);

  const fetchInviteCode = async () => {
    setLoading(true);
    try {
      const { inviteCode: code, expiresAt: expiry } = await apiCall(
        `/groups/${groupId}/invite-code`,
        {},
        accessToken
      );
      setInviteCode(code);
      setExpiresAt(expiry);
    } catch (error) {
      console.error("Fetch invite code error:", error);
      toast.error("Failed to load invite code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) {
      toast.error("No invite code available");
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteCode);
        toast.success("Invite code copied to clipboard!");
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = inviteCode;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success("Invite code copied to clipboard!");
        } else {
          throw new Error("Copy command failed");
        }
      }
    } catch (error) {
      console.error("Failed to copy invite code:", error);
      // Show the code in the error message so user can copy manually
      toast.error(`Failed to copy. Code: ${inviteCode}`, {
        duration: 5000,
      });
    }
  };

  const handleRefreshCode = async () => {
    setLoading(true);
    try {
      const { inviteCode: newCode, expiresAt: newExpiry } = await apiCall(
        `/groups/${groupId}/invite-code/refresh`,
        { method: "POST" },
        accessToken
      );
      setInviteCode(newCode);
      setExpiresAt(newExpiry);
      toast.success("New invite code generated!");
    } catch (error) {
      console.error("Refresh invite code error:", error);
      toast.error("Failed to refresh invite code");
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryTime = (expiryString) => {
    const expiry = new Date(expiryString);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return "less than 1 hour";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Invite Code for {groupName}
          </DialogTitle>
          <DialogDescription>
            Share this code with people you want to invite to your group
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 rounded-lg border-2 border-border">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Invite Code</p>
                <div className="text-5xl font-mono tracking-widest font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {inviteCode}
                </div>
                {expiresAt && (
                  <Badge variant="secondary" className="mt-2">
                    Expires in {formatExpiryTime(expiresAt)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyCode}
                className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
              <Button
                onClick={handleRefreshCode}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              People who use this code will need admin approval before joining the group
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
