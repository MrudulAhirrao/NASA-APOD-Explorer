import { useQuery } from '@tanstack/react-query';
import { getApod } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronDownIcon, Download, AlertCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format, subDays } from 'date-fns';

export function ApodHero() {
  const [date, setDate] = useState<Date | undefined>(subDays(new Date(), 1));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['apod', date],
    queryFn: () => getApod(date ? format(date, 'yyyy-MM-dd') : undefined),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  if (isLoading) return <HeroSkeleton />;

  const hasError = isError || !data;

  const displayTitle = hasError ? "Signal Lost" : data.title;
  const displayExplanation = hasError
    ? "We couldn't retrieve the visual data for this stardate. It is likely a future date or the transmission was intercepted. Please adjust your mission clock (Date Picker)."
    : data.explanation;
  const imageUrl = hasError ? null : (data.hdurl || data.url);


  const forceDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_self');
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="relative w-full h-[85vh] overflow-hidden rounded-b-3xl shadow-2xl border-b border-white/10 bg-black">

      {/* 1. BACKGROUND LAYER */}
      {!hasError && data.media_type === 'image' && imageUrl && (
        <img
          src={imageUrl}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      )}

      {!hasError && data.media_type === 'video' && (
        <iframe
          src={data.url}
          className="absolute inset-0 w-full h-full"
          title="Space Video"
          allowFullScreen
        />
      )}

      {/* ERROR BACKGROUND (Static Noise) */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center flex-col gap-4">
          <div className="w-full h-full absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <AlertCircle className="w-16 h-16 text-red-500/50 z-10" />
          <span className="text-zinc-800 font-mono text-9xl font-bold z-10 opacity-20">404</span>
        </div>
      )}

      {/* 2. DARK OVERLAY (Always visible so text is readable) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

      {/* 3. CONTENT LAYER */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6 z-20">

        {/* TEXT INFO */}
        <div className="max-w-2xl space-y-4">
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${hasError ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/20 bg-white/10 text-white'}`}>
            {hasError ? 'TRANSMISSION ERROR' : `APOD • ${data.date}`}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            {displayTitle}
          </h1>

          <p className="text-gray-300 line-clamp-3 md:line-clamp-2 max-w-xl">
            {displayExplanation}
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-left font-normal bg-zinc-900/80 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md h-12">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </div>
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="end">
              <Calendar
                mode="single"
                selected={date}
                disabled={(d) => d > new Date() || d < new Date("1995-06-16")}
                onSelect={setDate}
                initialFocus
                className="text-white"
              />
            </PopoverContent>
          </Popover>

          <Button
            className="w-full bg-white text-black hover:bg-gray-200 font-bold h-12"
            disabled={hasError}
            onClick={() => {
              if (!imageUrl || !data) return;
              forceDownload(imageUrl, `APOD-${data.date}.jpg`);
            }}

          >
            <Download className="mr-2 h-4 w-4" />
            {hasError ? 'No Signal' : 'Download HD'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="w-full h-[85vh] bg-zinc-950 flex items-end p-12 relative overflow-hidden rounded-b-3xl">
      <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
      <div className="space-y-4 w-full relative z-10">
        <Skeleton className="h-8 w-32 bg-zinc-800/50" />
        <Skeleton className="h-16 w-3/4 bg-zinc-800/50" />
        <Skeleton className="h-4 w-1/2 bg-zinc-800/50" />
      </div>
    </div>
  );
}