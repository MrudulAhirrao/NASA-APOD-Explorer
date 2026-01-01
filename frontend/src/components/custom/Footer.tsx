import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-10 text-center md:text-left">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Credits */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-wider text-white">NASA EXPLORER</h3>
          <p className="text-sm text-zinc-500">
            Powered by NASA's APOD API. <br />
            Data courtesy of NASA/JPL-Caltech.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a href="#" className="text-zinc-400 hover:text-white transition-colors">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors">
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
      
      <div className="mt-10 text-center text-xs text-zinc-700">
        © 2026 Cosmic Explorer. All systems nominal.
      </div>
    </footer>
  );
}