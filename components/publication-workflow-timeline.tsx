"use client";

import { Badge } from "@/components/ui/badge";
import {
  PUBLICATION_WORKFLOW_ACTION_LABELS,
  PUBLICATION_WORKFLOW_STATUS_LABELS,
  ROLE_LABELS,
  type PublicationWorkflowEvent,
} from "@/lib/types";

interface PublicationWorkflowTimelineProps {
  events: PublicationWorkflowEvent[];
  emptyMessage?: string;
}

function getActionLabel(action: string) {
  if (action in PUBLICATION_WORKFLOW_ACTION_LABELS) {
    return PUBLICATION_WORKFLOW_ACTION_LABELS[
      action as keyof typeof PUBLICATION_WORKFLOW_ACTION_LABELS
    ];
  }

  if (action === "created") {
    return "Creacion inicial";
  }

  return action;
}

function getRoleLabel(role: PublicationWorkflowEvent["role"]) {
  return ROLE_LABELS[role] ?? role;
}

export function PublicationWorkflowTimeline({
  events,
  emptyMessage = "Todavia no hay eventos registrados para esta publicacion.",
}: PublicationWorkflowTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-border/70 bg-background/90 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{getActionLabel(event.action)}</Badge>
            <Badge variant="outline">
              {
                PUBLICATION_WORKFLOW_STATUS_LABELS[
                  event.next_status as keyof typeof PUBLICATION_WORKFLOW_STATUS_LABELS
                ]
              }
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(event.created_at).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {getRoleLabel(event.role)}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {event.comments || "Sin observaciones registradas."}
          </p>
        </div>
      ))}
    </div>
  );
}
