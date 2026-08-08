import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../lib/socket";
import PlayerCard from "../components/game/PlayerCard";
import GameResultModal from "../components/game/GameResultModal";
import { useNavigate } from "react-router-dom";
import GameNotification from "../components/ui/GameNotification";
import GameNotes from "../components/game/GameNotes";

export default function GamePage() {
  const { state } = useLocation();
  const [answer, setAnswer] = useState("");
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);
  const [game, setGame] = useState<any>(state?.game);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [reconnectRequest, setReconnectRequest] = useState<any>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    color: "blue" as "green" | "red" | "yellow" | "blue",
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

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(game.room.roomCode);

      alert("✅ Room code copied!");
    } catch {
      alert("❌ Gagal menyalin room code.");
    }
  };

  useEffect(() => {
    socket.on("game-finished", (data: any) => {
      setGame({
        room: data.room,
        currentTurn: "",
      });

      setWinners(data.winners || []);
      setLosers(data.losers || []);
      setGameFinished(true);
    });
    socket.on("time-expired", ({ playerName }) => {
      showNotification(
        "KEHABISAN WAKTU",
        `${playerName} kehabisan waktu!`,
        "red",
      );
    });
    socket.on("play-again", () => {
      setGameFinished(false);
      setWinners([]);
      setLosers([]);

      setAnswer("");

      setGame((prev: any) => ({
        ...prev,
        currentTurn: "",
      }));
    });

    socket.on("game-state", (data: any) => {
      setGame(data);
    });
    socket.on("reconnect-request", (data) => {
      console.log("HOST MENERIMA RECONNECT REQUEST", data);

      setReconnectRequest(data);
    });
    socket.on("room-closed", () => {
      showNotification("ROOM DITUTUP", "Host telah menutup room.", "red");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    });

    socket.on("answer-result", (result) => {
      if (result === true) {
        showNotification("BENAR!", "Kamu berhasil menebak karakter!", "green");
      } else if (result === false) {
        showNotification("SALAH!", "Kesempatan menjawab berkurang.", "red");
      } else if (result === "already_answered") {
        showNotification(
          "SUDAH MENJAWAB",
          "Kamu sudah menggunakan kesempatan menjawab di ronde ini.",
          "yellow",
        );
      } else if (result === "already_solved") {
        showNotification(
          "SELESAI",
          "Kamu sudah berhasil menebak karakter.",
          "green",
        );
      } else if (result === "not_your_turn") {
        showNotification("⏳ TUNGGU", "Belum giliranmu.", "blue");
      } else if (result === "eliminated") {
        showNotification(
          "KAMU GUGUR",
          "Kesempatan menjawabmu telah habis.",
          "red",
        );
      } else if (result === "out_of_answers") {
        showNotification("GUGUR", "Kesempatan menjawabmu sudah habis.", "red");
      } else if (result === "answer_locked") {
        showNotification(
          "TERKUNCI",
          "Jawaban baru bisa diberikan mulai Round 2.",
          "yellow",
        );
      } else if (result === "empty_answer") {
        showNotification("📝 KOSONG", "Jawaban tidak boleh kosong.", "yellow");
      }
    });

    return () => {
      socket.off("game-state");
      socket.off("game-finished");
      socket.off("time-expired");
      socket.off("answer-result");
      socket.off("play-again");
      socket.off("room-closed");
      socket.off("reconnect-request");
    };
  }, []);

  useEffect(() => {
    if (!game) return;

    const currentPlayer = game.room.players.find(
      (player: any) => player.name === game.currentTurn,
    );

    if (!currentPlayer || !currentPlayer.timerStartedAt) {
      setCurrentTimeLeft(currentPlayer?.timerLeft ?? 0);
      return;
    }

    const updateTimer = () => {
      const elapsedSeconds = Math.floor(
        (Date.now() - currentPlayer.timerStartedAt) / 1000,
      );

      const remaining = Math.max(currentPlayer.timerLeft - elapsedSeconds, 0);

      setCurrentTimeLeft(remaining);
      if (remaining === 0 && currentPlayer.name === me?.name) {
        socket.emit("timer-expired", game.room.roomCode);
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [game, game?.currentTurn]);

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const myId = socket.id;
  const isHost = game.room.host === myId;

  const me = game.room.players.find((p: any) => p.id === myId);
  console.log("MY SOCKET :", myId);

  console.log(
    "PLAYER IDS :",
    game.room.players.map((p: any) => ({
      name: p.name,
      id: p.id,
    })),
  );

  console.log("ME :", me);

  const canAnswer =
    game.room.currentRound > 1 &&
    game.currentTurn === me?.name &&
    !me?.solved &&
    me?.answerLeft > 0;

  const minutes = Math.floor(currentTimeLeft / 60);
  const seconds = currentTimeLeft % 60;

  const formattedTime = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

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
      <GameResultModal
        open={gameFinished}
        winners={winners}
        losers={losers}
        showPlayAgain={
          game.room.host === socket.id && game.room.players.length > 1
        }
        onPlayAgain={() => socket.emit("play-again", game.room.roomCode)}
        onLeave={() => {
          socket.emit("leave-room", game.room.roomCode);

          setTimeout(() => {
            navigate("/");
          }, 150);
        }}
      />
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto w-full max-w-7xl">
          {false && gameFinished && (
            <div className="mb-8 rounded-2xl border border-yellow-500 bg-yellow-500/10 p-6">
              {winners.length > 0 ? (
                <>
                  <h2 className="text-center text-3xl font-bold text-yellow-400">
                    🏆 CONGRATULATIONS 🏆
                  </h2>

                  <h3 className="mt-6 text-center text-2xl font-bold text-white">
                    🎉 Para Pemenang 🎉
                  </h3>

                  <div className="mt-5 space-y-2">
                    {winners.map((player: any) => (
                      <p
                        key={player.id}
                        className="text-center text-xl font-bold text-green-400"
                      >
                        🏆 {player.name}
                      </p>
                    ))}
                  </div>

                  {losers.length > 0 && (
                    <>
                      <hr className="my-6 border-slate-600" />

                      <h3 className="text-center text-xl font-bold text-red-400">
                        😂 Saatnya Rewatch Naruto 😂
                      </h3>

                      <div className="mt-4 space-y-2">
                        {losers.map((player: any) => (
                          <p key={player.id} className="text-center text-lg">
                            • {player.name}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-center text-3xl font-bold text-red-500">
                    🚨 GAME OVER 🚨
                  </h2>

                  <h3 className="mt-6 text-center text-2xl font-bold text-red-400">
                    😂 SEMUANYA WAJIB REWATCH NARUTO!!! 😂
                  </h3>

                  <p className="mt-3 text-center text-slate-300">
                    Tidak ada satupun shinobi yang berhasil menebak karakternya.
                  </p>

                  <hr className="my-6 border-slate-600" />

                  <div className="space-y-2">
                    {losers.map((player: any) => (
                      <p key={player.id} className="text-center text-lg">
                        • {player.name}
                      </p>
                    ))}
                  </div>
                </>
              )}
              {game.room.players.length === 1 &&
                game.room.host === socket.id && (
                  <div className="mt-8 rounded-xl bg-slate-800 p-4 text-center">
                    <p className="font-bold text-yellow-400">
                      Semua pemain telah meninggalkan room.
                    </p>

                    <p className="mt-2 text-slate-300">
                      Room akan ditutup setelah kamu kembali ke Landing Page.
                    </p>
                  </div>
                )}

              {/* ===== Tombol Akhir Match ===== */}
              <div className="mt-8 flex justify-center gap-4">
                {game.room.host === socket.id &&
                  game.room.players.length > 1 && (
                    <button
                      onClick={() =>
                        socket.emit("play-again", game.room.roomCode)
                      }
                      className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
                    >
                      🔄 Play Again
                    </button>
                  )}

                <button
                  onClick={() => {
                    socket.emit("leave-room", game.room.roomCode);

                    setTimeout(() => {
                      navigate("/");
                    }, 150);
                  }}
                  className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
                >
                  🏠 Kembali ke Landing
                </button>
              </div>
            </div>
          )}

          <div className="mb-8 space-y-6">
            {/* Round */}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold lg:text-5xl">
                Round {game.room.currentRound}
              </h1>

              <p className="mt-2 text-lg font-bold text-orange-400 lg:text-xl">
                Current Turn : {game.currentTurn}
              </p>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Time Remaining
                </p>

                <p className="mt-1 text-3xl font-extrabold text-orange-400">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Info Match */}
            <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg">
              <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                Game Info
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Players</span>
                  <span className="font-bold">{game.room.players.length}</span>
                </div>

                <div className="h-px bg-slate-700" />

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="font-semibold text-orange-400">
                    {game.room.category}
                  </span>
                </div>

                <div className="h-px bg-slate-700" />

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Difficulty</span>
                  <span className="font-semibold">{game.room.difficulty}</span>
                </div>
                <div className="h-px bg-slate-700" />

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Room Code</span>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-widest">
                      {showRoomCode ? game.room.roomCode : "••••••"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRoomCode(!showRoomCode)}
                        className="transition hover:scale-110"
                      >
                        {showRoomCode ? "🙈" : "👁"}
                      </button>

                      {showRoomCode && (
                        <button
                          onClick={copyRoomCode}
                          className="transition hover:scale-110"
                          title="Copy Room Code"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {game.room.players.map((player: any) => (
              <PlayerCard
                key={player.id}
                player={player}
                isMe={player.id === myId}
                gameFinished={gameFinished}
              />
            ))}
          </div>

          {canAnswer && (
            <div className="mt-8 rounded-xl bg-slate-800 p-6">
              <h2 className="mb-4 text-xl font-bold">Submit Answer</h2>

              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full rounded-xl bg-slate-700 p-3"
                placeholder="Contoh : Uchiha Itachi"
              />

              <button
                disabled={me?.answeredThisRound || answer.trim() === ""}
                onClick={() => {
                  if (answer.trim() === "") return;

                  socket.emit("submit-answer", {
                    roomCode: game.room.roomCode,
                    answer: answer.trim(),
                  });

                  setAnswer("");
                }}
                className="mt-4 rounded-xl bg-orange-500 px-5 py-3 disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          )}

          {isHost && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                disabled={
                  game.room.turnIndex === game.room.turnOrder.length - 1
                }
                onClick={() => socket.emit("next-turn", game.room.roomCode)}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold disabled:opacity-40"
              >
                Next Turn
              </button>

              <button
                disabled={
                  game.room.turnIndex !== game.room.turnOrder.length - 1
                }
                onClick={() => socket.emit("next-round", game.room.roomCode)}
                className="rounded-xl bg-green-600 px-6 py-3 font-bold disabled:opacity-40"
              >
                Next Round
              </button>
            </div>
          )}
        </div>
        <GameNotes />
      </div>
      {reconnectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-5xl">🔄</div>

              <h2 className="mt-3 text-2xl font-bold text-white">Reconnect</h2>

              <p className="mt-4 text-slate-300">
                Player
                <br />
                <span className="font-bold text-orange-400">
                  {reconnectRequest.playerName}
                </span>
                <br />
                ingin kembali ke game.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setReconnectRequest(null)}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700"
              >
                Tolak
              </button>

              <button
                onClick={() => {
                  socket.emit("approve-reconnect", {
                    sessionId: reconnectRequest.sessionId,
                    socketId: reconnectRequest.socketId,
                  });

                  setReconnectRequest(null);
                }}
                className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
              >
                Terima
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
