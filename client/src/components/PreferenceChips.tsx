import { useState } from "react";
import { Check } from "lucide-react";

interface PreferenceChipsProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
}

export default function PreferenceChips({
  label,
  options,
  selectedOptions,
  onChange,
  multiSelect = true,
}: PreferenceChipsProps) {
  const handleToggle = (option: string) => {
    if (multiSelect) {
      if (selectedOptions.includes(option)) {
        onChange(selectedOptions.filter((o) => o !== option));
      } else {
        onChange([...selectedOptions, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <div className="space-y-3" data-testid={`preference-chips-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover-elevate"
              }`}
              data-testid={`chip-${option.toLowerCase().replace(/\s/g, "-")}`}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PreferenceChipsDemo() {
  const [sectors, setSectors] = useState<string[]>(["Fintech"]);
  const [stages, setStages] = useState<string[]>(["Seed"]);
  const [support, setSupport] = useState<string[]>([]);

  return (
    <div className="space-y-6 p-4">
      <PreferenceChips
        label="Investment Sectors"
        options={["Fintech", "Healthcare", "AI/ML", "SaaS", "E-commerce", "Climate Tech", "EdTech", "Web3"]}
        selectedOptions={sectors}
        onChange={setSectors}
      />
      <PreferenceChips
        label="Investment Stage"
        options={["Pre-seed", "Seed", "Series A", "Series B", "Growth"]}
        selectedOptions={stages}
        onChange={setStages}
      />
      <PreferenceChips
        label="Support Type"
        options={["Capital Only", "Advisory", "Hands-on", "Board Seat", "Strategic"]}
        selectedOptions={support}
        onChange={setSupport}
      />
    </div>
  );
}
