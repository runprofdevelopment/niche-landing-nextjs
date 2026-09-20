import { RoleDetailsView } from "@/features/roles/views/role-details-view";

type RoleDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoleDetailsPage({ params }: RoleDetailsPageProps) {
  const { id } = await params;

  return <RoleDetailsView roleId={id} />;
}
