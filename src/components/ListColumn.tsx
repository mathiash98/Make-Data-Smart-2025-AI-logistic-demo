import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ListColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  actions?: ReactNode;
}

export default function ListColumn({ title, count, children, actions }: ListColumnProps) {
  return (
    <Card className="h-full max-h-full flex flex-col bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          {title}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 bg-white/50 min-h-0 overflow-hidden p-6">
        {actions && (
          <div className="flex-shrink-0">
            {actions}
            <Separator />
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}