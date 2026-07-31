"use client";

import { useTransition } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearThemeAction, setThemeAction } from "@/lib/theme/actions";

type Choice = "light" | "dark" | "system";

/**
 * Three-state theme picker: light | dark | system. Server persists the cookie
 * (or clears it for system); we also mirror the resolved theme onto <html>
 * synchronously so the *current* tab flips without a reload.
 */
export function ThemeToggle({ current }: { current: Choice }) {
  const [pending, startTransition] = useTransition();

  const pick = (next: Choice) => {
    // Mirror onto <html> synchronously so this tab flips instantly.
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Change theme"
          disabled={pending}
        >
          {current === "dark" ? (
            <Moon className="size-4" />
          ) : current === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Monitor className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Row label="Light" icon={Sun} active={current === "light"} onSelect={() => pick("light")} />
        <Row label="Dark" icon={Moon} active={current === "dark"} onSelect={() => pick("dark")} />
        <Row label="System" icon={Monitor} active={current === "system"} onSelect={() => pick("system")} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Row({
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
