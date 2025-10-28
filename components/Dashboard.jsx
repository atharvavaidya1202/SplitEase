import { useState } from "react";
import { Header } from "./Header.jsx";
import { GroupCard } from "./GroupCard.jsx";
import { Button } from "./ui/button";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { apiCall } from "../utils/supabase/client.jsx";
import { formatAmount } from "../utils/currencies.jsx";
import { JoinGroupModal } from "./JoinGroupModal.jsx";
import { Footer } from "./Footer.jsx";

export function Dashboard({ groups, onNavigate, userName, userPhotoUrl, currency, accessToken, onGroupCreated, onProfileClick, onLogout }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberNames, setMemberNames] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      // Parse member names (comma-separated)
      const members = memberNames
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, idx) => ({
          id: `temp-${idx}-${Date.now()}`,
          name,
        }));

      await apiCall(
        "/groups",
        {
          method: "POST",
          body: JSON.stringify({
            name: groupName,
            members,
          }),
        },
        accessToken
      );

      toast.success("Group created successfully!");
      setIsCreateDialogOpen(false);
      setGroupName("");
      setMemberNames("");
      onGroupCreated();
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-background to-purple-50/50 flex flex-col">
      <Header userName={userName} userPhotoUrl={userPhotoUrl} onNavigate={onNavigate} currentPage="dashboard" onProfileClick={onProfileClick} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 pb-24 max-w-7xl flex-1">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Groups
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and track expenses across all your groups
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {groups.map((group, idx) => (
            <div
              key={group.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <GroupCard
                {...group}
                currency={currency}
                onClick={() => onNavigate("group", group.id)}
              />
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-2 text-xl">No groups yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first group to start splitting expenses with friends, roommates, or travel buddies!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
              <Button
                onClick={() => setIsJoinGroupOpen(true)}
                variant="outline"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Join a Group
              </Button>
            </div>
          </div>
        )}
      </main>

      <Button
        onClick={() => setIsJoinGroupOpen(true)}
        className="fixed bottom-8 left-8 h-14 rounded-full shadow-xl hover:shadow-primary/50 transition-all duration-300 bg-card border-2 border-border hover:border-primary text-foreground hover:scale-105 z-10"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Join Group
      </Button>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 p-0 bg-gradient-to-br from-primary via-secondary to-accent hover:scale-110 hover:rotate-90 z-10"
            size="icon"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Start a new group to split expenses with others
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., Weekend Trip, Apartment, Office Lunch"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="border-border bg-input-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members">Members (optional)</Label>
              <Input
                id="members"
                placeholder="Enter names separated by commas"
                value={memberNames}
                onChange={(e) => setMemberNames(e.target.value)}
                className="border-border bg-input-background"
              />
              <p className="text-sm text-muted-foreground">
                You can add members later or invite them to join
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
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
                    Creating...
                  </>
                ) : (
                  "Create Group"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <JoinGroupModal
        open={isJoinGroupOpen}
        onOpenChange={setIsJoinGroupOpen}
        accessToken={accessToken}
        onJoinRequested={onGroupCreated}
      />

      <Footer />
    </div>
  );
}
