const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = readFileSync(path.join(root, "index.html"), "utf8");
const css = readFileSync(path.join(root, "app.css"), "utf8");
const source = `${html}\n${css}`;
const homeStart = html.indexOf('<section class="view active" id="view-home">');
const savedStart = html.indexOf('<section class="view" id="view-saved">', homeStart);
const home = html.slice(homeStart, savedStart);

test("Figma frames map to a splash, three tabs, and an inline recipe", () => {
  for (const id of ["splashScreen", "photoPanel", "photo", "sampleMarker", "mediumSwitch", "recipeList", "feedbackButtons", "saveRecipe", "view-saved", "view-pigments"]) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} should be present`);
  }
  assert.equal(/id="view-(sample|result)"/.test(html), false, "photo sampling and recipe stay on one page");
  assert.match(html, /class="[^"]*home-recipe[^"]*"[^>]*id="recipePanel"/);
  assert.match(html, /setTimeout\(\(\)=>\$\("#splashScreen"\)\.classList\.add\("is-hidden"\),1500\)/);
});

test("photo, sample, medium, and feedback stay connected to live recipe updates", () => {
  assert.match(html, /img\.onload=async\(\)=>\{[\s\S]*?sampleAt\(\.5,\.5\);[\s\S]*?navigate\("home"\)/);
  assert.match(html, /#photoPanel"\)\.onclick=e=>/);
  assert.match(html, /#mediumSwitch"\)\.onclick=e=>/);
  assert.match(html, /#feedbackButtons"\)\.onclick=e=>/);
  assert.match(html, /#paletteGrid"\)\.onclick=e=>\{[\s\S]*?updateTarget\(chip\.dataset\.paletteColor\)/);
});

test("clearing a photo lets the sampling marker appear on the next upload", () => {
  assert.match(html, /\$\("#photoPanel"\)\.classList\.remove\("has-image"\)/);
  assert.doesNotMatch(html, /\$\("#sampleMarker"\)\.style\.display="none"/);
});

test("Figma brand, mascot asset, and Chinese line-breaking rule are used", () => {
  assert.match(html, /<title>Palette<\/title>/);
  assert.match(html, /<meta name="theme-color" content="#EEF9FF">/i);
  assert.match(html, /<span class="brand-name">Palette<\/span>/);
  assert.match(html, /src="assets\/palette-mascot\.png"/);
  assert.match(html, /rel="icon"[^>]*href="assets\/palette-mascot\.png"/);
  assert.ok(existsSync(path.join(root, "assets", "palette-mascot.png")), "Figma mascot asset should exist");
  assert.match(css, /word-break:\s*keep-all/);
  assert.match(html, /--bg-top:\s*#eef9ff/i);
});

test("mobile shell uses a 302 by 652 frame and scales proportionally", () => {
  assert.match(html, /id="app"/);
  assert.match(css, /@media\(max-width:480px\)\{[^}]*#app\{[^}]*width:min\(100vw,calc\(100dvh\s*\*\s*302\s*\/\s*652\)\)[^}]*aspect-ratio:302\s*\/\s*652/);
  assert.match(css, /#app\{[^}]*overflow:hidden[^}]*position:relative/);
  assert.match(css, /body\{[^}]*overflow:hidden/);
  assert.match(css, /main\{[^}]*overflow-y:auto/);
});

test("sampling canvas follows the Figma rounded portrait proportion", () => {
  assert.match(css, /\.photo-panel\{[^}]*aspect-ratio:3\s*\/\s*4/);
  assert.match(css, /\.photo-panel img\{[^}]*object-fit:cover/);
  assert.match(css, /\.recipe-panel\{/);
  assert.match(css, /#fffbfb/i);
  assert.match(css, /#edfaff/i);
});
