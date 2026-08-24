import { AtSign, Camera, Send } from "lucide-react";
import Image from "next/image";
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

const socials = [
  { icon: Camera, label: "Instagram" },
  { icon: AtSign, label: "Threads" },
  { icon: Send, label: "Newsletter" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-neutral-100 bg-ink text-neutral-300">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-rose-600/25 via-purple-600/20 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {/* Oversized wordmark doubles as the footer's visual anchor. */}
        <p className="font-display font-display-tight pointer-events-none select-none text-[clamp(3.5rem,14vw,11rem)] leading-none text-white/5">
          GlowSync
        </p>

        <div className="mt-4 grid grid-cols-2 gap-10 border-t border-white/10 pt-12 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo1.png"
                alt="GlowSync"
                width={36}
                height={36}
                className="size-9 rounded-xl"
              />
              <span className="font-display text-xl text-white">GlowSync</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Book premium salon &amp; wellness experiences, effortlessly.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all duration-300 hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <s.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow text-rose-300">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-rose-400 transition-all duration-300 group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row">
          <span>© {new Date().getFullYear()} GlowSync. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-rose-300">
              Privacy
            </Link>
            <Link href="/" className="transition-colors hover:text-rose-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
