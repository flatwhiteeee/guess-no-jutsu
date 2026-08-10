import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import GameNotification from "../components/ui/GameNotification";

import desktopBackground from "../assets/landing-forest-desktop.png";
import mobileBackground from "../assets/landing-forest-mobile.png";
import titleArtwork from "../assets/landing-title.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    color: "yellow" as "green" | "red" | "yellow" | "blue",
  });

  function showNotification(
    title: string,
    message: string,
    color: "green" | "red" | "yellow" | "blue",
  ) {
    setNotification({
      open: true,
      title,
      message,
      color,
    });
  }

  const saveName = () => {
    const name = playerName.trim();

    if (!name) {
      showNotification(
        "NAMA BELUM DIISI",
        "Silakan masukkan nama terlebih dahulu.",
        "yellow",
      );

      return false;
    }

    localStorage.setItem("playerName", name);

    return true;
  };

  return (
    <>
      <GameNotification
        open={notification.open}
        title={notification.title}
        message={notification.message}
        color={notification.color}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet={mobileBackground} />

          <img
            src={desktopBackground}
            alt=""
            className="h-full w-full object-cover"
          />
        </picture>

        <div className="absolute inset-0 z-10 bg-slate-950/40" />

        <div className="relative z-20 flex min-h-screen items-center justify-center px-6">
          <div className="flex w-full max-w-md flex-col items-center md:max-w-xl">
            <div className="relative w-full">
              <img
                src={titleArtwork}
                alt="Guess No Jutsu"
                className="w-full max-w-[600px] md:max-w-[760px]"
              />

              <p className="text-center text-[12px] md:text-lg font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/70">
                <span className="inline-flex items-center gap-3 md:gap-6">
                  <span className="h-px w-13 md:w-20 bg-[#d4c7a6]/50" />
                  <span>The Shinobi Is Hidden</span>
                  <span className="h-px w-13 md:w-20 bg-[#d4c7a6]/50" />
                </span>
              </p>
            </div>

            <div className="mt-5 w-full max-w-sm space-y-3 md:max-w-sm">
              <div className="space-y-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 border border-[#d4c7a6]/30" />

                  <div className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l border-t border-[#d4c7a6]/80" />
                  <div className="pointer-events-none absolute -right-px -top-px h-2 w-2 border-r border-t border-[#d4c7a6]/80" />
                  <div className="pointer-events-none absolute -bottom-px -left-px h-2 w-2 border-b border-l border-[#d4c7a6]/80" />
                  <div className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r border-[#d4c7a6]/80" />

                  <input
                    id="player-name"
                    type="text"
                    placeholder="Your Shinobi Name . ."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="h-12 w-full bg-slate-950/60 px-4 text-center text-sm text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/35 focus:shadow-[0_0_18px_rgba(212,199,166,0.12)]"
                  />
                </div>
              </div>

              <Button
                className="!rounded-md !border !border-[#E6D9B8]/70 !bg-[#D4C7A6] !py-3.5 !text-[#172014] uppercase tracking-[0.12em] !shadow-[0_0_12px_rgba(212,199,166,0.10)] transition-all duration-200 hover:!bg-[#E0D4B5] hover:!shadow-[0_0_18px_rgba(212,199,166,0.18)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
                onClick={() => {
                  if (!saveName()) return;

                  navigate("/create");
                }}
              >
                Create Room
              </Button>

              <Button
                variant="secondary"
                className="!border-0 !bg-transparent !py-2 !text-white/65 uppercase tracking-[0.18em] !shadow-none transition-all duration-200 hover:!bg-transparent hover:!text-[#D4C7A6] hover:-translate-y-[1px] active:translate-y-0"
                onClick={() => {
                  if (!saveName()) return;

                  navigate("/join");
                }}
              >
                Join Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
