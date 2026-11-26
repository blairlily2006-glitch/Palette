const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = readFileSync(path.join(root, "index.html"), "utf8");
const homeStart = html.indexOf('<section class="view active" id="view-home">');
const savedStart = html.indexOf('<section class="view" id="view-saved">', homeStart);
const home = html.slice(homeStart, savedStart);

test("home contains photo sampling and the complete recipe workflow", () => {
  for (const id of ["photoPanel", "photo", "sampleMarker", "targetSwatch", "mediumSwitch", "targetLarge", "mixSwatch", "recipeList", "feedbackButtons", "saveRecipe"]) {
    assert.match(home, new RegExp(`id="${id}"`), `${id} should live on the home screen`);
  }
  assert.equal(/id="view-(sample|result)"/.test(html), false, "sampling and recipe must not be separate views");
});

test("photo and palette selection update the recipe without navigating away", () => {
  assert.match(html, /img\.onload=async\(\)=>\{[\s\S]*?sampleAt\(\.5,\.5\);[\s\S]*?navigate\("home"\)/);
  assert.match(html, /#paletteGrid"\)\.onclick=e=>\{[\s\S]*?updateTarget\(chip\.dataset\.paletteColor\)/);
  assert.equal(/#paletteGrid"\)\.onclick=e=>\{[^}]*navigate\(/.test(html), false);
});

test("brand name, app icon, and Chinese line-breaking rules are present", () => {
  assert.match(html, /<title>调色盘/);
  assert.match(html, /<span>调色盘<\/span>/);
  assert.match(html, /rel="icon"[^>]*href="icon\.svg"/);
  assert.ok(existsSync(path.join(root, "icon.svg")), "icon.svg should exist");
  assert.match(html, /word-break:\s*keep-all/);
});

test("mobile shell uses the requested iPhone proportions", () => {
  assert.match(html, /id="app"/);
  assert.match(html, /#app\{[^}]*width:100%[^}]*max-width:430px[^}]*height:100dvh[^}]*overflow:hidden[^}]*position:relative/);
  assert.match(html, /@media\(min-width:481px\)[\s\S]*?#app\{[^}]*width:390px[^}]*height:844px[^}]*border-radius:44px/);
  assert.match(html, /@media\(max-width:480px\)[\s\S]*?#app\{[^}]*border-radius:0[^}]*box-shadow:none/);
  assert.match(html, /body\{[^}]*overflow:hidden/);
  assert.match(html, /main\{[^}]*overflow-y:auto/);
});

test("photo and palette sizing stay compact and proportional", () => {
  assert.match(html, /#app \.home-showcase\.photo-panel\{[^}]*width:92%[^}]*aspect-ratio:3\s*\/\s*4/);
  assert.match(html, /#app \.home-showcase\.photo-panel img\{[^}]*object-fit:cover/);
  assert.match(html, /#app \.palette-panel\{[^}]*padding:10px 12px 12px/);
  assert.match(html, /#app \.palette-grid\{[^}]*gap:8px 7px/);
  assert.match(html, /#app \.palette-chip i\{[^}]*width:40px[^}]*height:40px/);
});
