import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "w-full rounded-2xl px-5 py-3 font-semibold transition-all duration-200 active:scale-95";

  const variants = {
  primary:
    "bg-orange-500 text-white hover:bg-orange-400 hover:scale-105 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40",

  secondary:
    "bg-slate-700 text-white hover:bg-slate-600 hover:scale-105",
};

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}