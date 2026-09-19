import fs from "node:fs/promises";
import path from "node:path";

async function dump() {
  const res = await fetch("https://affiliates.selar.com/explore");
  const html = await res.text();
  await fs.writeFile(
    path.resolve(process.cwd(), "tools/selar-importer/explore.html"),
    html
  );
  console.log("HTML dumped successfully!");
}

dump();