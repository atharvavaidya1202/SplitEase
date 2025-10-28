import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Receipt, CheckCircle2, XCircle, Users } from "lucide-react";
import { formatAmount } from "../utils/currencies.jsx";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export function ExpenseDetailModal({
  open,
  onOpenChange,
  expense,
  members,
  currency,
}) {
  const splitAmount = expense.amount / expense.participants.length;
  const paidBy = expense.paidBy || [];

  // Get participant details
  const participantDetails = expense.participants.map((participantId) => {
    const member = members.find((m) => m.id === participantId);
    return {
      id: participantId,
      name: member?.name || "Unknown",
      hasPaid: paidBy.includes(participantId),
    };
  });

  // Find payer
  const payerMember = members.find((m) => m.name === expense.payer);
  const payerId = payerMember?.id;

  // Separate paid and unpaid participants
  const paidParticipants = participantDetails.filter((p) => p.hasPaid);
  const unpaidParticipants = participantDetails.filter((p) => !p.hasPaid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-primary" />
            Expense Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Expense Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{expense.description}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Paid by <span className="text-foreground font-medium">{expense.payer}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-primary">
                  {formatAmount(expense.amount, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{expense.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Split among {expense.participants.length} people</span>
              <Badge variant="secondary" className="ml-auto">
                {formatAmount(splitAmount, currency)} per person
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Payment Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Payment Status</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">{paidParticipants.length} paid</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{unpaidParticipants.length} pending</span>
              </div>
            </div>

            {/* Paid Participants */}
            {paidParticipants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Paid</p>
                <div className="space-y-2">
                  {paidParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <Avatar className="h-9 w-9 border-2 border-success/30">
                        <AvatarFallback className="bg-success/10 text-success">
                          {participant.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {participant.name}
                          {participant.id === payerId && (
                            <span className="ml-2 text-xs text-muted-foreground">(Payer)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(splitAmount, currency)}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unpaid Participants */}
            {unpaidParticipants.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending</p>
                <div className="space-y-2">
                  {unpaidParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <Avatar className="h-9 w-9 border-2 border-border">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {participant.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(splitAmount, currency)}
                        </p>
                      </div>
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Collected</span>
              <span className="font-semibold text-primary">
                {formatAmount(paidParticipants.length * splitAmount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Outstanding</span>
              <span className="font-semibold text-foreground">
                {formatAmount(unpaidParticipants.length * splitAmount, currency)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
