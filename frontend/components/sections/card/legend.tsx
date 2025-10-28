import { LegendProps } from "recharts";

function MyLegend({ payload }: LegendProps) {
  if (!payload) return null;

  // Ambil tipe item di dalam payload (bisa undefined, makanya NonNullable)
  type LegendEntry = NonNullable<LegendProps["payload"]>[number];

  return (
    <ul className="flex gap-4 justify-center">
      {payload.map((entry: LegendEntry, i: number) => (
        <li key={i} className="flex items-center gap-2 text-sm">
          <span
            style={{
              width: 12,
              height: 12,
              background: (entry && entry.color) ?? "#ccc",
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          <span>{entry?.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default MyLegend;
