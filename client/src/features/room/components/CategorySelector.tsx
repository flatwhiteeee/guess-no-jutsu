interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
}

export default function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Category</h2>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white"
      >
        <option value="Naruto">Naruto</option>
      </select>
    </div>
  );
}