import { RoleForm } from "@/features/roles/components/forms/role-form";

type EditRolePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;
  return <RoleForm mode="edit" roleId={id} />;
}
