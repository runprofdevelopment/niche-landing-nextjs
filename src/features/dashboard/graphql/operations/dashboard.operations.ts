import { apolloClient } from "@/lib/apollo/client";
import { DashboardOverviewDocument } from "@/lib/graphql/generated/graphql";

export type DashboardOverview = {
  totalGuests: number;
  eventsThisWeek: number;
  upcomingEvents: Array<{
    id: string;
    name: string;
    date?: string;
    guestCount: number;
  }>;
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await apolloClient.query({
    query: DashboardOverviewDocument,
    fetchPolicy: "network-only",
  });

  const overview = data?.dashboardOverview;

  if (!overview) {
    return { totalGuests: 0, eventsThisWeek: 0, upcomingEvents: [] };
  }

  return {
    totalGuests: overview.totalGuests,
    eventsThisWeek: overview.eventsThisWeek,
    upcomingEvents: overview.upcomingEvents.map((event) => ({
      id: event.id,
      name: event.name,
      guestCount: event.guestCount,
      ...(event.date ? { date: event.date } : {}),
    })),
  };
}
