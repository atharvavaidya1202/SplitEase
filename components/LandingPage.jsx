import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Users, PieChart, Bell, Shield, Zap, Globe } from "lucide-react";
import logo from "./Logo.jpg";
import { Footer } from "./Footer.jsx";

export function LandingPage({ onGetStarted }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-purple-500 to-pink-500 relative overflow-hidden">
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

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SplitEase" className="h-16 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Why Choose Us
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Contact
            </button>
          </div>

          <Button
            onClick={onGetStarted}
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 mb-6">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">Bill Sharing, Simplified</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl !leading-tight text-white drop-shadow-lg">
            Split Expenses With Friends, Roommates & Groups
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Track shared expenses, settle debts, and manage group finances effortlessly.
            The modern way to keep money matters simple and transparent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-teal-600 hover:bg-gray-100 transition-all text-lg px-10 h-16 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Start Splitting Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("how-it-works")}
              className="text-lg px-10 h-16 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 hover:border-white/60"
            >
              See How It Works
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-white/90">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 text-white" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Globe className="h-4 w-4 text-white" />
              <span>Multi-Currency</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-white" />
              <span>Real-Time Updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white/95 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 text-gray-900">
              Everything You Need to Manage Shared Expenses
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Powerful features designed to make splitting bills simple and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="text-gray-900">Group Management</h3>
                <p className="text-gray-600 text-sm">
                  Create unlimited groups for roommates, trips, events, or any shared expenses
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-purple-100 flex items-center justify-center">
                  <PieChart className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-gray-900">Smart Splitting</h3>
                <p className="text-gray-600 text-sm">
                  Automatically calculate who owes what with intelligent expense distribution
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Bell className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="text-gray-900">Real-Time Updates</h3>
                <p className="text-gray-600 text-sm">
                  Stay in sync with instant notifications when expenses are added or settled
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Globe className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-gray-900">Multi-Currency</h3>
                <p className="text-gray-600 text-sm">
                  Support for multiple currencies - perfect for international trips and global teams
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-gray-900">Secure & Private</h3>
                <p className="text-gray-600 text-sm">
                  Your data is encrypted and secure. We never share your information
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl transition-all hover:scale-105 bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-gray-900">Invite Codes</h3>
                <p className="text-gray-600 text-sm">
                  Simple invite codes with admin approval to keep your groups organized
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 text-white drop-shadow-lg">
              Why Choose SplitEase?
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto drop-shadow">
              We've built the most intuitive and powerful expense sharing platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-white">No More Awkward Money Conversations</h3>
                    <p className="text-white/80 text-sm">
                      Keep everything transparent and documented. Everyone knows exactly what they owe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-white">Simple & Intuitive Interface</h3>
                    <p className="text-white/80 text-sm">
                      Beautiful design that anyone can use. No learning curve, just start splitting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-white">Perfect for Any Situation</h3>
                    <p className="text-white/80 text-sm">
                      Roommates, trips, couples, friends, events - SplitEase works for all your needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-white">Free to Use</h3>
                    <p className="text-white/80 text-sm">
                      All core features are completely free. No hidden fees or premium tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white/95 backdrop-blur-sm border-2 border-white/40 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl mb-2 text-gray-900">Join Thousands of Users</h3>
                  <p className="text-gray-600">
                    Making shared expenses simple and stress-free
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-1 text-teal-600 font-bold">10K+</div>
                    <div className="text-xs text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1 text-purple-600 font-bold">50K+</div>
                    <div className="text-xs text-gray-600">Expenses Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-1 text-pink-600 font-bold">99%</div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-white/95 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-teal-600 flex items-center justify-center text-3xl text-white shadow-lg font-bold">
                1
              </div>
              <h3 className="text-gray-900">Create a Group</h3>
              <p className="text-gray-600 text-sm">
                Set up a group for your roommates, trip, or any shared expenses. Invite members using simple codes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl text-white shadow-lg font-bold">
                2
              </div>
              <h3 className="text-gray-900">Add Expenses</h3>
              <p className="text-gray-600 text-sm">
                Record expenses as they happen. Choose who paid and who's splitting the cost. It's that simple.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-pink-600 flex items-center justify-center text-3xl text-white shadow-lg font-bold">
                3
              </div>
              <h3 className="text-gray-900">Settle Up</h3>
              <p className="text-gray-600 text-sm">
                View balances instantly. SplitEase calculates who owes what, making settling up quick and easy.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-teal-600 hover:bg-teal-700 text-white text-lg px-10 h-16 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-4 text-white drop-shadow-lg">
            Get In Touch
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 drop-shadow">
            Have questions? We'd love to hear from you.
          </p>

          <Card className="p-8 border-white/40 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 text-left">
                <h3 className="text-gray-900">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📧</span>
                    </div>
                    <div>
                      <div className="text-gray-600">Email</div>
                      <div className="text-gray-900">support@splitease.app</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💬</span>
                    </div>
                    <div>
                      <div className="text-gray-600">Support Hours</div>
                      <div className="text-gray-900">Mon-Fri, 9AM-6PM EST</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🌐</span>
                    </div>
                    <div>
                      <div className="text-gray-600">Follow Us</div>
                      <div className="text-gray-900">@SplitEaseApp</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <h3 className="text-gray-900">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={onGetStarted}
                    className="block text-teal-600 hover:underline font-medium"
                  >
                    Sign Up / Login
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    How It Works
                  </button>
                  <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
