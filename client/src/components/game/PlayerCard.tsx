import playerCardInactive from "../../assets/player-card-inactive.png";
import playerCardActive from "../../assets/player-card-active.png";

interface PlayerCardProps {
  player: any;
  isMe: boolean;
  isCurrentTurn: boolean;
  currentTimeLeft: number;
}

export default function PlayerCard({
  player,
  isMe,
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
    <div className="relative w-full aspect-[3/1] [container-type:inline-size]">
      <img
        src={isCurrentTurn ? playerCardActive : playerCardInactive}
        alt=""
        className={`absolute inset-0 h-full w-full object-contain ${
          isCurrentTurn ? "scale-[1.22]" : "scale-100"
        }`}
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-[20%] py-[7%]">
        {/* Player name + connection status */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[clamp(11px,5.8cqw,18px)] font-bold leading-none text-slate-100">
            {player.name}
          </h2>

          <span
            className={`shrink-0 rounded-full px-[1.3cqw] py-[0.3cqw] text-[clamp(9px,3.5cqw,11px)] font-bold ${
              player.leftGame
                ? "bg-slate-500/20 text-slate-300"
                : player.connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {player.leftGame
              ? "⚪ Keluar Game"
              : player.connected
                ? "🟢 Online"
                : "🔴 Offline"}
          </span>
        </div>

        {/* Player information */}
        <div className="mt-[1.3cqw] space-y-[1cqw] text-[clamp(9px,4.5cqw,14px)] leading-tight text-slate-300">
          <p>
            Character :
            <span className="ml-[0.7cqw] font-bold text-orange-400">
              {isMe
                ? player.solved || player.failed
                  ? player.character
                  : "??????"
                : player.character}
            </span>
          </p>

          <p>
            Questions : {player.questionLeft < 0 ? "-" : player.questionLeft}
          </p>

          <p>Answers : {player.answerLeft < 0 ? "-" : player.answerLeft}</p>
        </div>

        {/* Timer */}
        {/* Timer */}
        <div className="mt-[1.3cqw] border-t border-slate-500/40 pt-[1cqw]">
          <div className="flex items-center justify-between text-[clamp(9px,4.5cqw,14px)]">
            <span className="text-slate-400">Time</span>

            <span className="font-bold text-orange-400">{formattedTime}</span>
          </div>
        </div>

        {/* Result state */}
        {player.solved ? (
          <p className="mt-[0.7cqw] text-[clamp(9px,4.5cqw,14px)] font-bold text-green-400">
            ✅ SOLVED
          </p>
        ) : player.failed ? (
          <p className="mt-[0.7cqw] text-[clamp(9px,4.5cqw,14px)] font-bold text-red-400">
            😢 Yah gugur
          </p>
        ) : null}
      </div>
    </div>
  );
}
