import { StaffForm } from "@/features/staff/components/forms/staff-form";

type EditStaffPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params;

  return <StaffForm mode="edit" staffId={id} />;
}
