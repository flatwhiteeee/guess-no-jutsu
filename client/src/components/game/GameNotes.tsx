import { useEffect, useState } from "react";

export default function GameNotes({ resetKey }: { resetKey: number }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  useEffect(() => {
    setNotes("");
  }, [resetKey]);

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
