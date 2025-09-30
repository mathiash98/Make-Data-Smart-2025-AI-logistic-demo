import type { Tables } from "@/hooks/supabase";
import useFAQ from "@/hooks/useFAQ";
import { useState } from "react";
import { Button } from "./ui/button";

/**
 * Component for rendering FAQ section.
 * Read, update, add, and delete FAQs.
 * And Connect FAQ entries to properties if needed.
 * @returns
 */
export default function Faq() {
  const { faqs, loading, insertFAQ, updateFAQ, deleteFAQ } = useFAQ();
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAddFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      await insertFAQ({
        question: newQuestion,
        answer: newAnswer,
      });
      setNewQuestion("");
      setNewAnswer("");
      setIsAddingFAQ(false);
    } catch (error) {
      console.error("Error adding FAQ:", error);
    }
  };

  const handleUpdateFAQ = async (
    id: string,
    question: string,
    answer: string
  ) => {
    try {
      await updateFAQ(id, { question, answer });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating FAQ:", error);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      await deleteFAQ(id);
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">FAQ Component</h1>
        <Button onClick={() => setIsAddingFAQ(true)}>Add FAQ</Button>
      </div>

      {loading && <p>Loading FAQs...</p>}

      {isAddingFAQ && (
        <div className="mb-4 p-4 border rounded">
          <h3 className="font-semibold mb-2">Add New FAQ</h3>
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddFAQ}>Save</Button>
            <Button variant="outline" onClick={() => setIsAddingFAQ(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isEditing={editingId === faq.id}
            onEdit={() => setEditingId(faq.id)}
            onSave={handleUpdateFAQ}
            onCancel={() => setEditingId(null)}
            onDelete={() => handleDeleteFAQ(faq.id)}
          />
        ))}
      </div>

      {faqs.length === 0 && !loading && (
        <p className="text-gray-500">
          No FAQs found. Add your first FAQ above!
        </p>
      )}
    </div>
  );
}

function FAQItem({
  faq,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  faq: Tables<"faq">;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (id: string, question: string, answer: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [editQuestion, setEditQuestion] = useState(faq.question);
  const [editAnswer, setEditAnswer] = useState(faq.answer);

  const handleSave = () => {
    onSave(faq.id, editQuestion, editAnswer);
  };

  if (isEditing) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <input
          type="text"
          value={editQuestion}
          onChange={(e) => setEditQuestion(e.target.value)}
          className="w-full p-2 border rounded mb-2 font-semibold"
        />
        <textarea
          value={editAnswer}
          onChange={(e) => setEditAnswer(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">{faq.question}</h3>
      <p className="text-gray-700 mb-2">{faq.answer}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
