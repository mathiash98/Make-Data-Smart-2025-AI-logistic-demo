import { useState, useEffect, useMemo } from "react";
import getSupabaseClient from "./getSupabaseClient";
import type { Tables } from "./supabase";

export default function useInbox(inboxType: ("booking" | "task")[]) {
  const supabaseClient = getSupabaseClient();
  // Connect to realtime supabase for bookings and tasks

  // Fetch most recent 20 bookings and tasks

  // Map to a chat type

  const [bookings, setBookings] = useState<Tables<"bookings">[]>();
  const [tasks, setTasks] = useState<Tables<"tasks">[]>();
  const [chats, setChats] = useState<InboxChat[]>([]);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>();

  function setSelectedChat(bookingId?: string, taskId?: string) {
    setSelectedBookingId(bookingId);
    setSelectedTaskId(taskId);
  }

  const [bookingChatToRender, setBookingChatToRender] = useState<
    Tables<"chat">[] | null
  >();

  useEffect(() => {
    if (selectedBookingId) {
      fetchChatMessages(selectedBookingId, undefined).then((messages) => {
        setBookingChatToRender(messages);
      });
    } else {
      setBookingChatToRender(null);
    }
  }, [selectedBookingId]);

  const [taskChatToRender, setTaskChatToRender] = useState<
    Tables<"chat">[] | null
  >();
  useEffect(() => {
    if (selectedTaskId) {
      fetchChatMessages(undefined, selectedTaskId).then((messages) => {
        setTaskChatToRender(messages);
      });
    } else {
      setTaskChatToRender(null);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    fetchAllChats().then(setChats);
  }, []);

  useEffect(() => {
    const cleanup = setupSupabaseSubscription();
    return cleanup;
  }, [selectedBookingId, selectedTaskId]);

  async function fetchAllBookings() {
    const { data, error } = await supabaseClient
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      throw error;
    }
    setBookings(data);
    return data;
  }

  async function fetchAllTasks() {
    const { data, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      throw error;
    }
    setTasks(data);
    return data;
  }

  async function fetchAllChats() {
    const bookings = await fetchAllBookings();
    const tasks = await fetchAllTasks();

    // Map bookings and tasks to chat type
    const chats: InboxChat[] = [];

    bookings.map((b) => {
      chats.push({
        id: b.id,
        type: "booking",
        title: b.guest_name,
      });
    });

    tasks.map((t) => {
      chats.push({
        id: t.id,
        type: "task",
        title: t.task_description,
      });
    });

    return chats;
  }

  async function addChatMessage(
    chatMessage: Exclude<Tables<"chat">, { id: string }>
  ) {
    const { data, error } = await supabaseClient
      .from("chat")
      .insert(chatMessage)
      .select();

    await fetch(import.meta.env.VITE_WEBHOOK_URL_MESSAGE_SENT, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (error) {
      console.error(error);
    }
  }

  function setupSupabaseSubscription() {
    const chatSubscription = supabaseClient
      .channel("chat-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as Tables<"chat">;
            console.info("New chat message received:", newMessage);

            // Check if this message belongs to currently selected booking
            if (newMessage.booking_id && newMessage.booking_id === selectedBookingId) {
              setBookingChatToRender((prev) =>
                prev ? [...prev, newMessage] : [newMessage]
              );
            }
            
            // Check if this message belongs to currently selected task
            if (newMessage.task_id && newMessage.task_id === selectedTaskId) {
              setTaskChatToRender((prev) =>
                prev ? [...prev, newMessage] : [newMessage]
              );
            }
          }
        }
      )
      .subscribe();

    const bookingsSubscription = supabaseClient
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          // Refresh chats when bookings change
          fetchAllChats().then(setChats);
        }
      )
      .subscribe();

    const tasksSubscription = supabaseClient
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          // Refresh chats when tasks change
          fetchAllChats().then(setChats);
        }
      )
      .subscribe();

    return () => {
      chatSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
    };
  }

  async function clearAndSeedDatabase() {
    // Seed database with some bookings, and example tasks
    // Each booking should have a chat linked with "Thanks for your booking" with source agent
    // Step 1 empty the supabase database

    await supabaseClient
      .from("chat")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");
    await supabaseClient
      .from("bookings")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");
    await supabaseClient
      .from("tasks")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");
    await supabaseClient
      .from("partners")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");
    await supabaseClient
      .from("faq")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");
    await supabaseClient
      .from("properties")
      .delete()
      .neq("id", "2966978a-b14e-4f71-a05f-a3d63aaeaa88");

    // Step 2 seed the database with sample data

    // Insert properties first
    const { data: properties } = await supabaseClient
      .from("properties")
      .insert([
        {
          address: "Strandgata 15, 5004 Bergen, Norway",
          wifi_ssid: "Bergen_Apartment_Guest",
          wifi_password: "Welcome2024!",
          access_instructions:
            "Enter through the main entrance. Use keycode 1234 on the door. Your apartment is on the 2nd floor, door 2A. Key box code: 5678 (located next to the mailboxes).",
        },
        {
          address: "Fisketorget 8, 5014 Bergen, Norway",
          wifi_ssid: "Fisketorget_WiFi",
          wifi_password: "Harbor123",
          access_instructions:
            "Building entrance is on the harbor side. Ring bell #3 or use mobile app. Apartment key is in the electronic lock box - code will be sent 2 hours before check-in.",
        },
        {
          address: "Nygårdsgaten 45, 5015 Bergen, Norway",
          wifi_ssid: "Nygard_Guest",
          wifi_password: "Student2024",
          access_instructions:
            "University area entrance: Use student card or call +47 55 000 000. Take elevator to 4th floor. Blue door at the end of the corridor. Smart lock code: your check-in date (DDMM format).",
        },
      ])
      .select();

    if (!properties) return;

    // Insert partners
    const { data: partners } = await supabaseClient
      .from("partners")
      .insert([
        {
          name: "Bergen Clean Pro",
          email: "contact@bergenclean.no",
          phone: "+47 55 12 34 56",
          type: "cleaning",
        },
        {
          name: "Fjord Maintenance",
          email: "service@fjordmaint.no",
          phone: "+47 55 98 76 54",
          type: "maintenance",
        },
        {
          name: "Quality Inspections AS",
          email: "info@qualityinsp.no",
          phone: "+47 55 11 22 33",
          type: "inspection",
        },
      ])
      .select();

    if (!partners) return;

    // Insert sample bookings
    const { data: bookings } = await supabaseClient
      .from("bookings")
      .insert([
        {
          guest_name: "Emma Hansen",
          guest_email: "emma.hansen@gmail.com",
          property_id: properties[0].id,
          check_in_date_time: "2024-10-15T16:00:00Z",
          check_out_date_time: "2024-10-20T11:00:00Z",
        },
        {
          guest_name: "Lars Andersen",
          guest_email: "lars.andersen@outlook.com",
          property_id: properties[1].id,
          check_in_date_time: "2024-10-18T15:00:00Z",
          check_out_date_time: "2024-10-25T10:00:00Z",
        },
        {
          guest_name: "Sophie Schmidt",
          guest_email: "sophie.schmidt@gmail.com",
          property_id: properties[2].id,
          check_in_date_time: "2024-10-22T17:00:00Z",
          check_out_date_time: "2024-10-28T12:00:00Z",
        },
      ])
      .select();

    if (!bookings) return;

    // Insert sample tasks
    const { data: tasks } = await supabaseClient
      .from("tasks")
      .insert([
        {
          task_description: "Deep cleaning after guest checkout",
          property_id: properties[0].id,
          booking_id: bookings[0].id, // Link to Emma Hansen's booking
          partner_id: partners[0].id,
          type: "cleaning",
          status: "confirmed",
          due_date: "2024-10-21T12:00:00Z",
          can_start_after: "2024-10-20T11:00:00Z",
        },
        {
          task_description: "Fix leaking kitchen faucet",
          property_id: properties[1].id,
          booking_id: bookings[1].id, // Link to Lars Andersen's booking
          partner_id: partners[1].id,
          type: "maintenance",
          status: "in_progress",
          due_date: "2024-10-17T14:00:00Z",
        },
        {
          task_description: "Monthly property inspection",
          property_id: properties[2].id,
          booking_id: null, // General maintenance task not linked to specific booking
          partner_id: partners[2].id,
          type: "inspection",
          status: "pending",
          due_date: "2024-10-30T10:00:00Z",
        },
        {
          task_description: "Pre-arrival apartment preparation",
          property_id: properties[2].id,
          booking_id: bookings[2].id, // Link to Sophie Schmidt's booking
          partner_id: partners[0].id,
          type: "cleaning",
          status: "pending",
          due_date: "2024-10-22T15:00:00Z",
        },
      ])
      .select();

    if (!tasks) return;

    // Insert chat messages for bookings
    await supabaseClient.from("chat").insert([
      {
        booking_id: bookings[0].id,
        message:
          "Thanks for your booking! We're excited to host you in Bergen.",
        sender: "agent",
        source: "app",
      },
      {
        booking_id: bookings[0].id,
        message:
          "Thank you! I'm looking forward to my stay. What time is check-in exactly?",
        sender: "user",
        source: "app",
      },
      {
        booking_id: bookings[0].id,
        message:
          "Check-in is from 4:00 PM. We'll send you access instructions closer to your arrival date.",
        sender: "agent",
        source: "app",
      },
      {
        booking_id: bookings[1].id,
        message: "Welcome to Bergen! Your reservation is confirmed.",
        sender: "agent",
        source: "app",
      },
      {
        booking_id: bookings[2].id,
        message:
          "Thanks for choosing our property! Let us know if you have any questions.",
        sender: "agent",
        source: "app",
      },
    ]);

    // Insert chat messages for tasks
    await supabaseClient.from("chat").insert([
      {
        task_id: tasks[0].id,
        message:
          "Cleaning task has been assigned. We'll complete it by the due date.",
        sender: "partner",
        source: "app",
      },
      {
        task_id: tasks[1].id,
        message:
          "Received maintenance request for kitchen faucet. Will fix tomorrow morning.",
        sender: "partner",
        source: "app",
      },
      {
        task_id: tasks[1].id,
        message:
          "Perfect, thank you! The tenant mentioned it's been dripping for a few days.",
        sender: "agent",
        source: "app",
      },
      {
        task_id: tasks[2].id,
        message:
          "Monthly inspection scheduled. Will provide detailed report after completion.",
        sender: "partner",
        source: "app",
      },
    ]);

    // Insert sample FAQ entries
    await supabaseClient.from("faq").insert([
      {
        question: "What is the WiFi password?",
        answer:
          "The WiFi password varies by property. Check your welcome message or the information sheet in your apartment.",
        property_id: null, // General FAQ
      },
      {
        question: "What time is check-in and check-out?",
        answer:
          "Check-in is typically from 4:00 PM and check-out is by 11:00 AM. Specific times will be provided in your booking confirmation.",
        property_id: null,
      },
      {
        question: "Where can I find the nearest grocery store?",
        answer:
          "There's a Rema 1000 just 200 meters from the property on Strandgata. It's open daily from 8:00 AM to 11:00 PM.",
        property_id: properties[0].id,
      },
      {
        question: "Is parking available?",
        answer:
          "Street parking is available in the area. Please note that some spaces require payment during weekdays from 9:00 AM to 5:00 PM.",
        property_id: properties[1].id,
      },
      {
        question: "How do I contact emergency services?",
        answer:
          "For emergencies, dial 112. For non-urgent issues, contact our support team through the app or call +47 55 00 00 00.",
        property_id: null,
      },
      {
        question: "Can I have guests over?",
        answer:
          "Small gatherings are allowed, but please respect the neighbors and keep noise levels down, especially after 10:00 PM.",
        property_id: properties[2].id,
      },
    ]);

    console.log("Database seeded successfully!");
  }

  async function fetchChatMessages(bookingId?: string, taskId?: string) {
    let query = supabaseClient
      .from("chat")
      .select("*")
      .order("created_at", { ascending: true });

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    } else if (taskId) {
      query = query.eq("task_id", taskId);
    } else {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return [];
    }

    return data || [];
  }

  return {
    chats,
    addChatMessage,
    selectedBookingId,
    setSelectedBookingId,
    selectedTaskId,
    setSelectedTaskId,
    setSelectedChat,
    clearAndSeedDatabase,
    tasks,
    bookings,
    fetchChatMessages,
    bookingChatToRender,
    setBookingChatToRender,
    taskChatToRender,
    setTaskChatToRender,
  };
}

export type InboxChat = {
  id: string;
  type: "booking" | "task";
  title: string;
  bookingId?: string;
  taskId?: string;
};
