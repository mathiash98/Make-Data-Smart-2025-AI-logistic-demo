import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useInbox from "@/hooks/useInbox";
import useFAQ from "@/hooks/useFAQ";
import usePartners from "@/hooks/usePartners";
import useQueryParams from "@/hooks/useQueryParams";
import type { Enums } from "@/hooks/supabase";
import getSupabaseClient from "@/hooks/getSupabaseClient";
import ChatComponent from "./ChatComponent";

export default function Dashboard() {
  const {
    selectedBookingId,
    selectedTaskId,
    setSelectedBookingId,
    setSelectedTaskId,
    bookingChatToRender,
    taskChatToRender,
    addChatMessage,
    tasks,
    bookings,
    clearAndSeedDatabase,
  } = useInbox(["booking", "task"]);

  const { faqs, insertFAQ, deleteFAQ } = useFAQ();
  const { partners, insertPartner, deletePartner } = usePartners();

  // Column configuration
  const columnFilters = [
    { key: "showGuests", label: "Guests", id: "guests-toggle" },
    { key: "showTasks", label: "Tasks", id: "tasks-toggle" },
    { key: "showFAQ", label: "FAQ", id: "faq-toggle" },
    { key: "showPartners", label: "Partners", id: "partners-toggle" },
    { key: "showTaskChat", label: "Task Chat", id: "task-chat-toggle" },
  ] as const;

  // Column visibility settings with query params
  const [columnSettings, setColumnSettings] = useQueryParams({
    showGuests: true,
    showTasks: true,
    showFAQ: true,
    showPartners: true,
    showTaskChat: true,
  });

  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newPartnerType, setNewPartnerType] =
    useState<Enums<"task_type">>("cleaning");

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId);
  const selectedBooking = bookings?.find((b) => b.id === selectedBookingId);

  const getStatusBadgeVariant = (status?: Enums<"task_status">) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "outline";
      case "in_progress":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleSendGuestMessage = async (message: string) => {
    if (!message.trim() || !selectedBookingId) return;

    try {
      await addChatMessage({
        booking_id: selectedBookingId,
        message: message,
        sender: "user",
        source: "app",
      });
    } catch (error) {
      console.error("Error sending guest message:", error);
    }
  };

  const handleSendPartnerMessage = async (message: string) => {
    if (!message.trim() || !selectedTaskId) return;

    try {
      await addChatMessage({
        task_id: selectedTaskId,
        message: message,
        sender: "partner",
        source: "app",
      });
    } catch (error) {
      console.error("Error sending partner message:", error);
    }
  };

  const handleAddFAQ = async () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    try {
      await insertFAQ({
        question: newFaqQuestion,
        answer: newFaqAnswer,
      });
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Enums<"task_status">
  ) => {
    const supabaseClient = getSupabaseClient();

    try {
      const { error } = await supabaseClient
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task status:", error);
      } else {
        // Refresh tasks to show updated status
        // The realtime subscription should handle this automatically
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleAddPartner = async () => {
    if (!newPartnerName.trim() || !newPartnerEmail.trim()) return;

    try {
      await insertPartner({
        name: newPartnerName,
        email: newPartnerEmail,
        phone: newPartnerPhone || null,
        type: newPartnerType,
      });
      setNewPartnerName("");
      setNewPartnerEmail("");
      setNewPartnerPhone("");
      setNewPartnerType("cleaning");
    } catch (error) {
      console.error("Error adding partner:", error);
    }
  };

  const toggleColumn = (column: keyof typeof columnSettings) => {
    setColumnSettings({
      ...columnSettings,
      [column]: !columnSettings[column],
    });
  };

  // Calculate responsive grid classes
  const visibleColumns = Object.values(columnSettings).filter(Boolean).length;
  const getGridClass = () => {
    switch (Math.min(visibleColumns, 5)) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DigiHome Dashboard
        </h1>
        <div className="flex flex-wrap gap-4 items-center">
          <Button onClick={clearAndSeedDatabase} variant="outline">
            Clear & Seed Database
          </Button>

          {/* Column Toggles */}
          <div className="flex gap-4 items-center bg-white rounded-lg p-3 border">
            <span className="text-sm font-medium text-gray-700">Columns:</span>

            {columnFilters.map((filter) => (
              <div key={filter.key} className="flex items-center gap-2">
                <Switch
                  checked={columnSettings[filter.key]}
                  onCheckedChange={() => toggleColumn(filter.key)}
                  id={filter.id}
                />
                <label htmlFor={filter.id} className="text-sm cursor-pointer">
                  {filter.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Column Layout */}
      <div className={`grid ${getGridClass()} gap-6 h-[calc(100vh-250px)]`}>
        {/* Column 1: Guest Chat Inbox */}
        {columnSettings.showGuests && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Guest Chat Inbox
                <Badge variant="secondary">{bookings?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Guest Bookings List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {bookings?.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBookingId === booking.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <h4 className="font-medium">{booking.guest_name}</h4>
                      <p className="text-sm text-gray-500">
                        {booking.guest_email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Check-in:{" "}
                        {new Date(
                          booking.check_in_date_time
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              {/* Selected Booking Chat */}
              {selectedBooking && (
                <ChatComponent
                  messages={bookingChatToRender}
                  role="guest"
                  title={`Chat with ${selectedBooking.guest_name}`}
                  onSendMessage={handleSendGuestMessage}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Column 2: Tasks List */}
        {columnSettings.showTasks && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Tasks
                <Badge variant="secondary">{tasks?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Tasks List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {tasks?.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTaskId === task.id
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{task.type}</Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status?.replace("_", " ")}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm">
                        {task.task_description}
                      </h4>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              {/* Task Details */}
              {selectedTask && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Task Details</div>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedTask.type}
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium">Status:</span>
                      <Select
                        value={selectedTask.status}
                        onValueChange={(value) =>
                          handleStatusChange(selectedTask.id, value)
                        }
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {selectedTask.task_description}
                    </div>
                    {selectedTask.due_date && (
                      <div>
                        <span className="font-medium">Due:</span>{" "}
                        {new Date(selectedTask.due_date).toLocaleString()}
                      </div>
                    )}
                    {selectedTask.can_start_after && (
                      <div>
                        <span className="font-medium">Start After:</span>{" "}
                        {new Date(
                          selectedTask.can_start_after
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Column 3: FAQ */}
        {columnSettings.showFAQ && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                FAQ Management
                <Badge variant="secondary">{faqs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Add FAQ Form */}
              <div className="space-y-2">
                <Input
                  placeholder="Question"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                />
                <Textarea
                  placeholder="Answer"
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  rows={2}
                />
                <Button onClick={handleAddFAQ} size="sm" className="w-full">
                  Add FAQ
                </Button>
              </div>

              <Separator />

              {/* FAQ List */}
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFAQ(faq.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Column 4: Partners */}
        {columnSettings.showPartners && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Partners
                <Badge variant="secondary">{partners.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {/* Add Partner Form */}
              <div className="space-y-2">
                <Input
                  placeholder="Partner Name"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={newPartnerEmail}
                  onChange={(e) => setNewPartnerEmail(e.target.value)}
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                />
                <Select
                  value={newPartnerType}
                  onValueChange={(value) =>
                    setNewPartnerType(value as Enums<"task_type">)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddPartner} className="w-full">
                  Add Partner
                </Button>
              </div>

              <Separator />

              {/* Partners List */}
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {partners.map((partner) => (
                    <div key={partner.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{partner.name}</h4>
                        <Badge variant="outline">{partner.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {partner.email}
                      </p>
                      {partner.phone && (
                        <p className="text-sm text-gray-600 mb-2">
                          {partner.phone}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePartner(partner.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Column 5: Task Chat (Partner Communication) */}
        {columnSettings.showTaskChat && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Task Communication</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {selectedTask ? (
                <ChatComponent
                  messages={taskChatToRender}
                  role="partner"
                  title={`Chat for: ${selectedTask.task_description}`}
                  containerClass="h-256"
                  onSendMessage={handleSendPartnerMessage}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a task to view communication
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
