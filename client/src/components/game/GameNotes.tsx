import { useEffect, useRef, useState } from "react";
import gameNotesScroll from "../../assets/game-notes-scroll.png";
import gameNotesScrollPopup from "../../assets/game-notes-scroll-popup.png";
import gameNotesScrollMobile from "../../assets/game-notes-scroll-mobile.png";
import gameNotesPopupExit from "../../assets/game-notes-popup-exit.png";

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
  const [notes, setNotes] = useState("• ");
  const previousPlayers = useRef<any[] | null>(null);
  const leftNotesRef = useRef<HTMLTextAreaElement>(null);
  const rightNotesRef = useRef<HTMLTextAreaElement>(null);
  const mobileNoteRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [turnIndicator, setTurnIndicator] = useState<{
    type: "turn" | "solved" | "failed";
    playerName: string;
  }>({
    type: "turn",
    playerName: currentTurn,
  });
  useEffect(() => {
    setNotes("• ");
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
  const noteLines = notes.split("\n");

  const leftNoteLines = noteLines.slice(0, 5);
  const rightNoteLines = noteLines.slice(5, 10);

  const leftNotes = leftNoteLines.join("\n");
  const rightNotes = rightNoteLines.join("\n");
  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 w-20 transition-all duration-200 hover:scale-105 hover:brightness-125 md:bottom-6 md:right-6 md:w-24"
        >
          <img
            src={gameNotesScroll}
            alt="Open Notes"
            className="h-auto w-full object-contain"
          />
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
        className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="relative mx-auto w-full max-w-[1100px]">
          {/* Popup Notes Asset — DESKTOP */}
          <img
            src={gameNotesScrollPopup}
            alt="Notes"
            className="hidden h-auto w-full object-contain md:block"
          />

          {/* Popup Notes Asset — MOBILE */}
          <img
            src={gameNotesScrollMobile}
            alt="Notes Mobile"
            className="block h-auto w-full object-contain md:hidden"
          />

          {/* Popup Content */}
          <div className="absolute inset-0">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-[15%] top-[12%] z-10 w-[50px] transition-all duration-200 hover:scale-110 hover:brightness-125 md:right-[14%] md:top-[27%] md:w-[90px]"
            >
              <img
                src={gameNotesPopupExit}
                alt="Close Notes"
                className="h-auto w-full object-contain"
              />
            </button>

            {/* Turn Indicator */}
            <div
              className={`absolute left-1/2 top-[16%] -translate-x-1/2 inline-flex items-center gap-2 px-2 py-1 text-[16px] font-semibold md:top-[27%] md:px-3 md:py-1.5 md:text-[20px] ${
                turnIndicator.type === "solved"
                  ? "text-[#3f7d20]"
                  : turnIndicator.type === "failed"
                    ? "text-[#dc2626]"
                    : "text-[#7f1d1d]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  turnIndicator.type === "solved"
                    ? "text-[#3f7d20]"
                    : turnIndicator.type === "failed"
                      ? "text-[#dc2626]"
                      : "text-[#7f1d1d]"
                }`}
              />

              {turnIndicator.type === "solved"
                ? `${turnIndicator.playerName} SOLVED`
                : turnIndicator.type === "failed"
                  ? `${turnIndicator.playerName} GUGUR`
                  : `Giliran: ${turnIndicator.playerName || "-"}`}
            </div>
            {/* Mobile Divider */}
            <div className="absolute left-1/2 top-[22%] w-[55%] -translate-x-1/2 border-t-[2px] border-[#7f1d1d]/80 md:hidden" />

            {/* Notes Input Area */}
            <div className="absolute inset-0 hidden md:block">
              {/* LEFT COLUMN — Bullet 1–6 */}
              <textarea
                ref={leftNotesRef}
                value={leftNotes}
                onChange={(e) => {
                  const value = e.target.value;

                  const lines = value.split("\n");

                  const limitedLines = lines.map((line) => {
                    const bullet = line.startsWith("• ") ? "• " : "";
                    const content = line.startsWith("• ")
                      ? line.slice(2)
                      : line;

                    return bullet + content.slice(0, 26);
                  });

                  const newLeftNotes = limitedLines.join("\n");

                  setNotes(
                    rightNotes
                      ? `${newLeftNotes}\n${rightNotes}`
                      : newLeftNotes,
                  );
                }}
                onKeyDown={(e) => {
                  const textarea = e.currentTarget;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;

                  // CTRL + A
                  // Bullet pertama tetap tidak ikut terseleksi.
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                    e.preventDefault();

                    requestAnimationFrame(() => {
                      textarea.selectionStart = 2;
                      textarea.selectionEnd = leftNotes.length;
                    });

                    return;
                  }

                  // ENTER
                  if (e.key === "Enter") {
                    e.preventDefault();

                    const lineNumber = leftNotes
                      .substring(0, start)
                      .split("\n").length;

                    const newValue =
                      leftNotes.substring(0, start) +
                      "\n• " +
                      leftNotes.substring(end);

                    const newLines = newValue.split("\n");

                    const newLeft = newLines.slice(0, 6).join("\n");
                    const newRight = newLines.slice(6).join("\n");

                    setNotes(newRight ? `${newLeft}\n${newRight}` : newLeft);

                    // Kalau Enter dilakukan pada bullet ke-6,
                    // pindahkan cursor ke kolom kanan.
                    if (lineNumber === 5) {
                      requestAnimationFrame(() => {
                        rightNotesRef.current?.focus();

                        rightNotesRef.current?.setSelectionRange(2, 2);
                      });
                    } else {
                      requestAnimationFrame(() => {
                        const cursorPosition = start + 3;

                        textarea.selectionStart = cursorPosition;
                        textarea.selectionEnd = cursorPosition;
                      });
                    }

                    return;
                  }

                  // BACKSPACE
                  if (e.key === "Backspace" && start === end) {
                    // Bullet pertama tidak boleh dihapus.
                    if (start <= 2) {
                      e.preventDefault();
                      return;
                    }
                  }

                  // DELETE
                  if (e.key === "Delete" && start === end) {
                    if (start < 2) {
                      e.preventDefault();
                      return;
                    }
                  }
                }}
                placeholder=""
                className="
      absolute
      left-[16%]
      top-[35%]
      bottom-[14%]
      w-[35%]
      resize-none
      overflow-y-auto
      overflow-x-hidden
      border-0
      bg-transparent
      p-2
      text-lg
      font-bold
      leading-relaxed
      text-[#1f1713]
      outline-none
      whitespace-pre-wrap
      break-words
    "
              />

              {/* RIGHT COLUMN — Bullet 7+ */}
              <textarea
                ref={rightNotesRef}
                value={rightNotes}
                onFocus={() => {
                  if (leftNoteLines.length < 5) {
                    requestAnimationFrame(() => {
                      leftNotesRef.current?.focus();

                      const cursorPosition = leftNotes.length;

                      leftNotesRef.current?.setSelectionRange(
                        cursorPosition,
                        cursorPosition,
                      );
                    });
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  const lines = value.split("\n");

                  const limitedLines = lines.map((line) => {
                    const bullet = line.startsWith("• ") ? "• " : "";
                    const content = line.startsWith("• ")
                      ? line.slice(2)
                      : line;

                    return bullet + content.slice(0, 23);
                  });

                  const newRightNotes = limitedLines.join("\n");

                  setNotes(
                    newRightNotes
                      ? `${leftNotes}\n${newRightNotes}`
                      : leftNotes,
                  );
                }}
                onKeyDown={(e) => {
                  const textarea = e.currentTarget;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;

                  // ENTER
                  if (e.key === "Enter") {
                    e.preventDefault();

                    // Maksimal 10 dot total
                    if (noteLines.length >= 10) {
                      return;
                    }

                    const newValue =
                      rightNotes.substring(0, start) +
                      "\n• " +
                      rightNotes.substring(end);

                    setNotes(`${leftNotes}\n${newValue}`);

                    requestAnimationFrame(() => {
                      const cursorPosition = start + 3;

                      textarea.selectionStart = cursorPosition;
                      textarea.selectionEnd = cursorPosition;
                    });

                    return;
                  }

                  // BACKSPACE
                  // Bullet di kolom kanan boleh dihapus.
                  if (e.key === "Backspace") {
                    return;
                  }

                  // DELETE
                  if (e.key === "Delete") {
                    return;
                  }
                }}
                placeholder=""
                className="
      absolute
      left-[50%]
      top-[35%]
      bottom-[14%]
      w-[35%]
      resize-none
      overflow-y-auto
      overflow-x-hidden
      border-0
      bg-transparent
      p-2
      text-lg
      font-bold
      leading-relaxed
      text-[#1f1713]
      outline-none
      whitespace-pre-wrap
      break-words
    "
              />
            </div>
            {/* MOBILE NOTES INPUT */}
            <div
              className="
    absolute
    left-1/2
    top-[27%]
    h-[65%]
    w-[72%]
    -translate-x-1/2
    overflow-y-auto
    overflow-x-hidden
    px-10
    text-[16px]
    font-bold
    leading-[1.55]
    text-[#1f1713]
    md:hidden
  "
            >
              {noteLines.map((line, index) => {
                const content = line.startsWith("• ") ? line.slice(2) : line;

                return (
                  <div key={index} className="flex items-start">
                    {/* DOT */}
                    <span
                      className="
            w-[18px]
            shrink-0
            select-none
          "
                    >
                      •
                    </span>

                    {/* TEXT */}
                    <div
                      ref={(el) => {
                        mobileNoteRefs.current[index] = el;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBeforeInput={(e) => {
                        const target = e.currentTarget;

                        const selection = window.getSelection();

                        if (!selection || selection.rangeCount === 0) {
                          return;
                        }

                        const currentText = target.innerText;

                        const selectedText = selection.toString();

                        // Berapa karakter yang akan tersisa setelah selection diganti
                        const remainingLength =
                          currentText.length - selectedText.length;

                        // Kalau sudah mencapai 35 karakter
                        // dan user tidak sedang mengganti/menyeleksi text,
                        // cegah karakter baru masuk.
                        if (remainingLength >= 35 && selection.isCollapsed) {
                          e.preventDefault();
                        }
                      }}
                      onKeyDown={(e) => {
                        // ENTER → buat dot baru
                        if (e.key === "Enter") {
                          e.preventDefault();

                          if (noteLines.length >= 10) {
                            return;
                          }

                          const selection = window.getSelection();

                          if (!selection || selection.rangeCount === 0) {
                            return;
                          }

                          const range = selection.getRangeAt(0);

                          const cursorOffset = range.startOffset;

                          const before = content.slice(0, cursorOffset);
                          const after = content.slice(cursorOffset);

                          const newLines = [...noteLines];

                          newLines[index] = `• ${before}`;
                          newLines.splice(index + 1, 0, `• ${after}`);

                          setNotes(newLines.join("\n"));

                          requestAnimationFrame(() => {
                            const next = mobileNoteRefs.current[index + 1];

                            if (!next) return;

                            next.focus();

                            const range = document.createRange();
                            range.selectNodeContents(next);
                            range.collapse(true);

                            const selection = window.getSelection();

                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          });

                          return;
                        }

                        // BACKSPACE
                        if (e.key === "Backspace") {
                          const selection = window.getSelection();

                          if (!selection || selection.rangeCount === 0) {
                            return;
                          }

                          const range = selection.getRangeAt(0);

                          // Kalau cursor berada di awal line
                          if (range.collapsed && range.startOffset === 0) {
                            // Dot pertama tidak boleh dihapus
                            if (index === 0) {
                              e.preventDefault();
                              return;
                            }

                            // Dot kedua dan seterusnya boleh dihapus
                            e.preventDefault();

                            const previousLine = noteLines[index - 1];
                            const currentContent = content;

                            const newLines = [...noteLines];

                            newLines[index - 1] =
                              `${previousLine}${currentContent}`;

                            newLines.splice(index, 1);

                            setNotes(newLines.join("\n"));

                            requestAnimationFrame(() => {
                              const previous =
                                mobileNoteRefs.current[index - 1];

                              if (!previous) return;

                              previous.focus();

                              const range = document.createRange();
                              range.selectNodeContents(previous);
                              range.collapse(false);

                              const selection = window.getSelection();

                              selection?.removeAllRanges();
                              selection?.addRange(range);
                            });

                            return;
                          }
                        }
                      }}
                      className="
            min-w-0
            flex-1
            outline-none
            break-all
          "
                    >
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
