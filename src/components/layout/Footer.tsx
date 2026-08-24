import { Sparkles } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/", label: "About" },
      { href: "/", label: "Careers" },
      { href: "/", label: "Press" },
    ],
  },
  {
    title: "For Business",
    links: [
      { href: "/dashboard/salon-owner", label: "Salon Owners" },
      { href: "/dashboard/staff", label: "Staff Portal" },
      { href: "/register", label: "List Your Salon" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/", label: "Help Center" },
      { href: "/", label: "Contact Us" },
      { href: "/", label: "Cancellation Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-purple-500 text-white">
                <Sparkles className="size-4" />
              </span>
              <span className="font-display text-lg text-neutral-900">GlowSync</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-500">
              Book premium salon &amp; wellness experiences, effortlessly.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-neutral-900">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-rose-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-400 sm:flex-row">
          <span>© {new Date().getFullYear()} GlowSync. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-rose-600">
              Privacy
            </Link>
            <Link href="/" className="hover:text-rose-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
