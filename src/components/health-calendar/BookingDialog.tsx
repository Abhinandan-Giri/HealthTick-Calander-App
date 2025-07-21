"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Client, CallType } from "@/lib/types";
import { ClientCombobox } from "./ClientCombobox";
import { useToast } from "@/hooks/use-toast";
import type { UseCalendarView } from "@/hooks/use-calendar-view";

const bookingFormSchema = z.object({
  clientId: z.string().min(1, { message: "Please select a client." }),
  callType: z.enum(["onboarding", "follow-up"], {
    required_error: "You need to select a call type.",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  selectedSlot: Date | null;
  addCall: UseCalendarView["addCall"];
}

export function BookingDialog({
  isOpen,
  onClose,
  clients,
  selectedSlot,
  addCall,
}: BookingDialogProps) {
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: "",
      callType: "onboarding",
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    if (!selectedSlot) return;

    const client = clients.find((c) => c.id === data.clientId);
    if (!client) return;

    const success = await addCall({
      client,
      callType: data.callType as CallType,
      startTime: selectedSlot,
    });

    if (success) {
      toast({
        title: "Call Booked!",
        description: `Your ${data.callType} call with ${client.name} has been scheduled.`,
      });
      onClose();
      form.reset();
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a new call</DialogTitle>
          <DialogDescription>
            Select a client and call type for the time slot.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Client</FormLabel>
                  <ClientCombobox
                    clients={clients}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="callType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Call Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="onboarding" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Onboarding Call (40 mins)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="follow-up" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Follow-up Call (20 mins, weekly)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleDialogClose(false)}>Cancel</Button>
              <Button type="submit">Book Call</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
