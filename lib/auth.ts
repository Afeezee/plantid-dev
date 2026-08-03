import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Base44 granted admin access via a `role: "admin"` RLS condition on the
 * user record. Clerk has no built-in role concept, so we store the same
 * flag in the user's publicMetadata and check it server-side wherever the
 * old app checked `user.role === "admin"`.
 */
export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");
  return userId;
}

export async function isAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

export async function requireAdmin() {
  const userId = await requireUser();
  if (!(await isAdmin())) throw new Error("FORBIDDEN");
  return userId;
}
