import { useState } from "react";
import DifficultySelector from "../features/room/components/DifficultySelector";
import CategorySelector from "../features/room/components/CategorySelector";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

export default function CreateRoomPage() {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState("Hard");
  const [category, setCategory] = useState("Naruto");
  const navigate = useNavigate();
  const playerName = localStorage.getItem("playerName") || "Player";
  const [creating, setCreating] = useState(false);
  const handleCreate = () => {
    if (creating) return;

    setCreating(true);

    socket.emit("create-room", {
      playerName,
      category,
      difficulty,
      maxPlayers,
    });
    socket.once("room-created", (roomCode: string) => {
      setCreating(false);

      navigate("/lobby", {
        state: {
          roomCode,
        },
      });
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Create Room</h1>

        <CategorySelector value={category} onChange={setCategory} />

        <DifficultySelector value={difficulty} onChange={setDifficulty} />

        <div>
          <h2 className="mb-3 text-lg font-semibold">Maximum Players</h2>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
              className="rounded-xl bg-slate-700 px-4 py-2"
            >
              -
            </button>

            <span className="text-3xl font-bold">{maxPlayers}</span>

            <button
              onClick={() => setMaxPlayers(Math.min(10, maxPlayers + 1))}
              className="rounded-xl bg-orange-500 px-4 py-2"
            >
              +
            </button>
          </div>
        </div>

        <button
          disabled={creating}
          onClick={handleCreate}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}
