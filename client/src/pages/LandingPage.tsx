import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import GameNotification from "../components/ui/GameNotification";

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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl"></div>

          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>

          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"></div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-6">
          <Card className="w-full max-w-sm space-y-8">
            <Logo />

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Masukkan Nama"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full rounded-xl bg-slate-800 p-3 text-white"
              />

              <Button
                onClick={() => {
                  if (!saveName()) return;

                  navigate("/create");
                }}
              >
                Create Room
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  if (!saveName()) return;

                  navigate("/join");
                }}
              >
                Join Room
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
