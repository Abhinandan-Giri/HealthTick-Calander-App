export interface Client {
  id: string;
  name: string;
  phone: string;
}

export type CallType = "onboarding" | "follow-up";

interface BaseCall {
  id: string;
  // client is not stored in Firestore, but clientName and clientId are
  client?: Client; 
  clientId: string;
  clientName: string;
  type: CallType;
  duration: number; // in minutes
}

export interface OneTimeCall extends BaseCall {
  isRecurring: false;
  startTime: Date; // For rendering on a specific day
}

export interface RecurringCall extends BaseCall {
  isRecurring: true;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  timeOfDay: string; // "HH:mm"
  // startTime is synthesized for rendering
  startTime: Date;
}

export type Call = OneTimeCall | RecurringCall;
