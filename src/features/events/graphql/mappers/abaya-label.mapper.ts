import type { AbayaLabelBatch } from "../../types";
import type { EventAbayaLabelSetNode } from "../queries/event-abaya-label-set-find";

/** Maps `eventAbayaLabelSetFind` into the feature domain model. */
export function mapAbayaLabelSetFromApi(node: EventAbayaLabelSetNode): AbayaLabelBatch {
  return {
    id: node.id,
    eventId: node.eventId,
    prefix: node.prefix ?? "",
    suffix: node.suffix ?? "",
    from: node.from ?? 0,
    to: node.to ?? 0,
    generatedAt: node.updatedAt ?? node.createdAt ?? "",
    ...(node.updatedAt ? { updatedAt: node.updatedAt } : {}),
    ...(node.totalLabels != null ? { totalLabels: node.totalLabels } : {}),
    ...(node.assignedLabels != null ? { assignedLabels: node.assignedLabels } : {}),
    ...(node.availableLabels != null ? { availableLabels: node.availableLabels } : {}),
  };
}
