// src/components/HirarkiComponents.jsx
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function Expandable({ title, open = false, onToggle, children }) {
  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-medium">{title}</span>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function ListBlock({ title, items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="font-semibold mb-1">{title}</div>
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function HirarkiComponents({ data = {} }) {
  // Normalize payload
  const payload = data.data && typeof data.data === "object" ? data.data : data;

  const visi = payload.visi || [];
  const misi = payload.misi || [];
  const tujuan_rpjmd = payload.tujuan_rpjmd || payload.tujuan || [];
  const sasaran = payload.sasaran_strategis || payload.sasaran || [];
  const tujuan_pd =
    payload.tujuan_pd ||
    payload.tujuan_perangkat_daerah ||
    payload.tujuanPerangkat ||
    [];

  // 🔥 NEW — Sasaran Perangkat Daerah
  const sasaran_pd =
    payload.sasaran_pd ||
    payload.sasaranPerangkatDaerah ||
    [];

  const [open, setOpen] = React.useState({
    visi: true,
    misi: false,
    tujuan: false,
    sasaran: false,
    tujuan_pd: false,
    sasaran_pd: false, // NEW
  });

  const toggle = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-4">

      <Expandable title="Visi RPJMD" open={open.visi} onToggle={() => toggle("visi")}>
        <ListBlock title="Visi" items={visi} />
      </Expandable>

      <Expandable title="Misi RPJMD" open={open.misi} onToggle={() => toggle("misi")}>
        <ListBlock title="Misi" items={misi} />
      </Expandable>

      <Expandable title="Tujuan RPJMD" open={open.tujuan} onToggle={() => toggle("tujuan")}>
        <ListBlock title="Tujuan" items={tujuan_rpjmd} />
      </Expandable>

      <Expandable title="Sasaran Strategis RPJMD" open={open.sasaran} onToggle={() => toggle("sasaran")}>
        {sasaran.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada sasaran strategis.</div>
        ) : (
          <div className="space-y-3">
            {sasaran.map((s, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-medium">{s.nama || s.title || `Sasaran #${idx + 1}`}</div>
                {s.indikator?.length > 0 ? (
                  <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                    {s.indikator.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">Belum ada indikator.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Expandable>

      <Expandable title="Tujuan Perangkat Daerah" open={open.tujuan_pd} onToggle={() => toggle("tujuan_pd")}>
        {tujuan_pd.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada tujuan perangkat daerah.</div>
        ) : (
          <div className="space-y-3">
            {tujuan_pd.map((t, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-medium">{t.nama || t.title || `Tujuan #${idx + 1}`}</div>
                {t.indikator?.length > 0 ? (
                  <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                    {t.indikator.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">Belum ada indikator.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Expandable>

      {/* 🔥 NEW SECTION — Sasaran Perangkat Daerah */}
      <Expandable
        title="Sasaran Perangkat Daerah"
        open={open.sasaran_pd}
        onToggle={() => toggle("sasaran_pd")}
      >
        {sasaran_pd.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada sasaran perangkat daerah.</div>
        ) : (
          <div className="space-y-3">
            {sasaran_pd.map((s, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="font-medium">{s.nama || `Sasaran PD #${idx + 1}`}</div>
                {s.indikator?.length > 0 ? (
                  <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                    {s.indikator.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">Belum ada indikator.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Expandable>

    </div>
  );
}
