import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  title?: string;
}

export function LogoMark({ className, title = "Ubeda Cash Control" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("h-6 w-6", className)}
    >
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
      <path
        d="M10 8 V17.5 C10 20.8 12.7 23.5 16 23.5 C19.3 23.5 22 20.8 22 17.5 V13"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18.2 12.2 L22 8.4 L25.8 12.2"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoLockup({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-8 w-8" />
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight">
          Ubeda Cash Control
        </span>
      </span>
    </span>
  );
}
