import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { formatAmount } from "../utils/currencies.jsx";

export function GroupCard({ name, balance, lastUpdated, memberCount, currency, onClick }) {
  const balanceColor = balance > 0 
    ? "text-emerald-600 dark:text-emerald-400" 
    : balance < 0 
    ? "text-rose-600 dark:text-rose-400" 
    : "text-success";
  
  const balanceText = balance > 0 
    ? `You're owed ${formatAmount(balance, currency)}` 
    : balance < 0 
    ? `You owe ${formatAmount(Math.abs(balance), currency)}` 
    : "Settled up";

  const BalanceIcon = balance > 0 ? TrendingUp : balance < 0 ? TrendingDown : CheckCircle2;
  
  // Assign gradient colors based on index or use random
  const gradientColors = [
    "from-cyan-500/10 to-blue-500/10",
    "from-purple-500/10 to-pink-500/10",
    "from-amber-500/10 to-orange-500/10",
    "from-emerald-500/10 to-teal-500/10",
  ];
  const gradientClass = gradientColors[Math.floor(Math.random() * gradientColors.length)];
  
  return (
    <Card
      className="group cursor-pointer hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden relative"
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="ml-2 bg-secondary/80 group-hover:bg-primary/10 transition-colors"
          >
            <Users className="mr-1 h-3 w-3" />
            {memberCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <div className={`flex items-center gap-2 ${balanceColor} font-medium`}>
          <BalanceIcon className="h-5 w-5" />
          <span>{balanceText}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          Updated {lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}
