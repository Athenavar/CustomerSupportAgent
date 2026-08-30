import {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Camera,
  Refrigerator,
  Gamepad2,
  Router,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Camera,
  Refrigerator,
  Gamepad2,
  Router,
};

const CATEGORIES = [
  { label: "Phones", icon: "Smartphone", example: "My Samsung Galaxy S24 is overheating" },
  { label: "Laptops", icon: "Laptop", example: "My Dell Inspiron 15 won't turn on" },
  { label: "TVs", icon: "Tv", example: "My Sony Bravia TV has no sound" },
  { label: "Audio", icon: "Headphones", example: "My AirPods won't connect" },
  { label: "Cameras", icon: "Camera", example: "My Canon camera shows an error" },
  { label: "Appliances", icon: "Refrigerator", example: "My LG refrigerator isn't cooling" },
  { label: "Gaming", icon: "Gamepad2", example: "My PlayStation 5 keeps crashing" },
  { label: "Networking", icon: "Router", example: "My Wi-Fi router keeps disconnecting" },
];

export default function SuggestedProducts({
  onPick,
}: {
  onPick: (example: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {CATEGORIES.map((cat) => {
        const Icon = ICONS[cat.icon];
        return (
          <button
            key={cat.label}
            onClick={() => onPick(cat.example)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-3 py-4 text-center transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <Icon size={18} className="text-accent" />
            <span className="text-xs font-medium text-ink">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
