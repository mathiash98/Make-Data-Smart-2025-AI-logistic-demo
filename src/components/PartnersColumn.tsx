import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListColumn from "./ListColumn";
import type { Tables, Enums } from "@/hooks/supabase";

interface PartnersColumnProps {
  partners: Tables<"partners">[];
  onInsertPartner: (partner: {
    name: string;
    email: string;
    phone: string | null;
    type: Enums<"task_type">;
  }) => Promise<void>;
  onDeletePartner: (id: string) => Promise<void>;
}

export default function PartnersColumn({
  partners,
  onInsertPartner,
  onDeletePartner,
}: PartnersColumnProps) {
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newPartnerType, setNewPartnerType] = useState<Enums<"task_type">>("cleaning");

  const handleAddPartner = async () => {
    if (!newPartnerName.trim() || !newPartnerEmail.trim()) return;

    try {
      await onInsertPartner({
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

  const actions = (
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
        onValueChange={(value) => setNewPartnerType(value as Enums<"task_type">)}
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
  );

  return (
    <ListColumn title="Partners" count={partners.length} actions={actions}>
      <div className="space-y-3">
        {partners.map((partner) => (
          <div key={partner.id} className="border border-slate-200 rounded-lg p-3 bg-white/80 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-slate-800">{partner.name}</h4>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{partner.type}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-1">{partner.email}</p>
            {partner.phone && (
              <p className="text-sm text-slate-600 mb-2">{partner.phone}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeletePartner(partner.id)}
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