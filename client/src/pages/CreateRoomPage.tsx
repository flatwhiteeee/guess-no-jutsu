import { useEffect, useState } from "react";
import DifficultySelector from "../features/room/components/DifficultySelector";
import CategorySelector from "../features/room/components/CategorySelector";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";
import desktopBackground from "../assets/landing-forest-desktop.png";
import mobileBackground from "../assets/landing-forest-mobile.png";
import createRoomFrameHorizontal from "../assets/create-room-frame-horizontal.png";
import createRoomFrameVertical from "../assets/create-room-frame-vertical.png";
import createRoomTitle from "../assets/create-room-title.png";

export default function CreateRoomPage() {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState("Hard");
  const [category, setCategory] = useState("Naruto");
  const navigate = useNavigate();
  const playerName = localStorage.getItem("playerName") || "Player";
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const handleSessionCreated = ({ roomCode, sessionId }: any) => {
      console.log("SESSION CREATED", {
        roomCode,
        sessionId,
      });

      localStorage.setItem(
        "guess-no-jutsu-session",
        JSON.stringify({
          roomCode,
          sessionId,
        }),
      );
    };

    socket.on("session-created", handleSessionCreated);

    return () => {
      socket.off("session-created", handleSessionCreated);
    };
  }, []);

  const handleCreate = () => {
    console.log("HANDLE CREATE DIPANGGIL");

    if (creating) return;

    setCreating(true);

    console.log("EMIT CREATE");

    socket.emit("create-room", {
      playerName,
      category,
      difficulty,
      maxPlayers,
    });

    socket.once("room-created", (roomCode) => {
      console.log("ROOM CREATED", roomCode);

      setCreating(false);

      navigate("/lobby", {
        state: { roomCode },
      });
    });
  };

  return (
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
    w-full
    max-w-[560px]
    aspect-[430/932]
    md:aspect-auto
    md:h-[500px]
  "
        >
          {/* Decorative frame */}
          <picture className="pointer-events-none absolute inset-0 overflow-visible">
            <source
              media="(max-width: 767px)"
              srcSet={createRoomFrameVertical}
            />

            <img
              src={createRoomFrameHorizontal}
              alt=""
              aria-hidden="true"
              className="
    absolute
    left-1/2
    top-1/2
    w-[500px] md:w-[800px]
    max-w-none
    -translate-x-1/2
    -translate-y-1/2
  "
            />
          </picture>

          {/* Content */}
          <div
            className="
    absolute
    inset-0
    z-10
    flex
    items-center
    justify-center
    px-8
    -translate-y-[100px]
    md:-translate-y-[113px]
  "
          >
            <div className="flex w-full flex-col items-center">
              {/* Create Room Title */}
              <img
                src={createRoomTitle}
                alt="Create Room"
                className="
    mb-6
    w-[240px]
    sm:w-[280px]
    md:w-[300px]
    translate-y-[15px]
    md:translate-y-[40px]
  "
              />

              {/* Existing form */}
              <div
                className="
        mx-auto
        w-full
        max-w-[230px]
        space-y-8 md:space-y-5
        sm:max-w-[340px]
        md:max-w-[440px]
      "
              >
                <div className="mx-auto md:w-[480px] md:-translate-x-[23px]">
                  <CategorySelector value={category} onChange={setCategory} />
                </div>

                <div className="mx-auto md:w-[480px] md:-translate-x-[23px]">
                  <DifficultySelector
                    value={difficulty}
                    onChange={setDifficulty}
                  />
                </div>

                <div>
                  <h2 className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e6d9b8]/80 sm:text-xs">
                    Maximum Players
                  </h2>

                  <div className="flex items-center justify-center gap-5">
                    <button
                      onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                      className="
  flex h-8 w-8 items-center justify-center
  rounded-sm
  border border-[#e6d9b8]/70
  bg-[#d4c7a6]/95
  text-base font-medium
  text-[#172014]
  shadow-[0_2px_5px_rgba(0,0,0,0.22)]
  transition-all duration-150 ease-out
  hover:bg-[#e6d9b8]
  hover:border-[#f0e5c9]
  hover:shadow-[0_3px_8px_rgba(0,0,0,0.3)]
  hover:-translate-y-px
  active:translate-y-0
  active:scale-95
  focus-visible:outline-none
  focus-visible:ring-1
  focus-visible:ring-[#e6d9b8]/70
"
                      aria-label="Decrease maximum players"
                    >
                      −
                    </button>

                    <span className="min-w-8 text-center text-2xl font-semibold leading-none tracking-wide text-[#e6d9b8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                      {maxPlayers}
                    </span>

                    <button
                      onClick={() =>
                        setMaxPlayers(Math.min(10, maxPlayers + 1))
                      }
                      className="
  flex h-8 w-8 items-center justify-center
  rounded-sm
  border border-[#e6d9b8]/70
  bg-[#d4c7a6]/95
  text-base font-medium
  text-[#172014]
  shadow-[0_2px_5px_rgba(0,0,0,0.22)]
  transition-all duration-150 ease-out
  hover:bg-[#e6d9b8]
  hover:border-[#f0e5c9]
  hover:shadow-[0_3px_8px_rgba(0,0,0,0.3)]
  hover:-translate-y-px
  active:translate-y-0
  active:scale-95
  focus-visible:outline-none
  focus-visible:ring-1
  focus-visible:ring-[#e6d9b8]/70
"
                      aria-label="Increase maximum players"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  disabled={creating}
                  onClick={handleCreate}
                  className="
  w-full
  rounded-sm
  border border-[#e6d9b8]/80
  bg-[#d4c7a6]
  py-3
  text-[11px]
  font-semibold
  uppercase
  tracking-[0.22em]
  text-[#172014]
  shadow-[0_3px_10px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]
  transition-all
  duration-200
  ease-out
  hover:-translate-y-px
  hover:bg-[#e0d4b5]
  hover:border-[#f0e5c9]
  hover:shadow-[0_5px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
  active:translate-y-0
  active:scale-[0.99]
  active:shadow-[0_2px_7px_rgba(0,0,0,0.22)]
  focus-visible:outline-none
  focus-visible:ring-1
  focus-visible:ring-[#e6d9b8]/80
  disabled:cursor-not-allowed
  disabled:opacity-50
"
                >
                  {creating ? "Creating..." : "Create Room"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
