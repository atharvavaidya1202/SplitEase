import { Header } from "./Header.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatAmount } from "../utils/currencies.jsx";
import { Footer } from "./Footer.jsx";

export function BalancesPage({ balances, onNavigate, userName, userPhotoUrl, currency, onProfileClick, onLogout }) {
  const totalOwed = balances
    .filter((b) => b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0);
  const totalOwe = balances
    .filter((b) => b.balance < 0)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);
  const netBalance = totalOwed - totalOwe;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-background to-purple-50/50 flex flex-col">
      <Header userName={userName} userPhotoUrl={userPhotoUrl} onNavigate={onNavigate} currentPage="balances" onProfileClick={onProfileClick} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="mb-2">All Balances</h1>
          <p className="text-muted-foreground">
            Overview of all your balances across groups
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Total You're Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-600">
                {formatAmount(totalOwed, currency)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Total You Owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-600">
                {formatAmount(totalOwe, currency)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={netBalance >= 0 ? "text-green-600" : "text-red-600"}>
                {netBalance >= 0 ? "+" : ""}{formatAmount(Math.abs(netBalance), currency)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balances List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Individual Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No balances to show. You're all settled up!
              </p>
            ) : (
              <div className="divide-y divide-border">
                {balances.map((balance) => (
                  <div
                    key={balance.id}
                    className="py-4 flex items-center justify-between hover:bg-accent/50 -mx-6 px-6 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="mb-1">{balance.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        {balance.group}
                      </Badge>
                    </div>
                    <div
                      className={`text-right ${
                        balance.balance > 0
                          ? "text-green-600"
                          : balance.balance < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {balance.balance > 0 && (
                        <div className="text-sm text-muted-foreground mb-1">
                          owes you
                        </div>
                      )}
                      {balance.balance < 0 && (
                        <div className="text-sm text-muted-foreground mb-1">
                          you owe
                        </div>
                      )}
                      <div>
                        {formatAmount(Math.abs(balance.balance), currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
