import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import Button from "../components/ui/Button";
import generateRoomCode from "../utils/generateRoomCode";
import GameNotification from "../components/ui/GameNotification";
import CategorySelector from "../features/room/components/CategorySelector";
import lobbyBgHorizontal from "../assets/lobby-bg-horizontal.png";
import lobbyBgVertical from "../assets/lobby-bg-vertical.png";
import lobbyTitle from "../assets/lobby-title.png";

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
  const [showSettings, setShowSettings] = useState(false);
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editMaxPlayers, setEditMaxPlayers] = useState(2);
  const [editCategory, setEditCategory] = useState("");
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
      <div className="relative min-h-screen overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
          style={{
            backgroundImage: `url(${lobbyBgVertical})`,
          }}
        />

        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{
            backgroundImage: `url(${lobbyBgHorizontal})`,
          }}
        />
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-x-hidden p-6 translate-y-[40px] md:translate-y-0 md:-translate-x-[10vw]">
          <div className="relative w-full md:w-[min(70vw,900px)] md:max-w-none">
            {/* ARTWORK LOBBY */}
            <div className="absolute left-1/2 -top-[150px] z-20 -translate-x-1/2">
              <img
                src={lobbyTitle}
                alt="Lobby"
                className="w-[300px] max-w-none object-contain md:w-[435px] "
              />
            </div>

            {/* CARD */}
            <div className="w-full rounded-3xl bg-[#17191c]/70 backdrop-blur-[1px] p-6 space-y-6">
              <div>
                <p className="text-slate-300 md:text-[15px] md:font-semibold md:tracking-wide">
                  Room Code
                </p>

                <div className="group relative mt-3 flex items-center justify-between overflow-hidden rounded-xl border border-orange-200/10 bg-[#11151b]/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-[3px] md:p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(251,146,60,0.12),transparent_35%)]" />
                  <span className="relative z-10 text-2xl font-extrabold tracking-[0.3em] text-slate-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.12)] md:text-[27px]">
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
                    className="rounded-lg border border-[#D39A5A]/25 bg-[#6B5140]/90 px-4 py-2 font-semibold text-[#E7C28A] shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all duration-200 hover:border-[#D39A5A]/40 hover:bg-[#A8784F]/90 hover:text-[#FFF1D2] hover:shadow-[0_4px_18px_rgba(168,120,79,0.25)] active:scale-95 md:px-4"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-slate-300 md:text-[15px] md:font-semibold md:tracking-wide">
                    Room Settings
                  </p>

                  {isHost && (
                    <button
                      onClick={() => {
                        setEditDifficulty(roomData?.difficulty || "");
                        setEditMaxPlayers(roomData?.maxPlayers || 2);
                        setShowSettings(true);
                        setEditCategory(roomData?.category || "");
                      }}
                      title="Room Settings"
                      aria-label="Room Settings"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D39A5A]/15 bg-[#202830]/75 text-base text-[#D3B47A]/80 shadow-[0_4px_14px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-200 hover:border-[#D39A5A]/30 hover:bg-[#6B5140]/45 hover:text-[#E7C28A] hover:shadow-[0_0_18px_rgba(211,154,90,0.15)] active:scale-95 md:h-10 md:w-10"
                    >
                      ⚙
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 md:gap-3">
                  <div className="rounded-lg border border-slate-300/10 bg-slate-900/35 px-3 py-2.5 text-center backdrop-blur-[2px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-100 md:text-[15px]">
                      {roomData?.category}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-300/10 bg-slate-900/35 px-3 py-2.5 text-center backdrop-blur-[2px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Difficulty
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-100 md:text-[15px]">
                      {roomData?.difficulty}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-300/10 bg-slate-900/35 px-3 py-2.5 text-center backdrop-blur-[2px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Max Players
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100 md:text-[15px]">
                      {roomData?.maxPlayers}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-300 md:text-[15px] md:font-semibold md:tracking-wide">
                  Players
                </p>

                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between relative overflow-hidden rounded-xl border border-slate-300/10 bg-[#11151b]/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_22px_rgba(0,0,0,0.2)] backdrop-blur-[2px]"
                    >
                      <div>
                        <p className="font-semibold tracking-wide text-slate-100 md:text-[15px]">
                          {player.name}
                        </p>

                        <p className="text-xs font-medium tracking-wide text-slate-400 md:text-sm">
                          {player.ready ? "🟢 Ready" : "⚪ Not Ready"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {players.length > 0 && player.id === players[0].id && (
                          <span className="font-semibold tracking-wide text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.2)]">
                            👑 Host
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 md:py-3.5"
                  onClick={() => socket.emit("toggle-ready", roomCode)}
                >
                  Saya Siap
                </Button>

                <button
                  className="flex-1 rounded-xl border border-[#A76643]/25 bg-[#713D2E]/80 px-5 py-3 font-semibold tracking-wide text-[#F0D8C0] shadow-[0_6px_20px_rgba(50,20,15,0.25)] transition-all duration-200 hover:border-[#C07855]/30 hover:bg-[#8A4A36]/90 hover:shadow-[0_8px_25px_rgba(113,61,46,0.3)] active:scale-[0.98] md:py-3.5"
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
                  className="w-full rounded-xl border border-[#D39A5A]/30 bg-[#A8784F] py-3 font-bold tracking-wide text-[#FFF1D2] shadow-[0_6px_24px_rgba(107,81,64,0.35)] transition-all duration-200 hover:border-[#E7C28A]/40 hover:bg-[#C08A5A] hover:shadow-[0_8px_30px_rgba(168,120,79,0.4)] active:scale-[0.99]"
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
        </div>
      </div>
      {showSettings && isHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">
              Edit Room Settings
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <CategorySelector
                  value={editCategory}
                  onChange={setEditCategory}
                />
              </div>

              <div>
                <p className="mb-3 font-semibold text-slate-300">Difficulty</p>

                <div className="grid grid-cols-2 gap-3">
                  {["Easy", "Medium", "Hard"].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setEditDifficulty(difficulty)}
                      className={`rounded-xl border p-3 text-white transition ${
                        editDifficulty === difficulty
                          ? "border-[#D39A5A] bg-[#6B5140] text-[#E7C28A]"
                          : "border-[#344252] bg-[#202830] text-[#E7E2D8] hover:bg-[#344252]"
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold text-slate-300">
                  Maximum Players
                </p>

                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() =>
                      setEditMaxPlayers(Math.max(2, editMaxPlayers - 1))
                    }
                    className="rounded-xl border border-[#344252] bg-[#344252] px-4 py-2 text-[#E7E2D8] transition hover:bg-[#45535D]"
                  >
                    -
                  </button>

                  <span className="text-3xl font-bold text-white">
                    {editMaxPlayers}
                  </span>

                  <button
                    onClick={() =>
                      setEditMaxPlayers(Math.min(10, editMaxPlayers + 1))
                    }
                    className="rounded-xl border border-[#D39A5A]/30 bg-[#6B5140] px-4 py-2 text-[#E7C28A] transition hover:bg-[#8A684F]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-xl border border-[#344252] bg-[#344252] py-3 font-semibold text-[#E7E2D8] transition hover:bg-[#45535D]"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  socket.emit("update-room-settings", {
                    roomCode,
                    category: editCategory,
                    difficulty: editDifficulty,
                    maxPlayers: editMaxPlayers,
                  });

                  setShowSettings(false);
                }}
                className="flex-1 rounded-xl border border-[#D39A5A]/30 bg-[#A8784F] py-3 font-semibold text-[#FFF1D2] transition hover:bg-[#C08A5A]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
