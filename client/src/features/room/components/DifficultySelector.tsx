interface DifficultySelectorProps {
  value: string;
  onChange: (difficulty: string) => void;
}

const difficulties = ["Easy", "Medium", "Hard", "Impossible"];

export default function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Difficulty</h2>

      <div className="grid grid-cols-2 gap-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => onChange(difficulty)}
            className={`rounded-xl border p-3 transition ${
              value === difficulty
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
}