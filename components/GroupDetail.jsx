import { useState, useEffect } from "react";
import { Header } from "./Header.jsx";
import { ExpenseCard } from "./ExpenseCard.jsx";
import { AddExpenseModal } from "./AddExpenseModal.jsx";
import { AddMemberModal } from "./AddMemberModal.jsx";
import { InviteCodeDisplay } from "./InviteCodeDisplay.jsx";
import { PendingRequestsModal } from "./PendingRequestsModal.jsx";
import { ExpenseDetailModal } from "./ExpenseDetailModal.jsx";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, ArrowLeft, UserPlus, Share2, Bell } from "lucide-react";
import { Separator } from "./ui/separator";
import { formatAmount } from "../utils/currencies.jsx";
import { Badge } from "./ui/badge";
import { apiCall } from "../utils/supabase/client.jsx";
import { toast } from "sonner@2.0.3";
import { Footer } from "./Footer.jsx";

export function GroupDetail({
  groupName,
  expenses,
  balances,
  members,
  onNavigate,
  userName,
  userPhotoUrl,
  currency,
  onAddExpense,
  groupId,
  accessToken,
  onMemberAdded,
  onProfileClick,
  onLogout,
  isOwner = false,
  currentUserId,
}) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isInviteCodeOpen, setIsInviteCodeOpen] = useState(false);
  const [isPendingRequestsOpen, setIsPendingRequestsOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);

  useEffect(() => {
    if (isOwner) {
      fetchPendingRequestsCount();
    }
  }, [isOwner, groupId]);

  const fetchPendingRequestsCount = async () => {
    try {
      const { requests } = await apiCall(
        `/groups/${groupId}/pending-requests`,
        {},
        accessToken
      );
      setPendingRequestsCount(requests?.length || 0);
    } catch (error) {
      console.error("Failed to fetch pending requests count:", error);
    }
  };

  const handleMarkPaid = async (expenseId, paid) => {
    try {
      await apiCall(
        `/groups/${groupId}/expenses/${expenseId}/mark-paid`,
        {
          method: "POST",
          body: JSON.stringify({ paid }),
        },
        accessToken
      );
      
      toast.success(paid ? "Marked as paid!" : "Unmarked as paid");
      
      // Refresh the group data
      await onMemberAdded();
    } catch (error) {
      console.error("Failed to mark expense as paid:", error);
      toast.error(error.message || "Failed to update payment status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-background to-purple-50/50 flex flex-col">
      <Header userName={userName} userPhotoUrl={userPhotoUrl} onNavigate={onNavigate} currentPage="group" onProfileClick={onProfileClick} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8 pb-24 flex-1">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
          <h1>{groupName}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Expenses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2>Expenses</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpenseModalOpen(true)}
                className="md:hidden"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {expenses.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No expenses yet. Add one to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseCard 
                    key={expense.id} 
                    expenseId={expense.id}
                    description={expense.description}
                    payer={expense.payer}
                    amount={expense.amount}
                    date={expense.date}
                    participants={expense.participants}
                    currency={currency}
                    members={members}
                    paidBy={expense.paidBy}
                    currentUserId={currentUserId}
                    onMarkPaid={handleMarkPaid}
                    onClick={() => {
                      setSelectedExpense(expense);
                      setIsExpenseDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Balances Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle>Group Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">
                      {members.length} members
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMemberModalOpen(true)}
                      className="h-8 px-2 text-primary hover:text-primary"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="px-3 py-1 bg-secondary rounded-full text-sm"
                      >
                        {member.name}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {isOwner && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">Group Admin</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInviteCodeOpen(true)}
                        className="w-full justify-start"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Generate Invite Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPendingRequestsOpen(true)}
                        className="w-full justify-start relative"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Pending Requests
                        {pendingRequestsCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto h-5 w-5 p-0 flex items-center justify-center rounded-full"
                          >
                            {pendingRequestsCount}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    <Separator />
                  </>
                )}

                

                <div>
                  <div className="mb-3">Balances</div>
                  {balances.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All settled up! 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {balances.map((balance, index) => (
                        <div
                          key={index}
                          className="p-3 bg-accent rounded-lg"
                        >
                          <div className="text-sm">
                            <span>{balance.from}</span>
                            <span className="text-muted-foreground mx-2">owes</span>
                            <span>{balance.to}</span>
                          </div>
                          <div className="text-primary mt-1">
                            {formatAmount(balance.amount, currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Button
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 p-0 bg-gradient-to-br from-primary to-teal-600 hover:scale-110 hover:rotate-90 z-10"
        onClick={() => setIsExpenseModalOpen(true)}
      >
        <Plus className="h-8 w-8" />
      </Button>

      <AddExpenseModal
        open={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        members={members}
        currency={currency}
        onSave={onAddExpense}
      />

      <AddMemberModal
        open={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        groupId={groupId}
        accessToken={accessToken}
        onMemberAdded={onMemberAdded}
      />

      {isOwner && (
        <>
          <InviteCodeDisplay
            open={isInviteCodeOpen}
            onOpenChange={setIsInviteCodeOpen}
            groupId={groupId}
            groupName={groupName}
            accessToken={accessToken}
          />
          <PendingRequestsModal
            open={isPendingRequestsOpen}
            onOpenChange={setIsPendingRequestsOpen}
            groupId={groupId}
            accessToken={accessToken}
            onRequestHandled={() => {
              fetchPendingRequestsCount();
              onMemberAdded();
            }}
          />
        </>
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          open={isExpenseDetailOpen}
          onOpenChange={setIsExpenseDetailOpen}
          expense={selectedExpense}
          members={members}
          currency={currency}
        />
      )}

      <Footer />
    </div>
  );
}
