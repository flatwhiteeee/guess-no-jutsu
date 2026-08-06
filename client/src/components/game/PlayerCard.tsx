interface PlayerCardProps {
  player: any;
  isMe: boolean;
  gameFinished: boolean;
}

export default function PlayerCard({
  player,
  isMe,
  gameFinished,
}: PlayerCardProps) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5 space-y-2">
      <h2 className="text-xl font-bold">{player.name}</h2>

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

      {gameFinished ? (
        player.solved ? (
          <p className="font-bold text-green-400">✅ SOLVED</p>
        ) : player.failed ? (
          <p className="font-bold text-red-400">❌ FAILED</p>
        ) : (
          <p className="font-bold text-blue-400">🎮 Masih Bertahan</p>
        )
      ) : player.solved ? (
        <p className="font-bold text-green-400">✅ SOLVED</p>
      ) : player.failed ? (
        <p className="font-bold text-red-400">😢 Yah gugur</p>
      ) : (
        <p className="text-yellow-400">🎮 Playing</p>
      )}
    </div>
  );
}
