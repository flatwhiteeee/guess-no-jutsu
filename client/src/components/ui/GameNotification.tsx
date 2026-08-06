import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  color?: "green" | "red" | "yellow" | "blue";
  onClose: () => void;
};

export default function GameNotification({
  open,
  title,
  message,
  color = "blue",
  onClose,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    buttonRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const colors = {
    green: {
      border: "border-green-500",
      title: "text-green-400",
      glow: "shadow-green-500/30",
      icon: "🎉",
    },
    red: {
      border: "border-red-500",
      title: "text-red-400",
      glow: "shadow-red-500/30",
      icon: "❌",
    },
    yellow: {
      border: "border-yellow-500",
      title: "text-yellow-400",
      glow: "shadow-yellow-500/30",
      icon: "⚠️",
    },
    blue: {
      border: "border-sky-500",
      title: "text-sky-400",
      glow: "shadow-sky-500/30",
      icon: "ℹ️",
    },
  };

  const theme = colors[color];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div
        className={`
          w-[420px]
          animate-[popup_.25s_ease-out]
          rounded-3xl
          border-2
          ${theme.border}
          bg-slate-900
          p-8
          text-center
          shadow-2xl
          ${theme.glow}
        `}
      >
        <div className="mb-4 text-5xl">{theme.icon}</div>

        <h2 className={`text-3xl font-extrabold ${theme.title}`}>{title}</h2>

        <p className="mt-4 text-lg leading-relaxed text-slate-200">{message}</p>

        <button
          ref={buttonRef}
          onClick={onClose}
          className="
            mt-8
            w-44
            rounded-xl
            bg-orange-500
            py-3
            text-lg
            font-bold
            text-white
            transition-all
            duration-200
            hover:scale-105
            hover:bg-orange-600
            active:scale-95
          "
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
