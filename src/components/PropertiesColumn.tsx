import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ListColumn from "./ListColumn";
import type { Tables } from "@/hooks/supabase";

interface PropertiesColumnProps {
  properties: Tables<"properties">[];
  onInsertProperty: (property: {
    address: string;
    wifi_ssid?: string;
    wifi_password?: string;
    access_instructions?: string;
  }) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
}

export default function PropertiesColumn({
  properties,
  onInsertProperty,
  onDeleteProperty,
}: PropertiesColumnProps) {
  const [newPropertyAddress, setNewPropertyAddress] = useState("");
  const [newPropertyWifiSSID, setNewPropertyWifiSSID] = useState("");
  const [newPropertyWifiPassword, setNewPropertyWifiPassword] = useState("");
  const [newPropertyInstructions, setNewPropertyInstructions] = useState("");

  const handleAddProperty = async () => {
    if (!newPropertyAddress.trim()) return;

    try {
      await onInsertProperty({
        address: newPropertyAddress,
        wifi_ssid: newPropertyWifiSSID || undefined,
        wifi_password: newPropertyWifiPassword || undefined,
        access_instructions: newPropertyInstructions || undefined,
      });
      setNewPropertyAddress("");
      setNewPropertyWifiSSID("");
      setNewPropertyWifiPassword("");
      setNewPropertyInstructions("");
    } catch (error) {
      console.error("Error adding property:", error);
    }
  };

  const actions = (
    <div className="space-y-2">
      <Input
        placeholder="Property Address"
        value={newPropertyAddress}
        onChange={(e) => setNewPropertyAddress(e.target.value)}
      />
      <Input
        placeholder="WiFi SSID (optional)"
        value={newPropertyWifiSSID}
        onChange={(e) => setNewPropertyWifiSSID(e.target.value)}
      />
      <Input
        placeholder="WiFi Password (optional)"
        value={newPropertyWifiPassword}
        onChange={(e) => setNewPropertyWifiPassword(e.target.value)}
      />
      <Textarea
        placeholder="Access Instructions (optional)"
        value={newPropertyInstructions}
        onChange={(e) => setNewPropertyInstructions(e.target.value)}
        rows={2}
      />
      <Button onClick={handleAddProperty} className="w-full">
        Add Property
      </Button>
    </div>
  );

  return (
    <ListColumn title="Properties" count={properties.length} actions={actions}>
      <div className="space-y-3">
        {properties.map((property) => (
          <div key={property.id} className="border border-slate-200 rounded-lg p-3 bg-white/80 hover:shadow-sm transition-all duration-200">
            <h4 className="font-medium text-sm mb-2 text-slate-800">{property.address}</h4>
            {property.wifi_ssid && (
              <div className="text-sm text-slate-600 mb-1">
                <span className="font-medium text-slate-800">WiFi:</span> {property.wifi_ssid}
                {property.wifi_password && ` / ${property.wifi_password}`}
              </div>
            )}
            {property.access_instructions && (
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium text-slate-800">Access:</span> {property.access_instructions}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteProperty(property.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ListColumn>
  );
}