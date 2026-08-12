import { useEffect, useRef, useState } from "react";

export default function GameNotes({
  resetKey,
  currentTurn,
  players,
}: {
  resetKey: number;
  currentTurn: string;
  players: any[];
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const previousPlayers = useRef<any[] | null>(null);

  const [turnIndicator, setTurnIndicator] = useState<{
    type: "turn" | "solved" | "failed";
    playerName: string;
  }>({
    type: "turn",
    playerName: currentTurn,
  });
  useEffect(() => {
    setNotes("");
  }, [resetKey]);
  useEffect(() => {
    if (!players) return;

    // Pertama kali menerima data, hanya simpan snapshot.
    // Jangan anggap player yang sudah solved/failed sebagai kejadian baru.
    if (previousPlayers.current === null) {
      previousPlayers.current = players;
      setTurnIndicator({
        type: "turn",
        playerName: currentTurn,
      });
      return;
    }

    const previous = previousPlayers.current;

    const changedPlayer = players.find((player: any) => {
      const oldPlayer = previous.find((p: any) => p.id === player.id);

      if (!oldPlayer) return false;

      return (
        (!oldPlayer.solved && player.solved) ||
        (!oldPlayer.failed && player.failed)
      );
    });

    if (changedPlayer) {
      if (changedPlayer.solved) {
        setTurnIndicator({
          type: "solved",
          playerName: changedPlayer.name,
        });
      } else if (changedPlayer.failed) {
        setTurnIndicator({
          type: "failed",
          playerName: changedPlayer.name,
        });
      }

      // Setelah status selesai ditampilkan sebentar,
      // kembali ke player yang sedang mendapat giliran.
      const timer = setTimeout(() => {
        setTurnIndicator({
          type: "turn",
          playerName: currentTurn,
        });
      }, 1500);

      previousPlayers.current = players;

      return () => clearTimeout(timer);
    }

    // Tidak ada solved/failed baru → langsung tampilkan current turn.
    setTurnIndicator({
      type: "turn",
      playerName: currentTurn,
    });

    previousPlayers.current = players;
  }, [players, currentTurn]);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl shadow-xl transition hover:bg-orange-400"
        >
          📋
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-slate-900 transition-all duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto w-full max-w-xl p-5">
          <div className="mb-4 flex justify-center">
            <div className="h-1.5 w-14 rounded-full bg-slate-600" />
          </div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Notes</h2>

              <p className="mt-1 text-sm text-slate-400">
                Catat petunjuk karakter selama permainan.
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  turnIndicator.type === "solved"
                    ? "bg-green-500/10 text-green-400"
                    : turnIndicator.type === "failed"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-orange-500/10 text-orange-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    turnIndicator.type === "solved"
                      ? "bg-green-400"
                      : turnIndicator.type === "failed"
                        ? "bg-red-400"
                        : "bg-orange-400"
                  }`}
                />

                {turnIndicator.type === "solved"
                  ? `${turnIndicator.playerName} SOLVED`
                  : turnIndicator.type === "failed"
                    ? `${turnIndicator.playerName} GUGUR`
                    : `Giliran: ${turnIndicator.playerName || "-"}`}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-2xl text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mulai tulis petunjukmu di sini..."
            className="h-56 w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white shadow-inner outline-none transition focus:border-orange-500 placeholder:text-slate-500"
          />
        </div>
      </div>
    </>
  );
}
