import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../lib/socket";
import PlayerCard from "../components/game/PlayerCard";
import GameResultModal from "../components/game/GameResultModal";
import { useNavigate } from "react-router-dom";
import GameNotification from "../components/ui/GameNotification";
import GameNotes from "../components/game/GameNotes";
import gameBgHorizontal from "../assets/game-bg-horizontal.png";
import gameBgVertical from "../assets/game-bg-vertical.png";
import gameInfoCard from "../assets/game-info-card.png";
import nextTurnFrame from "../assets/next-turn-frame.png";
import nextRoundFrame from "../assets/next-round-frame.png";
import exitButtonFrame from "../assets/exit-button-frame.png";
import submitAnswerFrame from "../assets/submit-answer-frame.png";
import submitButton from "../assets/submit-button.png";

import round1 from "../assets/round-1.png";
import round2 from "../assets/round-2.png";
import round3 from "../assets/round-3.png";
import round4 from "../assets/round-4.png";
import round5 from "../assets/round-5.png";
import round6 from "../assets/round-6.png";
import round7 from "../assets/round-7.png";
import round8 from "../assets/round-8.png";
import round9 from "../assets/round-9.png";
import round10 from "../assets/round-10.png";

export default function GamePage() {
  const { state } = useLocation();
  const [answer, setAnswer] = useState("");
  const [notesResetKey, setNotesResetKey] = useState(0);
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);
  const timerAnchorRef = useRef<{
    playerId: string;
    timerStartedAt: number;
    timerLeft: number;
    clientStartedAt: number;
  } | null>(null);
  const [game, setGame] = useState<any>(state?.game);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [reconnectRequest, setReconnectRequest] = useState<any>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const wasDisconnected = useRef(false);
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
      setNotesResetKey((prev) => prev + 1);

      setGame((prev: any) => ({
        ...prev,
        currentTurn: "",
      }));
    });
    socket.on("returned-to-lobby", () => {
      navigate("/lobby", {
        state: {
          roomCode: game.room.roomCode,
        },
      });
    });

    socket.on("game-state", (data: any) => {
      setGame(data);
    });

    socket.on("disconnect", () => {
      wasDisconnected.current = true;
    });

    socket.on("connect", () => {
      if (!wasDisconnected.current) {
        return;
      }

      wasDisconnected.current = false;

      const savedSession = localStorage.getItem("guess-no-jutsu-session");

      if (!savedSession) {
        return;
      }

      try {
        const session = JSON.parse(savedSession);

        if (session.roomCode !== game.room.roomCode) {
          return;
        }

        const playerName = localStorage.getItem("playerName") || "Player";
        socket.emit("join-room", {
          roomCode: session.roomCode,
          playerName,
          sessionId: session.sessionId,
        });
      } catch {}
    });

    socket.on("reconnect-request", (data) => {
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
      socket.off("connect");
      socket.off("disconnect");
      socket.off("returned-to-lobby");
    };
  }, []);

  useEffect(() => {
    if (!game) return;

    const currentPlayer = game.room.players.find(
      (player: any) => player.name === game.currentTurn,
    );

    if (!currentPlayer || !currentPlayer.timerStartedAt) {
      timerAnchorRef.current = null;
      setCurrentTimeLeft(currentPlayer?.timerLeft ?? 0);
      return;
    }

    const timerStartedAt = currentPlayer.timerStartedAt;

    // Buat anchor baru hanya ketika turn/timer benar-benar berubah.
    // Kita tidak menggunakan Date.now() - timerStartedAt karena
    // timerStartedAt berasal dari clock server.
    if (
      !timerAnchorRef.current ||
      timerAnchorRef.current.playerId !== currentPlayer.id ||
      timerAnchorRef.current.timerStartedAt !== timerStartedAt
    ) {
      timerAnchorRef.current = {
        playerId: currentPlayer.id,
        timerStartedAt,
        timerLeft: currentPlayer.timerLeft,
        clientStartedAt: performance.now(),
      };
    }

    const updateTimer = () => {
      if (!timerAnchorRef.current) return;

      const elapsedSeconds = Math.floor(
        (performance.now() - timerAnchorRef.current.clientStartedAt) / 1000,
      );

      const remaining = Math.max(
        timerAnchorRef.current.timerLeft - elapsedSeconds,
        0,
      );

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

  const savedSession = localStorage.getItem("guess-no-jutsu-session");

  let mySessionId: string | null = null;

  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);

      if (session.roomCode === game.room.roomCode) {
        mySessionId = session.sessionId;
      }
    } catch {}
  }

  const me = game.room.players.find((p: any) => p.sessionId === mySessionId);

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
  const roundImages = [
    round1,
    round2,
    round3,
    round4,
    round5,
    round6,
    round7,
    round8,
    round9,
    round10,
  ];

  const currentRoundImage = roundImages[game.room.currentRound - 1];

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
          socket.emit("return-to-lobby", game.room.roomCode);
        }}
      />
      <div className="relative min-h-screen overflow-x-hidden p-8 text-white">
        {/* Background Mobile */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat md:hidden"
          style={{
            backgroundImage: `url(${gameBgVertical})`,
          }}
        />

        {/* Background Desktop */}
        <div
          className="fixed inset-0 z-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{
            backgroundImage: `url(${gameBgHorizontal})`,
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
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
            {/* Round */}
            <div className="text-center">
              <img
                src={currentRoundImage}
                alt={`Round ${game.room.currentRound}`}
                className="mx-auto w-[220px] object-contain md:w-[280px]"
              />

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

            {/* Game Info */}
            <div className="relative mx-auto w-full max-w-[850px] aspect-[2048/1200]">
              <img
                src={gameInfoCard}
                alt="Game Info"
                className="absolute inset-0 h-full w-full object-contain"
              />

              <div className="absolute inset-0 flex flex-col px-[10%] py-[8%]">
                {/* Title */}
                <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300 sm:text-[20px]">
                  Game Info
                </h2>

                {/* Content */}
                <div className="mt-[5%] flex-1">
                  <div className="flex items-center justify-between border-b border-slate-600/60 py-[2.5%]">
                    <span className="text-sm text-slate-300 sm:text-lg">
                      Players
                    </span>

                    <span className="text-sm font-bold text-white sm:text-lg">
                      {game.room.players.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-600/60 py-[2.5%]">
                    <span className="text-sm text-slate-300 sm:text-lg">
                      Category
                    </span>

                    <span className="text-sm font-bold text-red-500 sm:text-lg">
                      {game.room.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-600/60 py-[2.5%]">
                    <span className="text-sm text-slate-300 sm:text-lg">
                      Difficulty
                    </span>

                    <span className="text-sm font-bold text-white sm:text-lg">
                      {game.room.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-[2.5%]">
                    <span className="text-sm text-slate-300 sm:text-lg">
                      Room Code
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-widest text-white sm:text-lg">
                        {showRoomCode ? game.room.roomCode : "••••••"}
                      </span>

                      <button
                        onClick={() => setShowRoomCode(!showRoomCode)}
                        className="text-sm text-white transition hover:scale-110"
                      >
                        {showRoomCode ? "🙈" : "👁"}
                      </button>

                      {showRoomCode && (
                        <button
                          onClick={copyRoomCode}
                          className="text-sm text-white transition hover:scale-110"
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

            <div className="mx-auto mt-8 grid w-full max-w-[1180px] grid-cols-2 justify-items-center gap-x-100 gap-y-5 max-md:grid-cols-1 max-md:gap-x-0 max-md:gap-y-6 max-md:px-0">
              {game.room.players.map((player: any, index: number) => {
                const isLastOddPlayer =
                  game.room.players.length % 2 === 1 &&
                  index === game.room.players.length - 1;

                return (
                  <div
                    key={player.id}
                    className={`w-[880px] min-w-[880px] max-md:w-[calc(100vw-24px)] max-md:min-w-0 ${
                      isLastOddPlayer
                        ? "col-span-2 justify-self-center max-md:col-span-1"
                        : ""
                    }`}
                  >
                    <PlayerCard
                      player={player}
                      isMe={player.sessionId === mySessionId}
                      isCurrentTurn={player.name === game.currentTurn}
                      currentTimeLeft={currentTimeLeft}
                    />
                  </div>
                );
              })}
            </div>

            {canAnswer && (
              <div className="relative mx-auto mt-8 w-full max-w-[900px] aspect-[3/1]">
                <img
                  src={submitAnswerFrame}
                  alt=""
                  className="absolute inset-0 h-full w-full object-fill"
                />

                <div className="absolute inset-0 flex flex-col px-[12%] pt-[18%] pb-[8%]">
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="
  w-[450px]
  max-md:w-[150px]
  relative top-[-20px]
  relative left-[60px]
  max-md:top-[-10px]
  max-md:left-[30px]
  max-md:text-[10px]
  h-[42px]
  px-2
  bg-transparent
  border-0
  border-b-2
  max-md:border-b-1
  border-b-red-900/70
  text-white
  placeholder:text-gray-400/60
  rounded-none
  outline-none
  transition-all duration-200
  focus:border-b-red-500
  focus:shadow-[0_6px_12px_rgba(180,0,0,0.25)]
"
                    placeholder="Contoh : Itachi"
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
                    className="
  absolute
  bottom-[0%]
  left-[12%]
  w-[220px]
  max-md:w-[150px]
  max-md:bottom-[-25%]
  max-md:left-[5%]
  transition-all
  duration-200
  ease-out
  hover:scale-105
  hover:brightness-125
  disabled:opacity-40
  disabled:hover:scale-100
  disabled:hover:brightness-100
"
                  >
                    <img
                      src={submitButton}
                      alt="Submit"
                      className="h-auto w-full object-contain"
                    />

                    <span className="absolute inset-0 z-10 flex items-center justify-center font-bold text-white">
                      Submit
                    </span>
                  </button>
                </div>
              </div>
            )}

            {isHost && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  disabled={
                    game.room.turnIndex === game.room.turnOrder.length - 1
                  }
                  onClick={() => socket.emit("next-turn", game.room.roomCode)}
                  className="relative w-[400px] aspect-[3/1] transition-all duration-200 ease-out hover:scale-105 hover:-translate-y-1 hover:brightness-125 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:brightness-100"
                >
                  <img
                    src={nextTurnFrame}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill"
                  />

                  <span className="relative z-10 font-bold text-white">
                    Next Turn
                  </span>
                </button>

                <button
                  disabled={
                    game.room.turnIndex !== game.room.turnOrder.length - 1
                  }
                  onClick={() => socket.emit("next-round", game.room.roomCode)}
                  className="relative w-[400px] aspect-[3/1] transition-all duration-200 ease-out hover:scale-105 hover:-translate-y-1 hover:brightness-125 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:brightness-100"
                >
                  <img
                    src={nextRoundFrame}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill"
                  />

                  <span className="relative z-10 font-bold text-white">
                    Next Round
                  </span>
                </button>
              </div>
            )}
            <div className="mt-[-50px] max-md:translate-y-[30px] flex justify-center">
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="group relative w-[400px] max-md:w-[220px] opacity-70 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:opacity-100 hover:brightness-125 hover:drop-shadow-[0_0_18px_rgba(255,70,30,0.75)]"
              >
                <img
                  src={exitButtonFrame}
                  alt=""
                  className="h-auto w-full object-contain"
                />

                <span className="absolute inset-0 z-10 flex items-center justify-center pt-1 text-[14px] font-bold text-white">
                  Keluar Game
                </span>
              </button>
            </div>
          </div>
          <GameNotes
            resetKey={notesResetKey}
            currentTurn={game.currentTurn}
            players={game.room.players}
          />
        </div>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl">🚪</div>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Apakah kamu yakin?
              </h2>

              <p className="mt-3 text-slate-400">
                Kamu akan keluar dari game dan kembali ke lobby.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 rounded-xl bg-slate-700 py-3 font-bold text-white transition hover:bg-slate-600"
              >
                Tidak
              </button>

              <button
                onClick={() => {
                  socket.emit("leave-game", game.room.roomCode);
                  setShowLeaveConfirm(false);
                }}
                className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
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
