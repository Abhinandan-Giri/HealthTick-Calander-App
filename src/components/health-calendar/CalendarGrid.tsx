"use client";

import { format } from "date-fns";
import type { ProcessedSlot } from "@/hooks/use-calendar-view";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Trash2, User, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";


interface CalendarGridProps {
  slots: ProcessedSlot[];
  onBookSlot: (date: Date) => void;
  onDeleteCall: (callId: string, type: 'one-time' | 'recurring') => void;
}

export function CalendarGrid({ slots, onBookSlot, onDeleteCall }: CalendarGridProps) {
  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg border border-dashed">
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[max-content_1fr] border rounded-lg overflow-hidden">
      {slots.map((slot, index) => {
        if (slot.isCovered) return null;

        const rowSpan = slot.call && slot.call.type === "onboarding" ? "md:row-span-2" : "md:row-span-1";
        
        return (
          <React.Fragment key={slot.time.toISOString()}>
            <div className={cn(
              "p-4 text-sm font-medium text-muted-foreground border-b md:border-b-0 md:border-r text-center",
               index === slots.length - 1 ? 'border-b-0' : '',
               rowSpan
              )}>
              {format(slot.time, "h:mm a")}
            </div>
            <div className={cn(
              "p-2 border-b",
               index === slots.length - 1 ? 'border-b-0' : '',
               rowSpan,
               slot.call ? 'bg-card' : 'bg-background hover:bg-muted/50 transition-colors'
            )}>
              {slot.call ? (
                <CallCard call={slot.call} onDeleteCall={onDeleteCall} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Button variant="ghost" className="text-accent-foreground" onClick={() => onBookSlot(slot.time)}>
                    Available - Book Now
                  </Button>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

import React from 'react';
import type { Call } from "@/lib/types";

function CallCard({ call, onDeleteCall }: { call: Call; onDeleteCall: CalendarGridProps['onDeleteCall'] }) {
  const isFollowUp = call.type === 'follow-up';
  
  return (
    <Card className="h-full shadow-md bg-opacity-80">
      <CardHeader className="p-3">
        <CardTitle className="flex justify-between items-start text-base">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{call.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{call.duration} mins</span>
            </div>
          </div>
          <Badge variant={isFollowUp ? "secondary" : "default"} className={cn(isFollowUp ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')}>
            {call.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the call with {call.clientName}. 
                {call.isRecurring && " All future occurrences of this recurring call will also be removed."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteCall(call.id, call.isRecurring ? 'recurring' : 'one-time')}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
