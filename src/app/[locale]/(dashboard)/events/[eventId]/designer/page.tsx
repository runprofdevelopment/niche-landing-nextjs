import { EventPageShell } from "@/features/events";
import { LegacyHallRedirect } from "@/features/events/components/shared/LegacyHallRedirect";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <EventPageShell>
      <LegacyHallRedirect params={params} kind="designer" />
    </EventPageShell>
  );
}
