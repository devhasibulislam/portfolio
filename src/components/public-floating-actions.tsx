"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  Check,
  MessageCircleMore,
  Monitor,
  Moon,
  Sun,
  SunMoon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { clearThemeAction, setThemeAction } from "@/lib/theme/actions";

type ThemeChoice = "light" | "dark" | "system";

// Contact endpoints — hard-coded per PROJECT_CONTEXT §2 (single-owner site).
const PHONE = "8801906315901"; // wa.me format = no `+`
const USERNAME = "devhasibulislam";
const EMAIL = "devhasibulislam@gmail.com";
const WHATSAPP_URL = `https://wa.me/${PHONE}`;
const TELEGRAM_URL = `https://t.me/${USERNAME}`;
const EMAIL_URL = `mailto:${EMAIL}`;

/**
 * Bottom-end floating column for public routes: back-to-top (blog only) +
 * contact menu + theme picker. Also hides the native scrollbar on the
 * `<html>` element for the duration of every public route.
 * Hidden on `/dashboard*` and `/login`.
 */
export function PublicFloatingActions() {
  const pathname = usePathname();
  const isPublic = pathname !== "/login" && !pathname.startsWith("/dashboard");
  const isBlog = isPublic && pathname.startsWith("/blog");

  // Toggle the scrollbar-hiding class on <html> for the lifetime of every
  // public route. Cleanup restores the native scrollbar on dashboard/login.
  useEffect(() => {
    if (!isPublic) return;
    document.documentElement.classList.add("no-scrollbar");
    return () => document.documentElement.classList.remove("no-scrollbar");
  }, [isPublic]);

  if (!isPublic) return null;

  return (
    <div className="fixed bottom-4 end-4 z-40 flex flex-col gap-2">
      {isBlog ? <BackToTop /> : null}
      <ContactMenu />
      <ThemeMenu />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`size-11 rounded-full shadow-lg backdrop-blur transition-opacity ${
              visible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ArrowUp className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          Back to top
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------------------------------------------------- */

function ThemeMenu() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [pending, startTransition] = useTransition();

  // Initialise from the cookie + resolved <html data-theme> set by the
  // pre-hydration script in the root layout. One setState call keeps
  // `react-hooks/set-state-in-effect` happy.
  useEffect(() => {
    const hasCookie = /(?:^|; )theme=/.test(document.cookie);
    const t = document.documentElement.dataset.theme;
    const next: ThemeChoice = !hasCookie
      ? "system"
      : t === "light" || t === "dark"
        ? t
        : "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounting-only read of DOM/cookie
    setChoice(next);
  }, []);

  const pick = (next: ThemeChoice) => {
    setChoice(next);
    if (next === "system") {
      const wantsLight = window.matchMedia(
        "(prefers-color-scheme: light)",
      ).matches;
      document.documentElement.dataset.theme = wantsLight ? "light" : "dark";
    } else {
      document.documentElement.dataset.theme = next;
    }
    startTransition(async () => {
      if (next === "system") await clearThemeAction();
      else await setThemeAction(next);
    });
  };

  const Icon = choice === "light" ? Sun : choice === "dark" ? Moon : SunMoon;

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Change theme"
                disabled={pending}
                className="size-11 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-md ring-1 ring-[var(--color-accent)]/25 backdrop-blur hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)]"
              >
                <Icon className="size-4" />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Change theme
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" side="top" sideOffset={8}>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeRow
          label="Light"
          icon={Sun}
          active={choice === "light"}
          onSelect={() => pick("light")}
        />
        <ThemeRow
          label="Dark"
          icon={Moon}
          active={choice === "dark"}
          onSelect={() => pick("dark")}
        />
        <ThemeRow
          label="System"
          icon={Monitor}
          active={choice === "system"}
          onSelect={() => pick("system")}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeRow({
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onClick={onSelect}>
      <Icon className="me-2 size-4" />
      <span className="flex-1">{label}</span>
      {active ? <Check className="size-4 opacity-70" /> : null}
    </DropdownMenuItem>
  );
}

/* -------------------------------------------------------------------------- */

function ContactMenu() {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                aria-label="Contact with Hasib"
                className="size-11 rounded-full shadow-lg"
              >
                <MessageCircleMore className="size-4" />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Contact with Hasib
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-64"
      >
        <DropdownMenuLabel>Get in touch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ContactRow
          href={WHATSAPP_URL}
          src="/social/whatsapp.webp"
          label="WhatsApp"
          subtitle={`+${PHONE.replace(/^88/, "88 ")}`}
        />
        <ContactRow
          href={TELEGRAM_URL}
          src="/social/telegram.webp"
          label="Telegram"
          subtitle={`@${USERNAME}`}
        />
        <ContactRow
          href={EMAIL_URL}
          src="/social/gmail.webp"
          label="Email"
          subtitle={EMAIL}
          external={false}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContactRow({
  href,
  src,
  label,
  subtitle,
  external = true,
}: {
  href: string;
  src: string;
  label: string;
  subtitle: string;
  external?: boolean;
}) {
  return (
    <DropdownMenuItem asChild className="py-2">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="flex items-center gap-3"
      >
        <span className="border-border bg-background flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-5 rounded-sm" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{label}</span>
          <span className="text-muted-foreground truncate text-xs">
            {subtitle}
          </span>
        </span>
      </a>
    </DropdownMenuItem>
  );
}
