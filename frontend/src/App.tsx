import { ApodHero } from "@/components/custom/ApodHero";
import { CosmicGallery } from "@/components/custom/CosmicGallery";
import { Footer } from "@/components/custom/Footer"; 

function App() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-black font-bold">N</div>
          <span className="font-bold text-lg tracking-wider">NASA EXPLORER</span>
        </div>
        <div className="text-xs text-gray-400 font-mono hidden md:block">
          SECURE CONNECTION • V1.0
        </div>
      </nav>

      <ApodHero />

      <CosmicGallery />
      
      <Footer />
    </main>
  );
}

export default App;