import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white shadow-sm ring-1 ring-calm-100 p-6 animate-fade-up ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" }) {
  const styles = {
    primary: "bg-calm-600 text-white hover:bg-calm-700 shadow-sm",
    soft: "bg-calm-50 text-calm-800 hover:bg-calm-100 ring-1 ring-calm-100",
    ghost: "bg-transparent text-calm-700 hover:bg-calm-50",
  }[variant];
  return (
    <button
      className={`rounded-full px-6 py-3 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Pill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
        active ? "bg-calm-600 text-white" : "bg-calm-50 text-calm-700 ring-1 ring-calm-100"
      }`}
    >
      {children}
    </span>
  );
}

export function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(1, max === 0 ? 0 : value / max);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#d6ebeb" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="#357f83"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="52" textAnchor="middle" className="fill-calm-800" fontSize="24" fontWeight="700">
          {value}
        </text>
        <text x="55" y="70" textAnchor="middle" className="fill-calm-500" fontSize="11">
          / {max} days
        </text>
      </svg>
      <span className="mt-1 text-sm text-calm-600">{label}</span>
    </div>
  );
}
