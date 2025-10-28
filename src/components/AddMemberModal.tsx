import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { apiCall } from "../utils/supabase/client";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  accessToken: string;
  onMemberAdded: () => void;
}

export function AddMemberModal({
  open,
  onClose,
  groupId,
  accessToken,
  onMemberAdded,
}: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      await apiCall(
        `/groups/${groupId}/members`,
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim() }),
        },
        accessToken
      );
      
      toast.success("Member added successfully!");
      setEmail("");
      onClose();
      await onMemberAdded();
    } catch (error: any) {
      console.error("Add member error:", error);
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Member
          </DialogTitle>
          <DialogDescription>
            Add a member to this group by entering their email address. They must have an account to be added.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border bg-input-background"
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the email address of the person you want to add to this group.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
