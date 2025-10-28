import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Receipt, Check, Eye } from "lucide-react";
import { formatAmount } from "../utils/currencies";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";

interface ExpenseCardProps {
  expenseId: string;
  description: string;
  payer: string;
  amount: number;
  date: string;
  participants: string[];
  currency: string;
  members: { id: string; name: string }[];
  paidBy?: string[];
  currentUserId?: string;
  onMarkPaid?: (expenseId: string, paid: boolean) => Promise<void>;
  onClick?: () => void;
}

export function ExpenseCard({ 
  expenseId,
  description, 
  payer, 
  amount, 
  date, 
  participants, 
  currency,
  members,
  paidBy = [],
  currentUserId,
  onMarkPaid,
  onClick
}: ExpenseCardProps) {
  // Find payer's ID
  const payerMember = members.find(m => m.name === payer);
  const payerId = payerMember?.id;
  
  // Check if current user is a participant (excluding payer)
  const isUserParticipant = currentUserId && participants.includes(currentUserId);
  const isUserPayer = currentUserId === payerId;
  const shouldShowCheckbox = isUserParticipant && !isUserPayer && onMarkPaid;
  
  // Check if user has marked as paid
  const isMarkedPaid = currentUserId ? paidBy.includes(currentUserId) : false;
  
  // Calculate user's share
  const userShare = isUserParticipant ? amount / participants.length : 0;
  
  // Calculate payment status
  const totalParticipants = participants.length;
  const paidCount = paidBy.length; // Count only those who marked as paid
  
  const handleCheckboxChange = async (checked: boolean) => {
    if (onMarkPaid) {
      await onMarkPaid(expenseId, checked);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on checkbox or label
    if ((e.target as HTMLElement).closest('input, label')) {
      return;
    }
    if (onClick && isUserPayer) {
      onClick();
    }
  };

  return (
    <Card 
      className={`group border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden relative ${isMarkedPaid ? 'bg-success/5' : ''} ${isUserPayer && onClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20 text-primary">
                {payer[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="mb-1 font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                {description}
              </div>
              <div className="text-sm text-muted-foreground">
                Paid by <span className="text-foreground font-medium">{payer}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>{date}</span>
                <span>•</span>
                <span>{participants.length} {participants.length === 1 ? "person" : "people"}</span>
              </div>
              
              {shouldShowCheckbox && (
                <div className="mt-3 flex items-center gap-2">
                  <Checkbox 
                    id={`paid-${expenseId}`}
                    checked={isMarkedPaid}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor={`paid-${expenseId}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {isMarkedPaid ? (
                      <span className="text-success flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Paid my share ({formatAmount(userShare, currency)})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Mark my share as paid ({formatAmount(userShare, currency)})
                      </span>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-primary font-semibold text-lg">{formatAmount(amount, currency)}</div>
            {isUserParticipant && !isUserPayer && (
              <div className="text-xs text-muted-foreground mt-1">
                Your share: {formatAmount(userShare, currency)}
              </div>
            )}
            {isUserPayer && onClick && (
              <div className="mt-2 flex items-center gap-2 justify-end">
                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                  <Eye className="h-3 w-3 mr-1" />
                  {paidCount}/{totalParticipants} paid
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
