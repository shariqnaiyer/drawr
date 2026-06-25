// Refresh the bundled community-model catalog from the standalone dataset repo.
//   npm run sync:catalog
// Falls back to a sibling checkout (../../gridfinity-model-catalog) if present,
// otherwise fetches the published raw file from GitHub.
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, "../src/catalog/models.json");
const sibling = join(here, "../../../gridfinity-model-catalog/models.json");
const RAW = "https://raw.githubusercontent.com/shariqnaiyer/gridfinity-model-catalog/main/models.json";

async function main() {
  let json;
  if (existsSync(sibling)) {
    json = readFileSync(sibling, "utf8");
    console.log("Synced from sibling checkout.");
  } else {
    const res = await fetch(RAW);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    json = await res.text();
    console.log("Synced from GitHub.");
  }
  const parsed = JSON.parse(json); // validate it's parseable
  writeFileSync(dest, JSON.stringify(parsed, null, 2) + "\n");
  console.log(`Wrote ${parsed.length} models to src/catalog/models.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
