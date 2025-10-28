import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { getCurrencySymbol } from "../utils/currencies.jsx";

export function AddExpenseModal({ open, onClose, members, currency, onSave }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !payer || participants.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        description,
        amount: parseFloat(amount),
        payer,
        participants,
      });
      // Reset form
      setDescription("");
      setAmount("");
      setPayer("");
      setParticipants([]);
      toast.success("Expense added successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (memberId) => {
    setParticipants((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new shared expense in {currency}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-border bg-input-background pl-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payer">Paid by</Label>
            <Select value={payer} onValueChange={setPayer} required>
              <SelectTrigger className="border-border">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Split between</Label>
            <div className="space-y-2 border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member.id}
                    checked={participants.includes(member.id)}
                    onCheckedChange={() => toggleParticipant(member.id)}
                  />
                  <label
                    htmlFor={member.id}
                    className="cursor-pointer flex-1"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
