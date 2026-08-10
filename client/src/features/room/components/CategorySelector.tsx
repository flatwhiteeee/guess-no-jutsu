import { useEffect, useRef, useState } from "react";

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
}

const categories = ["Naruto"];

export default function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (category: string) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e6d9b8]/80 sm:text-xs">
        Category
      </h2>

      <div ref={dropdownRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`
            flex w-full items-center justify-between
            rounded-md
            border border-[#d4c7a6]/35
bg-[#0b1511]/55
shadow-[0_3px_12px_rgba(0,0,0,0.18)]
backdrop-blur-[2px]
            px-4 py-3
            text-left text-sm
            text-[#e6d9b8]
            outline-none
            transition-all duration-200
            hover:border-[#d4c7a6]/55
            hover:bg-slate-950/70
            ${open ? "border-[#d4c7a6]/70 bg-slate-950/75" : ""}
          `}
        >
          <span>{value}</span>

          <span
            className={`
              ml-4 text-sm text-[#e6d9b8]/70
              transition-transform duration-200
              ${open ? "rotate-180" : ""}
            `}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="Category"
            className="
              absolute left-0 right-0 top-full z-50 mt-1
              rounded-md
              overflow-hidden
              border border-[#d4c7a6]/45
bg-[#101b16]/95
shadow-[0_8px_20px_rgba(0,0,0,0.38)]
backdrop-blur-sm
            "
          >
            {categories.map((category) => {
              const selected = category === value;

              return (
                <button
                  key={category}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(category)}
                  className={`
                    flex w-full items-center
                    px-4 py-3
                    text-left text-sm
                    transition-colors duration-150
                    ${
                      selected
                        ? "bg-[#d4c7a6] text-[#172014] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                        : "text-[#e6d9b8] hover:bg-[#d4c7a6]/15"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
