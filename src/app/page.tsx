import { HealthCalendar } from '@/components/health-calendar/HealthCalendar';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-2">
          <img src='./favicon.ico' className='h-15'></img>
          <h1 className="text-xl font-bold font-headline text-foreground">
            HealthTick Calendar App
          </h1>
        </div>
      </header>
      <main className="flex-1 container py-4 md:py-8">
        <HealthCalendar />
      </main>
    </div>
  );
}
