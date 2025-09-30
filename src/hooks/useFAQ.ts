import { useState, useEffect } from "react";
import getSupabaseClient from "./getSupabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "./supabase";

export default function useFAQ(propertyId?: string) {
  const supabaseClient = getSupabaseClient();

  const [faqs, setFaqs] = useState<Tables<"faq">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllFAQs();
    const cleanup = setupSupabaseSubscription();

    return cleanup;
  }, [propertyId]);

  async function fetchAllFAQs() {
    setLoading(true);
    try {
      let query = supabaseClient
        .from("faq")
        .select("*")
        .order("created_at", { ascending: false });

      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        throw error;
      }

      setFaqs(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function insertFAQ(faq: TablesInsert<"faq">) {
    const { data, error } = await supabaseClient
      .from("faq")
      .insert(faq)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  }

  async function updateFAQ(id: string, updates: TablesUpdate<"faq">) {
    const { data, error } = await supabaseClient
      .from("faq")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  }

  async function deleteFAQ(id: string) {
    const { error } = await supabaseClient.from("faq").delete().eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  function setupSupabaseSubscription() {
    const faqSubscription = supabaseClient
      .channel("faq-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "faq" },
        (payload) => {
          const faqData = payload.new as Tables<"faq">;

          // Only update if this FAQ matches our property filter
          if (!propertyId || faqData.property_id === propertyId) {
            if (payload.eventType === "INSERT") {
              setFaqs((prev) => [faqData, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setFaqs((prev) =>
                prev.map((faq) => (faq.id === faqData.id ? faqData : faq))
              );
            } else if (payload.eventType === "DELETE") {
              const deletedFaq = payload.old as Tables<"faq">;
              setFaqs((prev) => prev.filter((faq) => faq.id !== deletedFaq.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      faqSubscription.unsubscribe();
    };
  }

  return {
    faqs,
    loading,
    fetchAllFAQs,
    insertFAQ,
    updateFAQ,
    deleteFAQ,
  };
}
