import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ListColumn from "./ListColumn";
import ChatComponent from "./ChatComponent";
import type { Tables } from "@/hooks/supabase";

interface GuestChatColumnProps {
  bookings: Tables<"bookings">[] | undefined;
  selectedBookingId: string | null | undefined;
  setSelectedBookingId: (id: string) => void;
  bookingChatToRender: Tables<"chat">[] | null | undefined;
  onSendMessage: (message: string) => void;
}

export default function GuestChatColumn({
  bookings,
  selectedBookingId,
  setSelectedBookingId,
  bookingChatToRender,
  onSendMessage,
}: GuestChatColumnProps) {
  const selectedBooking = bookings?.find((b) => b.id === selectedBookingId);

  return (
    <ListColumn title="Guest Chat Inbox" count={bookings?.length || 0}>
      {!selectedBooking ? (
        <div className="space-y-2">
          {bookings?.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBookingId(booking.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedBookingId(booking.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedBookingId === booking.id
                  ? "bg-blue-100 border-blue-300 shadow-md"
                  : "hover:bg-slate-50 border-slate-200 hover:shadow-sm"
              }`}
              role="button"
              tabIndex={0}
            >
              <h4 className="font-medium text-slate-800">{booking.guest_name}</h4>
              <p className="text-sm text-slate-600">{booking.guest_email}</p>
              <p className="text-xs text-slate-500">
                Check-in: {new Date(booking.check_in_date_time).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <div className="text-sm font-medium text-slate-700">
              Chat with {selectedBooking.guest_name}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBookingId("")}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatComponent
              messages={bookingChatToRender}
              role="guest"
              title={""}
              onSendMessage={onSendMessage}
              containerClass="h-full"
            />
          </div>
        </div>
      )}
    </ListColumn>
  );
}