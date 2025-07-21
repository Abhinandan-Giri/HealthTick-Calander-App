"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  startOfDay,
  addMinutes,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  endOfDay,
} from "date-fns";
import type { Call, Client, CallType, OneTimeCall, RecurringCall } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { 
    collection, 
    query, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    Timestamp,
    onSnapshot 
} from "firebase/firestore";

export interface ProcessedSlot {
  time: Date;
  call: Call | null;
  isCovered: boolean;
}

export type UseCalendarView = ReturnType<typeof useCalendarView>;

export function useCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [calls, setCalls] = useState<Call[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure this runs only on the client
    setSelectedDate(startOfDay(new Date()));
  }, []);
  
  const fetchCalls = useCallback(async () => {
    try {
      const oneTimeCallsRef = collection(db, "oneTimeCalls");
      const recurringCallsRef = collection(db, "recurringCalls");

      const [oneTimeSnapshot, recurringSnapshot] = await Promise.all([
        getDocs(oneTimeCallsRef),
        getDocs(recurringCallsRef),
      ]);

      const oneTimeCallsData = oneTimeSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              startTime: (data.startTime as Timestamp).toDate(),
              isRecurring: false,
          } as OneTimeCall;
      });

      const recurringCallsData = recurringSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              ...data,
              id: doc.id,
              isRecurring: true,
          } as RecurringCall;
      });

      setCalls([...oneTimeCallsData, ...recurringCallsData]);
    } catch(error) {
      console.error("Error fetching calls:", error);
      toast({
        variant: "destructive",
        title: "Error loading calls",
        description: "Could not fetch bookings from the database. Please check your connection and Firestore setup."
      })
    }
  }, [toast]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);


  const timeSlots = useMemo(() => {
    const start = setSeconds(setMinutes(setHours(startOfDay(selectedDate), 10), 30), 0);
    const end = setSeconds(setMinutes(setHours(startOfDay(selectedDate), 19), 30), 0);
    const slots = [];
    let current = start;
    while (isBefore(current, end)) {
      slots.push(current);
      current = addMinutes(current, 20);
    }
    return slots;
  }, [selectedDate]);

  const dailyCalls = useMemo(() => {
    return calls.map(call => {
        if (call.isRecurring) {
            if (call.dayOfWeek === selectedDate.getDay()) {
                const [hours, minutes] = call.timeOfDay.split(':').map(Number);
                const startTime = setSeconds(setMinutes(setHours(startOfDay(selectedDate), hours), minutes), 0);
                return { ...call, startTime, duration: 20 };
            }
            return null;
        } else {
            if (isSameDay(call.startTime, selectedDate)) {
                return {...call, duration: 40};
            }
            return null;
        }
    }).filter((c): c is Call => c !== null);
  }, [calls, selectedDate]);


  const processedSlots = useMemo(() => {
    const callMap = new Map<string, Call>();
    dailyCalls.forEach(call => {
      callMap.set(call.startTime.toISOString(), call);
    });

    const slots: ProcessedSlot[] = timeSlots.map(time => ({
      time,
      call: callMap.get(time.toISOString()) || null,
      isCovered: false,
    }));
    
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (slot.call && slot.call.type === 'onboarding') {
            if (i + 1 < slots.length) {
                slots[i+1].isCovered = true;
            }
        }
    }

    return slots;
  }, [timeSlots, dailyCalls]);

  const addCall = async (data: { client: Client; callType: CallType; startTime: Date }): Promise<boolean> => {
    const newCallDuration = data.callType === 'onboarding' ? 40 : 20;
    const newCallEnd = addMinutes(data.startTime, newCallDuration);

    // Overlap check
    for (const existingCall of dailyCalls) {
        const existingCallEnd = addMinutes(existingCall.startTime, existingCall.duration);
        const startsDuring = existingCall.startTime >= data.startTime && existingCall.startTime < newCallEnd;
        const endsDuring = existingCallEnd > data.startTime && existingCallEnd <= newCallEnd;
        const spansOver = data.startTime >= existingCall.startTime && newCallEnd <= existingCallEnd;
        
        if (startsDuring || endsDuring || spansOver) {
             toast({
                variant: "destructive",
                title: "Booking Conflict",
                description: `This time slot overlaps with an existing call for ${existingCall.clientName}.`,
             });
             return false;
        }
    }
    
    try {
        if (data.callType === 'onboarding') {
            const oneTimeCallData = {
                clientId: data.client.id,
                clientName: data.client.name,
                type: 'onboarding',
                startTime: Timestamp.fromDate(data.startTime),
                duration: 40,
            };
            await addDoc(collection(db, "oneTimeCalls"), oneTimeCallData);
        } else {
            const recurringCallData = {
                clientId: data.client.id,
                clientName: data.client.name,
                type: 'follow-up',
                dayOfWeek: data.startTime.getDay(),
                timeOfDay: `${data.startTime.getHours().toString().padStart(2, '0')}:${data.startTime.getMinutes().toString().padStart(2, '0')}`,
                duration: 20,
            };
            await addDoc(collection(db, "recurringCalls"), recurringCallData);
        }
        
        fetchCalls(); // Refetch calls after adding a new one

        toast({
            title: "Call Booked!",
            description: `Your ${data.callType} call with ${data.client.name} has been scheduled.`,
        });
        return true;
    } catch (error) {
        console.error("Error adding call: ", error);
        toast({
            variant: "destructive",
            title: "Booking Error",
            description: "Could not save the booking. Please try again.",
        });
        return false;
    }
  };

  const deleteCall = async (callId: string, type: 'one-time' | 'recurring') => {
    const callToDelete = calls.find(c => c.id === callId);
    if (!callToDelete) return;

    try {
        const collectionName = type === 'one-time' ? 'oneTimeCalls' : 'recurringCalls';
        await deleteDoc(doc(db, collectionName, callId));
        
        fetchCalls(); // Refetch calls after deleting

        toast({
            title: "Call Deleted",
            description: `The call with ${callToDelete?.clientName} has been removed.`,
        });
    } catch (error) {
        console.error("Error deleting call: ", error);
        toast({
            variant: "destructive",
            title: "Deletion Error",
            description: "Could not delete the booking. Please try again.",
        });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    processedSlots,
    addCall,
    deleteCall,
  };
}
