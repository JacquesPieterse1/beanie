import { CustomerHeader } from "@/components/customer-header";
import { CartProvider } from "@/lib/cart-context";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </CartProvider>
  );
}
