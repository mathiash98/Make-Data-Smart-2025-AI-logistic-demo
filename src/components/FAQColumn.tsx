import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ListColumn from "./ListColumn";
import type { Tables } from "@/hooks/supabase";

interface FAQColumnProps {
  faqs: Tables<"faq">[];
  onInsertFAQ: (question: string, answer: string) => Promise<void>;
  onDeleteFAQ: (id: string) => Promise<void>;
}

export default function FAQColumn({ faqs, onInsertFAQ, onDeleteFAQ }: FAQColumnProps) {
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  const handleAddFAQ = async () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    try {
      await onInsertFAQ(newFaqQuestion, newFaqAnswer);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const actions = (
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
  );

  return (
    <ListColumn title="FAQ Management" count={faqs.length} actions={actions}>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="border border-slate-200 rounded-lg p-3 bg-white/80 hover:shadow-sm transition-all duration-200">
            <h4 className="font-medium text-sm mb-2 text-slate-800">{faq.question}</h4>
            <p className="text-sm text-slate-600 mb-2">{faq.answer}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteFAQ(faq.id)}
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