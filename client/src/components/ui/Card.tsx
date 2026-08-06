import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        bg-slate-900/70
        backdrop-blur-xl
        border
        border-slate-700
        p-6
        shadow-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}