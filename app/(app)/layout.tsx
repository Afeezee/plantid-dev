import { DesktopSidebar } from "@/components/DesktopSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { isAdmin } from "@/lib/auth";

// Auth itself is enforced in middleware.ts; this layout only decides what
// chrome to render, matching the old Layout.jsx's DesktopSidebar +
// BottomTabBar shell with overscroll containment for a native-app feel.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  return (
    <div className="flex min-h-screen" style={{ overscrollBehavior: "none" }}>
      <DesktopSidebar isAdmin={admin} />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}
