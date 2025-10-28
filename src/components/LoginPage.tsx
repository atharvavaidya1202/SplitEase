import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { COUNTRIES } from "../utils/currencies";
import { supabase, apiCall } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { Loader2 } from "lucide-react";
import logo from "figma:asset/b4ec9e76aba91391a8781963fd719fd9f067c979.png";
import { Footer } from "./Footer";

interface LoginPageProps {
  onLogin: (user: any, accessToken: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const country = COUNTRIES.find((c) => c.code === selectedCountry);
        if (!country) {
          toast.error("Please select a country");
          setLoading(false);
          return;
        }

        const { user } = await apiCall("/signup", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            name,
            country: country.name,
            currency: country.currency,
          }),
        });

        // Now sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error(signInError.message);
          setLoading(false);
          return;
        }

        toast.success("Account created successfully!");
        onLogin(
          {
            id: signInData.user.id,
            email: signInData.user.email,
            name,
            country: country.name,
            currency: country.currency,
          },
          signInData.session.access_token
        );
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        // Get user data from backend
        const userData = await apiCall("/user", {}, data.session.access_token);

        toast.success("Welcome back!");
        onLogin(userData.user, data.session.access_token);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle specific error cases
      if (error.message && error.message.includes("already been registered")) {
        toast.error("This email is already registered. Please sign in instead.", {
          action: {
            label: "Go to Sign In",
            onClick: () => {
              setIsSignUp(false);
              setPassword("");
            },
          },
          duration: 5000,
        });
      } else if (error.message && error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "Authentication failed. Please try again.");
      }
      
      setLoading(false);
    }
  };

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Logo above card */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <img src={logo} alt="SplitEase" className="h-36 w-auto drop-shadow-2xl" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-white/20 backdrop-blur-sm bg-white/95 relative">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl text-gray-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {isSignUp
                ? "Join thousands splitting expenses with friends"
                : "Sign in to manage your shared expenses"}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border bg-input-background transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-input-background transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border bg-input-background transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="country">Country & Currency</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="border-border bg-input-background transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-muted-foreground">
                            ({country.currency})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCountryData && (
                  <p className="text-sm text-muted-foreground">
                    Your default currency will be {selectedCountryData.currency} (
                    {selectedCountryData.symbol})
                  </p>
                )}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"}</>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
      </div>

      <Footer />
    </div>
  );
}
