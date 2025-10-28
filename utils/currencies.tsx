export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", flag: "🇦🇺" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", flag: "🇯🇵" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥", flag: "🇨🇳" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", flag: "🇸🇬" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "CHF", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr", flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", currency: "DKK", symbol: "kr", flag: "🇩🇰" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$", flag: "🇳🇿" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "$", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$", flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩", flag: "🇰🇷" },
  { code: "HK", name: "Hong Kong", currency: "HKD", symbol: "HK$", flag: "🇭🇰" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "﷼", flag: "🇸🇦" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "฿", flag: "🇹🇭" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "₱", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "₫", flag: "🇻🇳" },
  { code: "PL", name: "Poland", currency: "PLN", symbol: "zł", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", symbol: "Kč", flag: "🇨🇿" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺", flag: "🇹🇷" },
  { code: "RU", name: "Russia", currency: "RUB", symbol: "₽", flag: "🇷🇺" },
];

export function getCurrencySymbol(currency: string): string {
  const country = COUNTRIES.find((c) => c.currency === currency);
  return country?.symbol || currency;
}

export function formatAmount(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  
  // Format with 2 decimal places
  const formatted = amount.toFixed(2);
  
  // For symbols that go before the number
  if (["$", "£", "€", "₹", "¥", "R", "₩", "₱", "₺", "₽"].some(s => symbol.includes(s))) {
    return `${symbol}${formatted}`;
  }
  
  // For symbols that go after
  return `${formatted} ${symbol}`;
}
