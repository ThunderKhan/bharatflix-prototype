import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/account-service";
import { isDemoMode } from "@/lib/demo-auth";
import { UsersManager } from "@/components/account/users-manager";

export const runtime = "nodejs";
export default async function UserAdminPage() {
  const user = await currentAccount();
  if (!user) redirect("/account?next=/admin/users");
  if (user.role !== "superadmin") redirect("/admin");
  return <UsersManager selfId={user.id} demoMode={isDemoMode()} />;
}
