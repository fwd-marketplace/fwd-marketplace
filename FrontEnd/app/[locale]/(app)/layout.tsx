import { AppHeader } from "@/components/layout/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
