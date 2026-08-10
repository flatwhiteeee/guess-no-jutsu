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
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e6d9b8]/80 sm:text-xs">
        Difficulty
      </h2>

      <div className="grid grid-cols-3 rounded-md border border-[#d4c7a6]/35 bg-[#0b1511]/55 p-1 shadow-[0_3px_12px_rgba(0,0,0,0.18)] backdrop-blur-[2px]">
        {difficulties.map((difficulty) => {
          const isActive = value === difficulty;

          return (
            <button
              key={difficulty}
              type="button"
              onClick={() => onChange(difficulty)}
              className={`py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                isActive
                  ? "border border-[#e6d9b8]/75 bg-[#d4c7a6] text-[#172014] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_4px_rgba(0,0,0,0.18)]"
                  : "border border-transparent text-[#e6d9b8]/70 hover:border-[#d4c7a6]/25 hover:bg-[#d4c7a6]/8 hover:text-[#e6d9b8]"
              }`}
            >
              {difficulty}
            </button>
          );
        })}
      </div>
    </div>
  );
}
