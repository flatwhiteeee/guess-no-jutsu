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
      "bg-[#6B5140] text-[#E7C28A] hover:bg-[#8A684F] hover:scale-105 shadow-lg shadow-[#6B5140]/25 hover:shadow-[#8A684F]/35",

    secondary: "bg-[#344252] text-[#E7E2D8] hover:bg-[#45535D] hover:scale-105",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
