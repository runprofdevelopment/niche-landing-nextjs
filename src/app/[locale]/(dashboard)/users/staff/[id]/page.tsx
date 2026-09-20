import { StaffDetailsView } from "@/features/staff/views/staff-details-view";

type StaffDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  const { id } = await params;

  return <StaffDetailsView staffId={id} />;
}
