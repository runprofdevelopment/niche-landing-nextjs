"use client";

import { useEffect, useMemo, useState } from "react";

import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";

import { resolveTimelineStatus, sortTimelineSlots } from "../domain/timeline";
import {
  useEventTimelineListQuery,
  useEventTimelineMutations,
} from "../graphql/hooks/use-event-timeline";

import type { TimelineSlotFormValues } from "../schemas/event-forms.schema";
import type { TimelineSlot } from "../types";

export type TimelineSlotsMessages = {
  entryAdded: string;
  entryUpdated: string;
  entryDeleted: string;
};

const STATUS_TICK_MS = 30_000;

export function useTimelineSlots(
  eventId: string,
  messages: TimelineSlotsMessages,
  options: { eventDate?: string } = {},
) {
  const { eventDate } = options;
  const { handleError } = useErrorHandler();
  const { slots: remoteSlots, loading } = useEventTimelineListQuery(eventId, {
    ...(eventDate ? { eventDate } : {}),
  });
  const {
    createTimelineSlot,
    updateTimelineSlot,
    destroyTimelineSlot,
    creating,
    updating,
    destroying,
  } = useEventTimelineMutations(eventId);

  /** Recompute derived status as wall-clock time advances. */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), STATUS_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const slots = useMemo(
    () =>
      sortTimelineSlots(
        remoteSlots.map((slot) => ({
          ...slot,
          status: resolveTimelineStatus(slot.start, slot.end, {
            ...(eventDate ? { eventDate } : {}),
            now,
          }),
        })),
      ),
    [remoteSlots, eventDate, now],
  );

  /** `null` = closed, `undefined` slot = add mode. */
  const [editing, setEditing] = useState<TimelineSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TimelineSlot | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (slot: TimelineSlot) => {
    setEditing(slot);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: TimelineSlotFormValues) => {
    try {
      if (editing) {
        await updateTimelineSlot(editing.id, values);
        toast.success(messages.entryUpdated);
      } else {
        await createTimelineSlot(values);
        toast.success(messages.entryAdded);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      handleError(error, {
        context: {
          feature: "events",
          action: editing ? "EventTimelineUpdate" : "EventTimelineCreate",
          extra: { eventId, ...(editing ? { timelineId: editing.id } : {}) },
        },
        channels: ["toast"],
      });
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await destroyTimelineSlot(pendingDelete.id);
      toast.success(messages.entryDeleted);
      setPendingDelete(null);
    } catch (error) {
      handleError(error, {
        context: {
          feature: "events",
          action: "EventTimelineDestroy",
          extra: { eventId, timelineId: pendingDelete.id },
        },
        channels: ["toast"],
      });
      throw error;
    }
  };

  return {
    slots,
    loading,
    saving: creating || updating || destroying,
    editing,
    dialogOpen,
    setDialogOpen,
    openAdd,
    openEdit,
    handleSubmit,
    pendingDelete,
    setPendingDelete,
    confirmDelete,
  };
}
