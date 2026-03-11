import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tables, TablesUpdate } from "@/hooks/supabase";
import { useState } from "react";
import ListColumn from "./ListColumn";

interface FAQColumnProps {
	faqs: Tables<"faq">[];
	onInsertFAQ: (
		question: string,
		answer: string,
		isProcess: boolean,
	) => Promise<void>;
	onUpdateFAQ: (
		id: string,
		updates: TablesUpdate<"faq">,
	) => Promise<Tables<"faq">>;
	onDeleteFAQ: (id: string) => Promise<void>;
}

export default function FAQColumn({
	faqs,
	onInsertFAQ,
	onUpdateFAQ,
	onDeleteFAQ,
}: FAQColumnProps) {
	const [mode, setMode] = useState<"faq" | "process">("faq");
	const [newQuestion, setNewQuestion] = useState("");
	const [newAnswer, setNewAnswer] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editQuestion, setEditQuestion] = useState("");
	const [editAnswer, setEditAnswer] = useState("");

	const isProcess = mode === "process";
	const filtered = faqs.filter((f) => !!f.is_process === isProcess);

	const startEditing = (item: Tables<"faq">) => {
		setEditingId(item.id);
		setEditQuestion(item.question);
		setEditAnswer(item.answer);
	};

	const cancelEditing = () => {
		setEditingId(null);
		setEditQuestion("");
		setEditAnswer("");
	};

	const handleSaveEdit = async () => {
		if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;
		try {
			await onUpdateFAQ(editingId, {
				question: editQuestion,
				answer: editAnswer,
			});
			cancelEditing();
		} catch (error) {
			console.error("Error updating item:", error);
		}
	};

	const handleAdd = async () => {
		if (!newQuestion.trim() || !newAnswer.trim()) return;
		try {
			await onInsertFAQ(newQuestion, newAnswer, isProcess);
			setNewQuestion("");
			setNewAnswer("");
		} catch (error) {
			console.error("Error adding item:", error);
		}
	};

	const toggle = (
		<div className="flex rounded-lg overflow-hidden border border-slate-200 bg-slate-100 p-0.5 gap-0.5">
			<button
				type="button"
				onClick={() => setMode("faq")}
				className={`flex-1 text-xs font-medium px-3 py-1 rounded-md transition-all duration-150 ${
					mode === "faq"
						? "bg-white text-slate-800 shadow-sm"
						: "text-slate-500 hover:text-slate-700"
				}`}
			>
				FAQ
			</button>
			<button
				type="button"
				onClick={() => setMode("process")}
				className={`flex-1 text-xs font-medium px-3 py-1 rounded-md transition-all duration-150 ${
					mode === "process"
						? "bg-white text-slate-800 shadow-sm"
						: "text-slate-500 hover:text-slate-700"
				}`}
			>
				Processes
			</button>
		</div>
	);

	const actions = (
		<div className="space-y-2">
			{toggle}
			<Input
				placeholder={isProcess ? "Process title" : "Question"}
				value={newQuestion}
				onChange={(e) => setNewQuestion(e.target.value)}
			/>
			<Textarea
				placeholder={isProcess ? "Process description" : "Answer"}
				value={newAnswer}
				onChange={(e) => setNewAnswer(e.target.value)}
				rows={2}
			/>
			<Button onClick={handleAdd} size="sm" className="w-full">
				Add {isProcess ? "Process" : "FAQ"}
			</Button>
		</div>
	);

	return (
		<ListColumn
			title={isProcess ? "Processes" : "FAQ Management"}
			count={filtered.length}
			actions={actions}
		>
			<div className="space-y-3">
				{filtered.map((item) => (
					<div
						key={item.id}
						className="border border-slate-200 rounded-lg p-3 bg-white/80 hover:shadow-sm transition-all duration-200"
					>
						{editingId === item.id ? (
							<div className="space-y-2">
								<Input
									value={editQuestion}
									onChange={(e) => setEditQuestion(e.target.value)}
									placeholder={isProcess ? "Process title" : "Question"}
								/>
								<Textarea
									value={editAnswer}
									onChange={(e) => setEditAnswer(e.target.value)}
									placeholder={isProcess ? "Process description" : "Answer"}
									rows={3}
								/>
								<div className="flex gap-2">
									<Button size="sm" onClick={handleSaveEdit}>
										Save
									</Button>
									<Button size="sm" variant="outline" onClick={cancelEditing}>
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<>
								<h4 className="font-medium text-sm mb-2 text-slate-800">
									{item.question}
								</h4>
								<p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">
									{item.answer}
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => startEditing(item)}
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDeleteFAQ(item.id)}
									>
										Delete
									</Button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		</ListColumn>
	);
}
