import fs from "fs";
import path from "path";

const src = fs.readFileSync(path.join("lib", "menu-data.ts"), "utf8");
const prices = {};

// Match item objects that include id + price (skip section-level ids)
const itemRe =
  /\{\s*id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]*)"\s*,\s*description:\s*"([^"]*)"\s*,\s*price:\s*([0-9.]+)/g;

let m;
while ((m = itemRe.exec(src))) {
  prices[m[1]] = Number(m[4]);
}

if (Object.keys(prices).length === 0) {
  // Fallback: looser multiline object match
  const looseRe = /id:\s*"([^"]+)"[\s\S]*?name:\s*"[\s\S]*?"[\s\S]*?price:\s*([0-9.]+)/g;
  while ((m = looseRe.exec(src))) {
    // ignore section ids that don't look like item keys with a following name nearby
    if (!m[1].includes("-") && ["espresso", "appetizer", "shake", "tea", "cold", "hot", "cake"].includes(m[1])) {
      continue;
    }
    prices[m[1]] = Number(m[2]);
  }
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  path.join("data", "prices.json"),
  JSON.stringify(prices, null, 2) + "\n"
);
console.log("wrote", Object.keys(prices).length, "prices");
console.log("espresso-single", prices["espresso-single"]);
console.log("sample", Object.entries(prices).slice(0, 5));
