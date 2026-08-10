import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

import GameNotification from "../components/ui/GameNotification";
import desktopBackground from "../assets/landing-forest-desktop.png";
import mobileBackground from "../assets/landing-forest-mobile.png";

import joinRoomFrameHorizontal from "../assets/join-room-frame-horizontal.png";
import joinRoomFrameVertical from "../assets/join-room-frame-vertical.png";
import joinRoomTitle from "../assets/join-room-title.png";

export default function JoinRoomPage() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    color: "yellow" as "green" | "red" | "yellow" | "blue",
  });

  const playerName = localStorage.getItem("playerName") || "Player";
  const [joining, setJoining] = useState(false);
  useEffect(() => {
    const handleSessionCreated = ({ roomCode, sessionId }: any) => {
      localStorage.setItem(
        "guess-no-jutsu-session",
        JSON.stringify({
          roomCode,
          sessionId,
        }),
      );
    };

    socket.on("session-created", handleSessionCreated);
    socket.on("reconnect-approved", (game) => {
      console.log("RECONNECT DISETUJUI", game);

      navigate("/game", {
        state: {
          game,
        },
      });
    });

    return () => {
      socket.off("session-created", handleSessionCreated);
      socket.off("reconnect-approved");
    };
  }, []);

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

      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        {/* Background */}
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet={mobileBackground} />

          <img
            src={desktopBackground}
            alt=""
            className="h-full w-full object-cover"
          />
        </picture>

        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 bg-slate-950/40" />

        {/* Main */}
        <main className="relative z-20 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <div
            className="
    relative
    h-[330px]
    w-[450px]
    max-w-[calc(100vw-24px)]
    md:h-auto
    md:w-full
    md:max-w-[760px]
  "
          >
            {/* Frame */}
            <picture className="pointer-events-none absolute inset-0">
              <source
                media="(max-width: 767px)"
                srcSet={joinRoomFrameVertical}
              />

              <img
                src={joinRoomFrameHorizontal}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-fill"
              />
            </picture>

            {/* Join Room artwork — terpisah dari flow */}
            <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 translate-y-[-170px] md:translate-y-[-70px]">
              <div className="w-max animate-[joinRoomAppear_700ms_ease-out_forwards] opacity-0">
                <img
                  src={joinRoomTitle}
                  alt="Join Room"
                  className="w-[400px] md:w-[400px]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-12 py-16">
              {/* Spacer untuk mempertahankan layout lama */}
              <div className="mb-8 text-center">
                <img
                  src={joinRoomTitle}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto w-[220px] invisible"
                />
              </div>

              {/* Existing Join Room controls */}
              <div className="mx-auto w-[150px] -translate-y-[200px] space-y-4 md:w-[400px] md:space-y-6 md:translate-y-[-100px]">
                <input
                  type="text"
                  placeholder="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="
  w-full
  md:block
  md:mx-auto
  md:w-[320px]
  border-0
  border-b-2
  border-[#4a3524]/60
  bg-transparent
  px-4
  py-3
  text-center
  font-semibold
  text-xl
  text-base md:text-2xl
  text-[#6b5038]
  placeholder:text-[#4a3524]/60
  outline-none
  transition-all
  focus:border-[#6b4a2f]
focus:shadow-[0_2px_8px_rgba(107,74,47,0.35)]
focus:ring-0
"
                />

                <button
                  disabled={joining || roomCode.length !== 6}
                  onClick={() => {
                    if (joining) return;

                    setJoining(true);

                    socket.off("join-success");
                    socket.off("join-failed");
                    const savedSession = localStorage.getItem(
                      "guess-no-jutsu-session",
                    );

                    let sessionId = null;

                    if (savedSession) {
                      try {
                        const session = JSON.parse(savedSession);

                        if (session.roomCode === roomCode) {
                          sessionId = session.sessionId;
                        }
                      } catch {}
                    }
                    console.log("JOIN ROOM", {
                      roomCode,
                      playerName,
                      sessionId,
                    });
                    socket.emit("join-room", {
                      roomCode,
                      playerName,
                      sessionId,
                    });

                    socket.once("join-success", async (roomCode) => {
                      await new Promise((resolve) => setTimeout(resolve, 500));

                      setJoining(false);

                      navigate("/lobby", {
                        state: {
                          roomCode,
                        },
                      });
                    });

                    socket.once("join-failed", async (message) => {
                      await new Promise((resolve) => setTimeout(resolve, 500));

                      setJoining(false);

                      if (message === "Room tidak ditemukan.") {
                        showNotification(
                          "ROOM TIDAK DITEMUKAN",
                          "Periksa kembali kode room yang kamu masukkan.",
                          "red",
                        );
                      } else if (message === "Room sudah penuh.") {
                        showNotification(
                          "ROOM PENUH",
                          "Silakan cari room lain atau tunggu slot tersedia.",
                          "yellow",
                        );
                      } else {
                        showNotification("GAGAL MASUK", message, "red");
                      }
                    });
                  }}
                  className="
  w-full
  translate-y-[20px]
md:translate-y-0
  rounded-xl
  bg-[#4a3524]/90
  py-3
  font-semibold
  text-[#f1e4c2]
  shadow-[0_3px_8px_rgba(0,0,0,0.22)]
  transition-all
  duration-200
  ease-out
  hover:-translate-y-1
  hover:bg-[#5a4028]
  hover:shadow-[0_6px_14px_rgba(0,0,0,0.32)]
  active:translate-y-0
  active:scale-[0.98]
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                >
                  {joining ? (
                    <span className="inline-flex animate-pulse items-center gap-1">
                      Joining...
                    </span>
                  ) : (
                    "Join Room"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
