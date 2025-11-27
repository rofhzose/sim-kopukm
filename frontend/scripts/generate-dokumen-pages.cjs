// scripts/generate-dokumen-pages.cjs
const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "../src/pages");
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

const pages = [
  "SOTK","RKA","RENSTRA","RENJA","SOP","LKPJ","DPA","KAK",
  "PERJANJIAN KINERJA","RENCANA AKSI","SPIP","RISK REGISTER",
  "MANAJEMEN RISIKO","CASCADING","LAKIP","LHP","LKE","LPPD",
  "POHON KINERJA","SKM","Pegawai","Jabatan"
];

function toFileName(label) {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  const compName = slug
    .split(/[-_]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("") + "Page";
  const fileName = compName + ".jsx";
  return { compName, fileName, slug };
}

const template = (compName, title) => `import React from "react";

export default function ${compName}() {
  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-3">${title}</h1>
        <p className="text-gray-600">Halaman ${title}. Tambahkan komponen daftar file, upload, dan tindakan lainnya di sini.</p>
      </div>
    </div>
  );
}
`;

console.log("Generating pages into:", pagesDir);
pages.forEach(label => {
  const { compName, fileName } = toFileName(label);
  const content = template(compName, label);
  const dst = path.join(pagesDir, fileName);
  fs.writeFileSync(dst, content, { encoding: "utf8" });
  console.log(" -", fileName);
});

console.log("DONE. Now add imports + routes to App.jsx as instructed.");
n