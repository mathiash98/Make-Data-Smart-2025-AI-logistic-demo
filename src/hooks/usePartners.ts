import { useState, useEffect } from "react";
import getSupabaseClient from "./getSupabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "./supabase";

export default function usePartners(taskType?: string) {
  const supabaseClient = getSupabaseClient();

  const [partners, setPartners] = useState<Tables<"partners">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllPartners();
    const cleanup = setupSupabaseSubscription();

    return cleanup;
  }, [taskType]);

  async function fetchAllPartners() {
    setLoading(true);
    try {
      let query = supabaseClient
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (taskType) {
        query = query.eq("type", taskType);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        throw error;
      }

      setPartners(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function insertPartner(partner: TablesInsert<"partners">) {
    const { data, error } = await supabaseClient
      .from("partners")
      .insert(partner)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  }

  async function updatePartner(id: string, updates: TablesUpdate<"partners">) {
    const { data, error } = await supabaseClient
      .from("partners")
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

  async function deletePartner(id: string) {
    const { error } = await supabaseClient.from("partners").delete().eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  function setupSupabaseSubscription() {
    const partnerSubscription = supabaseClient
      .channel("partners-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partners" },
        (payload) => {
          const partnerData = payload.new as Tables<"partners">;

          // Only update if this partner matches our task type filter
          if (!taskType || partnerData.type === taskType) {
            if (payload.eventType === "INSERT") {
              setPartners((prev) => [partnerData, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setPartners((prev) =>
                prev.map((partner) => 
                  partner.id === partnerData.id ? partnerData : partner
                )
              );
            } else if (payload.eventType === "DELETE") {
              const deletedPartner = payload.old as Tables<"partners">;
              setPartners((prev) => prev.filter((partner) => partner.id !== deletedPartner.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      partnerSubscription.unsubscribe();
    };
  }

  return {
    partners,
    loading,
    fetchAllPartners,
    insertPartner,
    updatePartner,
    deletePartner,
  };
}