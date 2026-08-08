interface DifficultySelectorProps {
  value: string;
  onChange: (difficulty: string) => void;
}

const difficulties = ["Easy", "Medium", "Hard"];

export default function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Difficulty</h2>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900/60 p-1">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => onChange(difficulty)}
            className={`rounded-lg p-3 font-medium transition-all ${
              value === difficulty
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
}
