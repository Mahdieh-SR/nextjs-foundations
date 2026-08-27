export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mb-8 border-b py-4">
        <nav className="flex gap-4">
          <a className="font-semibold" href="/">
            Home
          </a>
          <a className="text-gray-600 hover:text-gray-900" href="/about">
            About
          </a>
          <a className="text-gray-600 hover:text-gray-900" href="/pricing">
            Pricing
          </a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-8 border-t py-4 text-gray-500 text-sm">
        © 2026 Next.js Foundations
      </footer>
    </div>
  );
}
