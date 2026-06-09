export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-secondary">
      {children}
    </div>
  );
}
