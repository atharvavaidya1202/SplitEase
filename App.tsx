import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { GroupDetail } from "./components/GroupDetail";
import { BalancesPage } from "./components/BalancesPage";
import { ProfileModal } from "./components/ProfileModal";
import { Toaster } from "./components/ui/sonner";
import { apiCall, supabase } from "./utils/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Expense {
  id: string;
  description: string;
  payer: string;
  amount: number;
  date: string;
  participants: string[];
  paidBy?: string[];
}

interface Group {
  id: string;
  name: string;
  balance: number;
  lastUpdated: string;
  memberCount: number;
  expenses: Expense[];
  members: { id: string; name: string }[];
  ownerId?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  currency: string;
  photoUrl?: string;
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchGroups = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const { groups: fetchedGroups } = await apiCall("/groups", {}, accessToken);
      
      // Calculate balances for each group
      const groupsWithBalances = fetchedGroups.map((group: any) => {
        const memberBalances: Record<string, number> = {};
        
        // Initialize balances
        group.members.forEach((member: any) => {
          memberBalances[member.name] = 0;
        });
        
        // Calculate balances from expenses
        group.expenses.forEach((expense: any) => {
          // Calculate per-person share (split among all participants including payer)
          const splitAmount = expense.amount / expense.participants.length;
          
          // Find the payer
          const payerParticipant = group.members.find((m: any) => m.name === expense.payer);
          const payerId = payerParticipant?.id;
          
          // Check if payer is in participants list
          const payerIsParticipant = payerId && expense.participants.includes(payerId);
          
          // Get list of participants who have marked as paid
          const paidBy = expense.paidBy || [];
          
          // Calculate how much has been paid back
          let totalPaidBack = 0;
          paidBy.forEach((paidUserId: string) => {
            if (paidUserId !== payerId) {
              totalPaidBack += splitAmount;
            }
          });
          
          // Payer gets credited for (amount paid - their own share - amount already paid back)
          if (payerParticipant) {
            if (payerIsParticipant) {
              // Payer paid full amount but their share is already covered
              memberBalances[payerParticipant.name] += expense.amount - splitAmount - totalPaidBack;
            } else {
              // Payer paid full amount and isn't a participant
              memberBalances[payerParticipant.name] += expense.amount - totalPaidBack;
            }
          }
          
          // Each participant (excluding payer) owes their split amount (unless they marked as paid)
          expense.participants.forEach((participantId: string) => {
            const participant = group.members.find((m: any) => m.id === participantId);
            if (participant && participant.id !== payerId) {
              // Only count as debt if they haven't marked as paid
              if (!paidBy.includes(participantId)) {
                memberBalances[participant.name] -= splitAmount;
              }
            }
          });
        });
        
        // Get "You" balance
        const userBalance = memberBalances["You"] || memberBalances[user?.name || ""] || 0;
        
        // Format date
        const lastUpdated = formatRelativeTime(group.lastUpdated);
        
        return {
          ...group,
          balance: userBalance,
          lastUpdated,
          expenses: group.expenses.map((e: any) => ({
            ...e,
            date: formatDate(e.date),
          })),
        };
      });
      
      setGroups(groupsWithBalances);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      fetchGroups();
    }
  }, [isLoggedIn, accessToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return formatDate(dateString);
  };

  const handleNavigate = (page: string, groupId?: string) => {
    setCurrentPage(page);
    if (groupId) {
      setSelectedGroupId(groupId);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setIsLoggedIn(true);
    setShowLanding(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken("");
      setIsLoggedIn(false);
      setGroups([]);
      setCurrentPage("dashboard");
      setSelectedGroupId(null);
      setShowLanding(true);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAddExpense = async (expense: {
    description: string;
    amount: number;
    payer: string;
    participants: string[];
  }) => {
    if (!selectedGroupId || !accessToken) return;

    try {
      await apiCall(
        `/groups/${selectedGroupId}/expenses`,
        {
          method: "POST",
          body: JSON.stringify(expense),
        },
        accessToken
      );

      // Refresh groups
      await fetchGroups();
    } catch (error) {
      console.error("Failed to add expense:", error);
      throw error;
    }
  };

  const calculateBalances = (group: Group) => {
    const balances: { from: string; to: string; amount: number }[] = [];
    const memberBalances: Record<string, number> = {};

    // Initialize balances
    group.members.forEach((member) => {
      memberBalances[member.name] = 0;
    });

    // Calculate balances from expenses
    group.expenses.forEach((expense) => {
      // Calculate per-person share (split among all participants including payer)
      const splitAmount = expense.amount / expense.participants.length;
      
      // Find the payer
      const payerParticipant = group.members.find((m) => m.name === expense.payer);
      const payerId = payerParticipant?.id;
      
      // Check if payer is in participants list
      const payerIsParticipant = payerId && expense.participants.includes(payerId);
      
      // Get list of participants who have marked as paid
      const paidBy = (expense as any).paidBy || [];
      
      // Calculate how much has been paid back
      let totalPaidBack = 0;
      paidBy.forEach((paidUserId: string) => {
        if (paidUserId !== payerId) {
          totalPaidBack += splitAmount;
        }
      });
      
      // Payer gets credited for (amount paid - their own share - amount already paid back)
      if (payerParticipant) {
        if (payerIsParticipant) {
          // Payer paid full amount but their share is already covered
          memberBalances[payerParticipant.name] += expense.amount - splitAmount - totalPaidBack;
        } else {
          // Payer paid full amount and isn't a participant
          memberBalances[payerParticipant.name] += expense.amount - totalPaidBack;
        }
      }
      
      // Each participant (excluding payer) owes their split amount (unless they marked as paid)
      expense.participants.forEach((participantId) => {
        const participant = group.members.find((m) => m.id === participantId);
        if (participant && participant.id !== payerId) {
          // Only count as debt if they haven't marked as paid
          if (!paidBy.includes(participantId)) {
            memberBalances[participant.name] -= splitAmount;
          }
        }
      });
    });

    // Convert to balance list
    const sortedBalances = Object.entries(memberBalances).sort(
      ([, a], [, b]) => a - b
    );

    let i = 0;
    let j = sortedBalances.length - 1;

    while (i < j) {
      const [debtor, debtAmount] = sortedBalances[i];
      const [creditor, creditAmount] = sortedBalances[j];

      if (Math.abs(debtAmount) < 0.01 && creditAmount < 0.01) break;

      const amount = Math.min(Math.abs(debtAmount), creditAmount);

      if (amount > 0.01) {
        balances.push({
          from: debtor,
          to: creditor,
          amount: amount,
        });
      }

      sortedBalances[i] = [debtor, debtAmount + amount];
      sortedBalances[j] = [creditor, creditAmount - amount];

      if (Math.abs(sortedBalances[i][1]) < 0.01) i++;
      if (Math.abs(sortedBalances[j][1]) < 0.01) j--;
    }

    return balances;
  };

  const getAllBalances = () => {
    const allBalances: {
      id: string;
      name: string;
      balance: number;
      group: string;
    }[] = [];

    // For each group, calculate simplified settlements involving the current user
    const currentUserName = user?.name || "You";
    
    groups.forEach((group) => {
      const balances = calculateBalances(group);
      
      // Filter to only show settlements involving the current user
      balances.forEach((balance) => {
        if (balance.from === "You" || balance.from === currentUserName) {
          // You owe someone
          allBalances.push({
            id: `${group.id}-${balance.to}`,
            name: balance.to,
            balance: -balance.amount, // Negative because you owe
            group: group.name,
          });
        } else if (balance.to === "You" || balance.to === currentUserName) {
          // Someone owes you
          allBalances.push({
            id: `${group.id}-${balance.from}`,
            name: balance.from,
            balance: balance.amount, // Positive because they owe you
            group: group.name,
          });
        }
      });
    });

    return allBalances;
  };

  if (showLanding && !isLoggedIn) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
        <Toaster />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (loading && groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your groups...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (currentPage === "dashboard") {
    return (
      <>
        <Dashboard
          groups={groups}
          onNavigate={handleNavigate}
          userName={user?.name || "User"}
          userPhotoUrl={user?.photoUrl}
          currency={user?.currency || "USD"}
          accessToken={accessToken}
          onGroupCreated={fetchGroups}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />
        {user && (
          <ProfileModal
            open={isProfileModalOpen}
            onOpenChange={setIsProfileModalOpen}
            user={user}
            accessToken={accessToken}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
        <Toaster />
      </>
    );
  }

  if (currentPage === "group" && selectedGroupId) {
    const group = groups.find((g) => g.id === selectedGroupId);
    if (group) {
      return (
        <>
          <GroupDetail
            groupName={group.name}
            expenses={group.expenses}
            balances={calculateBalances(group)}
            members={group.members}
            onNavigate={handleNavigate}
            userName={user?.name || "User"}
            userPhotoUrl={user?.photoUrl}
            currency={user?.currency || "USD"}
            onAddExpense={handleAddExpense}
            groupId={selectedGroupId}
            accessToken={accessToken}
            onMemberAdded={fetchGroups}
            onProfileClick={() => setIsProfileModalOpen(true)}
            onLogout={handleLogout}
            isOwner={(group as any).ownerId === user?.id}
            currentUserId={user?.id}
          />
          {user && (
            <ProfileModal
              open={isProfileModalOpen}
              onOpenChange={setIsProfileModalOpen}
              user={user}
              accessToken={accessToken}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
          <Toaster />
        </>
      );
    }
  }

  if (currentPage === "balances") {
    return (
      <>
        <BalancesPage
          balances={getAllBalances()}
          onNavigate={handleNavigate}
          userName={user?.name || "User"}
          userPhotoUrl={user?.photoUrl}
          currency={user?.currency || "USD"}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />
        {user && (
          <ProfileModal
            open={isProfileModalOpen}
            onOpenChange={setIsProfileModalOpen}
            user={user}
            accessToken={accessToken}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Dashboard
        groups={groups}
        onNavigate={handleNavigate}
        userName={user?.name || "User"}
        userPhotoUrl={user?.photoUrl}
        currency={user?.currency || "USD"}
        accessToken={accessToken}
        onGroupCreated={fetchGroups}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />
      {user && (
        <ProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          user={user}
          accessToken={accessToken}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
      <Toaster />
    </>
  );
}
