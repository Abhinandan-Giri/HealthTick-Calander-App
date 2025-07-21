"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useCalendarView } from "@/hooks/use-calendar-view";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarGrid } from "./CalendarGrid";
import { BookingDialog } from "./BookingDialog";
import { clients } from "@/lib/clients";

export function HealthCalendar() {
  const {
    selectedDate,
    setSelectedDate,
    processedSlots,
    addCall,
    deleteCall,
  } = useCalendarView();
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const handleBookSlot = (slotDate: Date) => {
    setSelectedSlot(slotDate);
    setIsBookingDialogOpen(true);
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setSelectedDate(new Date())}>Goto Today</Button>
      </div>

      <CalendarGrid
        slots={processedSlots}
        onBookSlot={handleBookSlot}
        onDeleteCall={deleteCall}
      />

      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        clients={clients}
        selectedSlot={selectedSlot}
        addCall={addCall}
      />
    </div>
  );
}
