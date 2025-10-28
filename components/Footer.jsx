import { Github, Twitter, Mail } from "lucide-react";
import logo from "./Logo.jpg";

export function Footer() {
  return (
    <footer className="mt-auto relative overflow-hidden z-0">
      {/* Gradient background using logo colors */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-500 to-amber-400"></div>
      <div className="absolute inset-0 backdrop-blur-sm bg-blue-900/90"></div>

      {/* Content */}
      <div className="relative border-t border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Main branding with logo */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="SplitEase" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">
                  SplitEase ™
                </span>
                <span className="text-xs text-blue-100">
                  Making expense sharing simple
                </span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Twitter"
              >
                <Twitter className="h-3.5 w-3.5 text-white" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="GitHub"
              >
                <Github className="h-3.5 w-3.5 text-white" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5 text-white" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-blue-100">
              © 2025 SplitEase. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
