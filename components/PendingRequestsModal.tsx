import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { apiCall } from "../utils/supabase/client";
import { Badge } from "./ui/badge";

interface PendingRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoUrl?: string;
  requestedAt: string;
}

interface PendingRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  accessToken: string;
  onRequestHandled: () => void;
}

export function PendingRequestsModal({ open, onOpenChange, groupId, accessToken, onRequestHandled }: PendingRequestsModalProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPendingRequests();
    }
  }, [open, groupId]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const { requests: fetchedRequests } = await apiCall(
        `/groups/${groupId}/pending-requests`,
        {},
        accessToken
      );
      setRequests(fetchedRequests || []);
    } catch (error: any) {
      console.error("Fetch pending requests error:", error);
      toast.error("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, approve: boolean) => {
    setProcessingId(requestId);
    try {
      await apiCall(
        `/groups/${groupId}/pending-requests/${requestId}`,
        {
          method: "POST",
          body: JSON.stringify({ approve }),
        },
        accessToken
      );

      toast.success(approve ? "Member approved!" : "Request declined");
      await fetchPendingRequests();
      onRequestHandled();
    } catch (error: any) {
      console.error("Handle request error:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Pending Join Requests
          </DialogTitle>
          <DialogDescription>
            Review and approve or decline requests to join your group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={request.userPhotoUrl} alt={request.userName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {request.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{request.userName}</p>
                  <p className="text-sm text-muted-foreground truncate">{request.userEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatTimeAgo(request.requestedAt)}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, false)}
                    disabled={processingId === request.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {processingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, true)}
                    disabled={processingId === request.id}
                    className="bg-success hover:bg-success/90"
                  >
                    {processingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
