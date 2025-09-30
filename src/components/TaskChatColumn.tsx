import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ChatComponent from "./ChatComponent";
import ListColumn from "./ListColumn";
import type { Tables } from "@/hooks/supabase";

interface TaskChatColumnProps {
  selectedTask: Tables<"tasks"> | undefined;
  taskChatToRender: Tables<"chat">[] | null | undefined;
  onSendMessage: (message: string) => void;
  onDeselectTask?: () => void;
}

export default function TaskChatColumn({
  selectedTask,
  taskChatToRender,
  onSendMessage,
  onDeselectTask,
}: TaskChatColumnProps) {
  return (
    <ListColumn title="Task Communication" count={0}>
      <div className="h-full">
        {selectedTask ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <div className="text-sm font-medium text-slate-700">
                Chat for: {selectedTask.task_description}
              </div>
              {onDeselectTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeselectTask}
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <ChatComponent
                messages={taskChatToRender}
                role="partner"
                title={""}
                containerClass="h-full"
                onSendMessage={onSendMessage}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Select a task to view communication
          </div>
        )}
      </div>
    </ListColumn>
  );
}