import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import useInbox from "@/hooks/useInbox";
import useFAQ from "@/hooks/useFAQ";
import usePartners from "@/hooks/usePartners";
import useProperties from "@/hooks/useProperties";
import useQueryParams from "@/hooks/useQueryParams";
import type { Enums } from "@/hooks/supabase";
import getSupabaseClient from "@/hooks/getSupabaseClient";
import GuestChatColumn from "./GuestChatColumn";
import TasksColumn from "./TasksColumn";
import FAQColumn from "./FAQColumn";
import PartnersColumn from "./PartnersColumn";
import PropertiesColumn from "./PropertiesColumn";
import TaskChatColumn from "./TaskChatColumn";

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
  const { properties, insertProperty, deleteProperty } = useProperties();

  // Column configuration
  const columnFilters = [
    { key: "showGuests", label: "Guests", id: "guests-toggle" },
    { key: "showTasks", label: "Tasks", id: "tasks-toggle" },
    { key: "showFAQ", label: "FAQ", id: "faq-toggle" },
    { key: "showPartners", label: "Partners", id: "partners-toggle" },
    { key: "showProperties", label: "Properties", id: "properties-toggle" },
    { key: "showTaskChat", label: "Task Chat", id: "task-chat-toggle" },
  ] as const;

  // Column visibility settings with query params
  const [columnSettings, setColumnSettings] = useQueryParams({
    showGuests: true,
    showTasks: true,
    showFAQ: true,
    showPartners: false,
    showProperties: false,
    showTaskChat: true,
  });

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId);

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

  const handleInsertFAQ = async (question: string, answer: string) => {
    await insertFAQ({
      question,
      answer,
    });
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
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleInsertPartner = async (partner: {
    name: string;
    email: string;
    phone: string | null;
    type: Enums<"task_type">;
  }) => {
    await insertPartner(partner);
  };

  const handleInsertProperty = async (property: {
    address: string;
    wifi_ssid?: string;
    wifi_password?: string;
    access_instructions?: string;
  }) => {
    await insertProperty(property);
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
    switch (Math.min(visibleColumns, 6)) {
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
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          DigiHome Dashboard
        </h1>
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            onClick={clearAndSeedDatabase}
            variant="outline"
            className="bg-white/80 hover:bg-white border-slate-300"
          >
            Clear & Seed Database
          </Button>

          {/* Column Toggles */}
          <div className="flex gap-4 items-center bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Columns:</span>

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
      <div className="flex-1 px-6 pb-6 min-h-0 overflow-auto">
        <div className={`grid ${getGridClass()} gap-6 h-full`}>
          {/* Column 1: Guest Chat Inbox */}
          {columnSettings.showGuests && (
            <GuestChatColumn
              bookings={bookings}
              selectedBookingId={selectedBookingId}
              setSelectedBookingId={setSelectedBookingId}
              bookingChatToRender={bookingChatToRender}
              onSendMessage={handleSendGuestMessage}
            />
          )}

          {/* Column 3: FAQ */}
          {columnSettings.showFAQ && (
            <FAQColumn
              faqs={faqs}
              onInsertFAQ={handleInsertFAQ}
              onDeleteFAQ={deleteFAQ}
            />
          )}

          {/* Column 4: Partners */}
          {columnSettings.showPartners && (
            <PartnersColumn
              partners={partners}
              onInsertPartner={handleInsertPartner}
              onDeletePartner={deletePartner}
            />
          )}

          {/* Column 5: Properties */}
          {columnSettings.showProperties && (
            <PropertiesColumn
              properties={properties}
              onInsertProperty={handleInsertProperty}
              onDeleteProperty={deleteProperty}
            />
          )}

          {/* Column 2: Tasks List */}
          {columnSettings.showTasks && (
            <TasksColumn
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              setSelectedTaskId={setSelectedTaskId}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Column 6: Task Chat (Partner Communication) */}
          {columnSettings.showTaskChat && (
            <TaskChatColumn
              selectedTask={selectedTask}
              taskChatToRender={taskChatToRender}
              onSendMessage={handleSendPartnerMessage}
              onDeselectTask={() => setSelectedTaskId("")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
