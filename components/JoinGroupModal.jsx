import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { apiCall } from "../utils/supabase/client.jsx";

export function JoinGroupModal({ open, onOpenChange, accessToken, onJoinRequested }) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      toast.error("Please enter a valid 6-letter invite code");
      return;
    }

    setLoading(true);
    try {
      await apiCall(
        "/join-group",
        {
          method: "POST",
          body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
        },
        accessToken
      );

      toast.success("Join request sent! Waiting for admin approval.");
      setInviteCode("");
      onOpenChange(false);
      onJoinRequested();
    } catch (error) {
      console.error("Join group error:", error);
      toast.error(error.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Join a Group
          </DialogTitle>
          <DialogDescription>
            Enter the 6-letter invite code shared by your group admin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="border-border bg-input-background text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              Invite codes are 6 letters and valid for 1-2 days
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Request to Join"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
