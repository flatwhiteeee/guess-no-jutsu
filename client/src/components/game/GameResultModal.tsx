interface Player {
  id: string;
  name: string;
  character: string;
}

interface Props {
  open: boolean;
  winners: Player[];
  losers: Player[];
  showPlayAgain: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export default function GameResultModal({
  open,
  winners,
  losers,
  showPlayAgain,
  onPlayAgain,
  onLeave,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl sm:max-w-lg sm:p-8">
        {winners.length > 0 ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-yellow-500/15 px-4 py-1 text-sm font-semibold text-yellow-400">
                MATCH FINISHED
              </div>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-yellow-400 sm:text-4xl">
              Congratulations
            </h2>

            <p className="mt-2 text-center text-slate-400">Match selesai!</p>

            <div className="mt-8">
              <h3 className="text-center text-xl font-bold sm:text-2xl">
                Winners
              </h3>

              <div className="mt-4 space-y-2">
                {winners.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-xl border border-green-500/30 bg-green-500/10 py-3"
                  >
                    <p className="text-center text-lg font-bold text-green-400">
                      {player.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {losers.length > 0 && (
              <>
                <hr className="my-8 border-slate-700" />

                <h3 className="text-center text-lg font-bold text-red-400 sm:text-xl">
                  Rewatch Naruto Time
                </h3>

                <div className="mt-4 space-y-2">
                  {losers.map((player) => (
                    <div
                      key={player.id}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 py-3"
                    >
                      <p className="text-center">
                        {player.name} — {player.character}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className="text-center text-3xl font-extrabold text-red-500 sm:text-4xl">
              🚨 GAME OVER 🚨
            </h2>

            <p className="mt-3 text-center text-slate-300">
              Tidak ada satupun shinobi yang berhasil menebak karakternya.
            </p>

            <div className="mt-8 space-y-2">
              {losers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 py-3"
                >
                  <p className="text-center">
                    {player.name} — {player.character}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full rounded-xl bg-green-600 py-3 text-lg font-bold transition hover:bg-green-700"
            >
              Play Again
            </button>
          )}

          <button
            onClick={onLeave}
            className="w-full rounded-xl bg-red-600 py-3 text-lg font-bold transition hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
