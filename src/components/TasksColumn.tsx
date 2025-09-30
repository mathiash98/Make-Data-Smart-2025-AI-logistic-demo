import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListColumn from "./ListColumn";
import type { Tables, Enums } from "@/hooks/supabase";

interface TasksColumnProps {
  tasks: Tables<"tasks">[] | undefined;
  selectedTaskId: string | null | undefined;
  setSelectedTaskId: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: Enums<"task_status">) => void;
}

export default function TasksColumn({
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  onStatusChange,
}: TasksColumnProps) {
  const selectedTask = tasks?.find((t) => t.id === selectedTaskId);

  const getStatusBadgeVariant = (status?: Enums<"task_status">) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "outline";
      case "in_progress":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <ListColumn title="Tasks" count={tasks?.length || 0}>
      <div className="space-y-2 mb-4">
        {tasks?.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTaskId(task.id)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedTaskId(task.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedTaskId === task.id
                ? "bg-emerald-100 border-emerald-300 shadow-md"
                : "hover:bg-slate-50 border-slate-200 hover:shadow-sm"
            }`}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{task.type}</Badge>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {task.status?.replace("_", " ")}
              </Badge>
              {task.due_date && (
                <span className="text-xs text-slate-500">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
            <h4 className="font-medium text-sm text-slate-800">{task.task_description}</h4>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="border-t border-slate-200 pt-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Task Details</div>
            <div className="bg-slate-50/80 p-3 rounded-lg text-sm space-y-2 border border-slate-200">
              <div className="text-slate-700">
                <span className="font-medium text-slate-800">Type:</span> {selectedTask.type}
              </div>
              <div className="space-y-2">
                <span className="font-medium text-slate-800">Status:</span>
                <Select
                  value={selectedTask.status}
                  onValueChange={(value) =>
                    onStatusChange(selectedTask.id, value as Enums<"task_status">)
                  }
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-slate-700">
                <span className="font-medium text-slate-800">Description:</span> {selectedTask.task_description}
              </div>
              {selectedTask.due_date && (
                <div className="text-slate-700">
                  <span className="font-medium text-slate-800">Due:</span>{" "}
                  {new Date(selectedTask.due_date).toLocaleString()}
                </div>
              )}
              {selectedTask.can_start_after && (
                <div className="text-slate-700">
                  <span className="font-medium text-slate-800">Start After:</span>{" "}
                  {new Date(selectedTask.can_start_after).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ListColumn>
  );
}