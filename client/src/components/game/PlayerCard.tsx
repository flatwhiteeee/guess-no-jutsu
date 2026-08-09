interface PlayerCardProps {
  player: any;
  isMe: boolean;
  gameFinished: boolean;
  isCurrentTurn: boolean;
  currentTimeLeft: number;
}

export default function PlayerCard({
  player,
  isMe,
  gameFinished,
  isCurrentTurn,
  currentTimeLeft,
}: PlayerCardProps) {
  const timeLeft = isCurrentTurn ? currentTimeLeft : player.timerLeft;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return (
    <div
      className={`rounded-2xl p-5 space-y-2 transition-all duration-300 ${
        isCurrentTurn
          ? "bg-slate-800 ring-2 ring-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.45)]"
          : "bg-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{player.name}</h2>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            player.connected
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {player.connected ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>

      <p>
        Character :
        <span className="ml-2 font-bold text-orange-400">
          {isMe
            ? player.solved || player.failed
              ? player.character
              : "??????"
            : player.character}
        </span>
      </p>

      <p>Questions : {player.questionLeft < 0 ? "-" : player.questionLeft}</p>

      <p>Answers : {player.answerLeft < 0 ? "-" : player.answerLeft}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-slate-400">Time</span>
        <span className="font-bold text-orange-400">{formattedTime}</span>
      </div>

      {player.solved ? (
        <p className="font-bold text-green-400">✅ SOLVED</p>
      ) : player.failed ? (
        <p className="font-bold text-red-400">😢 Yah gugur</p>
      ) : null}
    </div>
  );
}
