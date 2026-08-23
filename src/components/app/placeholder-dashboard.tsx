import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

type PlaceholderDashboardProps = {
    role: string;
}

export function PlaceholderDashboard({ role }: PlaceholderDashboardProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm m-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Wrench className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          {role} Dashboard Coming Soon!
        </h3>
        <p className="text-muted-foreground">
          We're working hard to build this section. Check back later for updates.
        </p>
      </div>
    </div>
  );
}
