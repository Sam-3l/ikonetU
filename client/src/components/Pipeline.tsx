import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PipelineItem {
  id: string;
  name: string;
  avatar?: string;
  sector: string;
  lastActivity: string;
}

interface PipelineProps {
  newInterests: PipelineItem[];
  inConversation: PipelineItem[];
  closed: PipelineItem[];
  onSelectItem?: (id: string, stage: string) => void;
}

function PipelineColumn({
  title,
  items,
  stage,
  accentColor,
  onSelect,
}: {
  title: string;
  items: PipelineItem[];
  stage: string;
  accentColor: string;
  onSelect?: (id: string, stage: string) => void;
}) {
  return (
    <Card className="flex-1 min-w-[280px] overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${accentColor}`} />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-2">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect?.(item.id, stage)}
                  className="w-full p-3 rounded-lg bg-background border border-border text-left hover-elevate active-elevate-2"
                  data-testid={`pipeline-item-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {item.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.sector}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.lastActivity}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function Pipeline({
  newInterests,
  inConversation,
  closed,
  onSelectItem,
}: PipelineProps) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      data-testid="pipeline"
    >
      <PipelineColumn
        title="New Interests"
        items={newInterests}
        stage="new"
        accentColor="bg-primary"
        onSelect={onSelectItem}
      />
      <PipelineColumn
        title="In Conversation"
        items={inConversation}
        stage="active"
        accentColor="bg-chart-2"
        onSelect={onSelectItem}
      />
      <PipelineColumn
        title="Closed"
        items={closed}
        stage="closed"
        accentColor="bg-muted-foreground"
        onSelect={onSelectItem}
      />
    </div>
  );
}
