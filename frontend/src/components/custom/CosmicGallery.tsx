import { useInfiniteQuery } from '@tanstack/react-query';
import { getApodRange, type ApodResponse } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Added Title/Desc for Accessiblity
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, X, Loader2, ExternalLink, PlayCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { subDays, format, parseISO } from 'date-fns';
import { useInView } from 'react-intersection-observer';

export function CosmicGallery() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ApodResponse | null>(null);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ApodResponse[]>({
    queryKey: ['apods-infinite'],
    initialPageParam: null, 
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      const sorted = [...lastPage].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return sorted[0].date;
    },
    queryFn: async ({ pageParam }) => {
      let endDate: Date;
      if (!pageParam) {
        endDate = subDays(new Date(), 1); 
      } else {
        endDate = subDays(parseISO(pageParam as string), 1);
      }
      const startDate = subDays(endDate, 6);
      return await getApodRange(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
    },
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage && !search) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, search, fetchNextPage]);

  const allItems = data?.pages.flatMap((page) => page) || [];
  const filteredData = allItems.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

  
  return (
    <div className="mt-20 container mx-auto px-4 mb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight border-l-8 border-blue-600 pl-6">
            Mission Archive
          </h2>
          <p className="text-zinc-400 mt-3 pl-8 text-base">
            Exploring {allItems.length} captured moments from the universe.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          <Input 
            placeholder="Search cosmic events..." 
            className="pl-12 h-12 bg-zinc-900/80 border-zinc-800 text-white focus:ring-2 focus:ring-blue-600 rounded-full transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- PROFESSIONAL GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {status === 'pending' ? (
           <GallerySkeleton />
        ) : filteredData.map((item, index) => (
            <div 
              key={`${item.date}-${index}`} 
              onClick={() => setSelectedItem(item)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-black relative">
                 {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg" />
                    </div>
                 )}
                 <img 
                    src={item.media_type === 'image' ? item.url : getThumbnail(item.url)} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                    onError={(e) => {
                        // Fallback for failed images
                        e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
                    }}
                 />
                 {/* Gradient Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
              </div>
              
              {/* Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20 backdrop-blur-md">
                        {item.date}
                    </span>
                    {item.media_type === 'video' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 backdrop-blur-md">
                            Video
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {item.title}
                </h3>
              </div>
            </div>
          ))}
      </div>

      {/* --- INFINITE SCROLL LOADER --- */}
      {!search && (
        <div ref={ref} className="mt-16 flex justify-center py-10">
            {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-3 text-blue-400 animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-sm tracking-widest uppercase font-semibold">Receiving Data Stream...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-zinc-600">
                    <div className="h-px w-12 bg-zinc-800"></div>
                    <span className="text-xs uppercase tracking-widest">End of Archive</span>
                    <div className="h-px w-12 bg-zinc-800"></div>
                </div>
            )}
        </div>
      )}

      {/* --- PERFECT DIALOG --- */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl h-[90vh] p-0 bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-xl focus:outline-none">
          
          {/* VISUALLY HIDDEN TITLE FOR ACCESSIBILITY */}
          <DialogTitle className="sr-only">{selectedItem?.title}</DialogTitle>
          <DialogDescription className="sr-only">Details for {selectedItem?.title}</DialogDescription>

          {/* LEFT PANEL: DETAILS (Scrollable) */}
          <div className="w-full lg:w-[450px] flex-shrink-0 bg-zinc-900/80 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col h-[40%] lg:h-full relative order-2 lg:order-1">
             
             {/* Header */}
             <div className="p-8 pb-4">
                <div className="flex items-center gap-3 text-blue-400 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-mono font-bold tracking-widest">{selectedItem?.date}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold leading-tight text-white mb-2">
                    {selectedItem?.title}
                </h2>
                {selectedItem?.copyright && (
                    <p className="text-xs text-zinc-500 font-mono uppercase">
                        © {selectedItem.copyright.replace(/\n/g, "")}
                    </p>
                )}
             </div>

             {/* Scrollable Body */}
             <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
                <p className="text-zinc-300 leading-relaxed text-sm lg:text-base border-l-2 border-zinc-700 pl-4 mb-8">
                    {selectedItem?.explanation}
                </p>
             </div>

             {/* Footer Actions */}
             <div className="p-8 pt-4 mt-auto border-t border-zinc-800 bg-zinc-900/50">
                <Button 
                    className="w-full py-6 text-base font-bold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    onClick={() => window.open(selectedItem?.hdurl || selectedItem?.url, '_blank')}
                >
                    <ExternalLink className="w-4 h-4" />
                    View High-Res Source
                </Button>
             </div>
          </div>

          {/* RIGHT PANEL: MEDIA (Full Height) */}
          <div className="flex-1 bg-black relative flex items-center justify-center h-[60%] lg:h-full order-1 lg:order-2 overflow-hidden group">
               {/* Close Button Floating */}
               <DialogClose className="absolute top-6 right-6 z-50 p-2 bg-black/60 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10">
                  <X className="h-6 w-6" />
               </DialogClose>

               {selectedItem?.media_type === 'image' ? (
                 <div className="relative w-full h-full">
                     {/* Blurred Background for Fill */}
                     <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125"
                        style={{ backgroundImage: `url(${selectedItem.url})` }}
                     />
                     <img 
                        src={selectedItem.hdurl || selectedItem.url} 
                        alt={selectedItem.title} 
                        className="relative z-10 h-full w-full object-contain p-2 lg:p-8" 
                     />
                 </div>
               ) : (
                 <iframe 
                    src={selectedItem?.url} 
                    className="w-full h-full" 
                    title={selectedItem?.title} 
                    allowFullScreen
                    frameBorder="0"
                 />
               )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to get YouTube thumbnails if needed
function getThumbnail(url: string | undefined | null) {
    // 1. Safety Check: If URL is missing, return a fallback image immediately
    if (!url) {
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
    }

    // 2. Standard Logic
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    return url; 
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <Skeleton className="aspect-[4/3] w-full bg-zinc-800" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                <Skeleton className="h-6 w-3/4 bg-zinc-800" />
            </div>
          </div>
      ))}
    </div>
  );
}