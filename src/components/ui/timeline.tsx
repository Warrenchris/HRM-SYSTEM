import { format } from "date-fns";

interface TimelineItem {
  date: Date;
  title: string;
  description: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const sortedItems = items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {sortedItems.map((item, index) => (
          <div key={index} className="relative flex gap-4">
            {/* Timeline dot */}
            <div className="relative">
              <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {format(item.date, "MMM dd, yyyy 'at' HH:mm")}
                </span>
              </div>
              <div className="text-sm">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}