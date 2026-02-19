import { StaffSidebar } from "@/components/staff-sidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <StaffSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
