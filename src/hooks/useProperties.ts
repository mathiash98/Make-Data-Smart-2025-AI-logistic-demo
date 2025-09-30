import { useState, useEffect } from "react";
import getSupabaseClient from "./getSupabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "./supabase";

export default function useProperties() {
  const supabaseClient = getSupabaseClient();

  const [properties, setProperties] = useState<Tables<"properties">[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllProperties();
    const cleanup = setupSupabaseSubscription();

    return cleanup;
  }, []);

  async function fetchAllProperties() {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        throw error;
      }

      setProperties(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function insertProperty(property: TablesInsert<"properties">) {
    const { data, error } = await supabaseClient
      .from("properties")
      .insert(property)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  }

  async function updateProperty(id: string, updates: TablesUpdate<"properties">) {
    const { data, error } = await supabaseClient
      .from("properties")
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

  async function deleteProperty(id: string) {
    const { error } = await supabaseClient.from("properties").delete().eq("id", id);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  function setupSupabaseSubscription() {
    const propertySubscription = supabaseClient
      .channel("properties-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        (payload) => {
          const propertyData = payload.new as Tables<"properties">;

          if (payload.eventType === "INSERT") {
            setProperties((prev) => [propertyData, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProperties((prev) =>
              prev.map((property) =>
                property.id === propertyData.id ? propertyData : property
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedProperty = payload.old as Tables<"properties">;
            setProperties((prev) => prev.filter((property) => property.id !== deletedProperty.id));
          }
        }
      )
      .subscribe();

    return () => {
      propertySubscription.unsubscribe();
    };
  }

  return {
    properties,
    loading,
    fetchAllProperties,
    insertProperty,
    updateProperty,
    deleteProperty,
  };
}