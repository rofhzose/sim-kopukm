interface Props {
  filter: "umkm" | "koperasi";
  setFilter: (f: "umkm" | "koperasi") => void;
}

export default function MapFilter({ filter, setFilter }: Props) {
  return (
    <div className="absolute top-4 left-24 bg-white text-black shadow-md rounded-xl p-3 z-1000">
      <p className="font-semibold mb-2 text-sm">Filter Data</p>
      <div className="flex gap-2">
        {["umkm", "koperasi"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === type
                ? type === "umkm"
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
