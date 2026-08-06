import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

import GameNotification from "../components/ui/GameNotification";

export default function JoinRoomPage() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    color: "yellow" as "green" | "red" | "yellow" | "blue",
  });

  const playerName = localStorage.getItem("playerName") || "Player";
  const [joining, setJoining] = useState(false);

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

      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 space-y-6">
          <h1 className="text-3xl font-bold">Join Room</h1>

          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 outline-none"
          />

          <button
            disabled={joining || roomCode.length !== 6}
            onClick={() => {
              if (joining) return;

              setJoining(true);

              socket.off("join-success");
              socket.off("join-failed");

              socket.emit("join-room", {
                roomCode,
                playerName,
              });

              socket.once("join-success", async (roomCode) => {
                await new Promise((resolve) => setTimeout(resolve, 500));

                setJoining(false);

                navigate("/lobby", {
                  state: {
                    roomCode,
                  },
                });
              });

              socket.once("join-failed", async (message) => {
                await new Promise((resolve) => setTimeout(resolve, 500));

                setJoining(false);

                if (message === "Room tidak ditemukan.") {
                  showNotification(
                    "ROOM TIDAK DITEMUKAN",
                    "Periksa kembali kode room yang kamu masukkan.",
                    "red",
                  );
                } else if (message === "Room sudah penuh.") {
                  showNotification(
                    "ROOM PENUH",
                    "Silakan cari room lain atau tunggu slot tersedia.",
                    "yellow",
                  );
                } else {
                  showNotification("GAGAL MASUK", message, "red");
                }
              });
            }}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </>
  );
}
