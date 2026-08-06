import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../lib/socket";
import PlayerCard from "../components/game/PlayerCard";
import { useNavigate } from "react-router-dom";
import GameNotification from "../components/ui/GameNotification";

export default function GamePage() {
  const { state } = useLocation();
  const [answer, setAnswer] = useState("");
  const [game, setGame] = useState<any>(state?.game);
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

    socket.on("answer-result", (result) => {
      if (result === true) {
        showNotification(
          "BENAR!",
          "Kamu berhasil menebak karakter!",
          "green",
        );
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
      } else if (result === "out_of_answers") {
        showNotification(
          "GUGUR",
          "Kesempatan menjawabmu sudah habis.",
          "red",
        );
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
      socket.off("answer-result");
      socket.off("play-again");
    };
  }, []);

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

  const canAnswer =
    game.room.currentRound > 1 &&
    game.currentTurn === me?.name &&
    !me?.solved &&
    me?.answerLeft > 0;

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
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        {gameFinished && (
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
            {game.room.players.length === 1 && game.room.host === socket.id && (
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
              {game.room.host === socket.id && game.room.players.length > 1 && (
                <button
                  onClick={() => socket.emit("play-again", game.room.roomCode)}
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Round {game.room.currentRound}
            </h1>

            <p className="mt-2 text-orange-400">
              Current Turn : {game.currentTurn}
            </p>
          </div>

          <div className="text-right">
            <p>Players : {game.room.players.length}</p>
            <p>Category : {game.room.category}</p>
            <p>Difficulty : {game.room.difficulty}</p>
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
          <div className="mt-8 flex gap-4">
            <button
              disabled={game.room.turnIndex === game.room.turnOrder.length - 1}
              onClick={() => socket.emit("next-turn", game.room.roomCode)}
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold disabled:opacity-40"
            >
              Next Turn
            </button>

            <button
              disabled={game.room.turnIndex !== game.room.turnOrder.length - 1}
              onClick={() => socket.emit("next-round", game.room.roomCode)}
              className="rounded-xl bg-green-600 px-6 py-3 font-bold disabled:opacity-40"
            >
              Next Round
            </button>
          </div>
        )}
      </div>
    </>
  );
}
