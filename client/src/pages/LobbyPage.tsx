import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Button from "../components/ui/Button";
import generateRoomCode from "../utils/generateRoomCode";
import GameNotification from "../components/ui/GameNotification";

interface Player {
  id: string;
  name: string;
  ready: boolean;
}

export default function LobbyPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [roomCode] = useState(() => state?.roomCode ?? generateRoomCode());
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const isHost = roomData?.host === socket.id;
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

  useEffect(() => {
    socket.on("game-state", (game) => {
      navigate("/game", {
        state: {
          game,
        },
      });
    });

    socket.on("start-game-failed", (message) => {
      if (message === "Masih ada pemain yang belum Ready.") {
        showNotification(
          "BELUM SEMUA SIAP",
          "Masih ada pemain yang belum menekan tombol Siap.",
          "yellow",
        );
      } else if (message === "Jumlah pemain belum memenuhi syarat.") {
        showNotification(
          "PEMAIN BELUM LENGKAP",
          "Jumlah pemain belum memenuhi kapasitas room.",
          "yellow",
        );
      } else {
        showNotification("TIDAK BISA MEMULAI", message, "red");
      }
    });
    socket.emit("get-room-data", roomCode);
    socket.emit("get-players", roomCode);

    socket.on("room-data", (room) => {
      setRoomData(room);
    });

    socket.on("players-updated", (players: Player[]) => {
      setPlayers(players);
    });
    socket.on("room-closed", () => {
      showNotification("ROOM DITUTUP", "Host telah menutup room.", "red");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    });

    return () => {
      socket.off("room-data");
      socket.off("players-updated");
      socket.off("game-state");
      socket.off("start-game-failed");
      socket.off("room-closed");
    };
  }, [roomCode]);

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
          <button
            onClick={() => navigate("/")}
            className="text-orange-400 hover:text-orange-300"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold">Lobby</h1>

          <div>
            <p className="text-slate-400">Room Code</p>

            <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-800 p-4">
              <span className="text-2xl font-bold tracking-widest">
                {roomCode}
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode);

                  setCopied(true);

                  setTimeout(() => {
                    setCopied(false);
                  }, 1500);
                }}
                className="rounded-lg bg-orange-500 px-3 py-2"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-slate-400">Room Settings</p>

            <div className="space-y-2 text-sm">
              <p>Category : {roomData?.category}</p>

              <p>Difficulty : {roomData?.difficulty}</p>

              <p>Max Players : {roomData?.maxPlayers}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-slate-400">Players</p>

            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-xl bg-slate-800 p-4"
                >
                  <div>
                    <p className="font-semibold">{player.name}</p>

                    <p className="text-sm text-slate-400">
                      {player.ready ? "🟢 Ready" : "⚪ Not Ready"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {players.length > 0 && player.id === players[0].id && (
                      <span className="text-orange-400">👑 Host</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => socket.emit("toggle-ready", roomCode)}
            >
              Saya Siap
            </Button>

            <button
              className="flex-1 rounded-xl bg-red-600 py-3 font-semibold hover:bg-red-700"
              onClick={() => {
                socket.emit("leave-room", roomCode);
                navigate("/");
              }}
            >
              🚪 Keluar
            </button>
          </div>

          <p className="text-center text-slate-400">
            {players.length} / {roomData?.maxPlayers} Players
          </p>

          {isHost ? (
            <button
              onClick={() => socket.emit("start-game", roomCode)}
              className="w-full rounded-xl bg-orange-500 py-3 font-semibold"
            >
              Start Game
            </button>
          ) : (
            <p className="text-center text-slate-400">
              Menunggu Host memulai game...
            </p>
          )}
        </div>
      </div>
    </>
  );
}
