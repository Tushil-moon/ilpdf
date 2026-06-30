import { Link } from "@/i18n/navigation";
import { PDF_TOOLS } from "@/lib/tools";

const footerLinks = {
  product: [
    { href: "/tools", label: "All Tools" },
    { href: "/pricing", label: "Pricing" },
    { href: "/api-docs", label: "API" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export function Footer() {
  const popularTools = PDF_TOOLS.slice(0, 6);

  return (
    <footer className="border-t border-border/40 bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
                <span className="text-sm font-bold text-white">IL</span>
              </div>
              <span className="text-xl font-bold">ILPDF</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Free online PDF tools for everyone. Merge, split, compress, convert,
              and edit PDF files with ease. Secure, fast, and no registration required.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Popular Tools</h4>
            <ul className="space-y-3">
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-3">
              {[...footerLinks.company, ...footerLinks.legal].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ILPDF. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://twitter.com/ilpdf"
              className="text-sm text-muted-foreground hover:text-foreground"
              rel="noopener noreferrer"
              target="_blank"
            >
              Twitter
            </a>
            <a
              href="https://github.com/ilpdf"
              className="text-sm text-muted-foreground hover:text-foreground"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
