import { Star } from "lucide-react";

export function StarRow({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < n ? "fill-current text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
}
