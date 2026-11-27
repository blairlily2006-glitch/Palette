const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = readFileSync(path.join(root, "index.html"), "utf8");
const css = readFileSync(path.join(root, "app.css"), "utf8");

test("app uses a fixed 393 by 852 mobile canvas with no page scrolling", () => {
  assert.match(css, /#app\s*\{[^}]*width:\s*393px[^}]*height:\s*852px/s);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?#app\s*\{[^}]*width:\s*100vw[^}]*height:\s*100dvh/s);
  assert.match(css, /body\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /main\s*\{[^}]*overflow:\s*hidden/s);
});

test("sampling and recipe remain together on the home screen", () => {
  for (const id of ["splashScreen", "photoPanel", "photo", "sampleMarker", "sampleReadout", "mediumSwitch", "recipeList", "saveRecipe", "view-saved", "view-pigments"]) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} should be present`);
  }
  assert.equal(/id="view-(sample|result)"/.test(html), false);
  assert.match(html, /class="[^"]*home-recipe[^"]*"[^>]*id="recipePanel"/);
  assert.match(html, /setTimeout\(\(\)=>\$\("#splashScreen"\)\.classList\.add\("is-hidden"\),1800\)/);
});

test("recipe is a four-item two-by-two grid and has no photo palette overlay", () => {
  assert.match(html, /id="recipeList"/);
  assert.match(css, /\.recipe-box\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s);
  assert.match(css, /\.recipe-box:empty\s*\{\s*display:\s*none/s);
  assert.match(css, /\.photo-panel\.has-image \.photo-placeholder\s*\{\s*display:\s*none/s);
  assert.match(html, /slice\(0,\s*4\)/);
  assert.doesNotMatch(html, /id="homePalette"|class="palette-panel"/);
});

test("all three bottom tabs are icon-only and switch views", () => {
  const nav = html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.equal((nav.match(/data-view=/g) ?? []).length, 3);
  assert.match(nav, /aria-label="取色页"/);
  assert.match(nav, /aria-label="配色记录"/);
  assert.match(nav, /aria-label="我的颜料"/);
  assert.doesNotMatch(nav, />\s*(首页|记录|颜料)\s*</);
  assert.match(html, /\$\$\("\.bottom-nav \[data-view\]"\)\.forEach\(button=>button\.onclick=\(\)=>navigate\(button\.dataset\.view\)\)/);
});

test("photo sampling, medium switching, saving, and pigment management remain wired", () => {
  assert.match(html, /image\.onload=async\(\)=>\{[\s\S]*?sampleAt\(state\.sample\.x,state\.sample\.y\);[\s\S]*?navigate\("home"\)/);
  assert.match(html, /\$\("#photoPanel"\)\.onclick=event=>/);
  assert.match(html, /pointerdown/);
  assert.match(html, /pointermove/);
  assert.match(html, /\$\("#mediumSwitch"\)\.onclick=event=>/);
  assert.match(html, /#saveRecipe"\)\.onclick=/);
  assert.match(html, /#pigmentList"\)\.onchange=/);
  assert.match(html, /#searchPigments"\)\.oninput=renderPigments/);
  assert.match(html, /#pigmentForm"\)\.onsubmit=/);
});

test("photo remains visible even when palette extraction fails", () => {
  assert.match(html, /image\.onload=async\(\)=>\{[\s\S]*?\$\("#photoPanel"\)\.classList\.add\("has-image"\)[\s\S]*?try\{[\s\S]*?extractPalette\(image\)[\s\S]*?finally\{setTimeout\(\(\)=>setLoading\(false\),250\)\}/);
  assert.match(css, /\.photo-panel\.has-image img\s*\{\s*display:\s*block/);
  assert.match(html, /if\(!state\.photoUrl\)\{\$\("#fileInput"\)\.click\(\);return\}/);
  assert.match(html, /image\.src=state\.photoUrl;event\.target\.value=""/);
  assert.match(html, /\$\("#photoPlaceholder"\)\.hidden=true/);
  assert.match(css, /\.photo-placeholder\[hidden\]\s*\{\s*display:\s*none\s*\}/);
});

test("top actions and bottom navigation use the prototype icon shapes", () => {
  const topActions = html.match(/<div class="top-actions"[\s\S]*?<\/div>/)?.[0] ?? "";
  assert.match(topActions, /id="saveRecipe"[^>]*aria-label="保存配方"[\s\S]*?<svg[\s\S]*?<\/svg>/);
  assert.doesNotMatch(topActions, /▣/);
  assert.match(html, /function navigate\(view\)\{[\s\S]*?\$\("\.top-actions"\)\.classList\.toggle\("is-hidden",view!=="home"\)/);
  assert.match(css, /\.top-actions\.is-hidden\s*\{\s*display:\s*none/);
  const nav = html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.equal((nav.match(/<svg/g) ?? []).length, 3);
  assert.match(nav, /viewBox="0 0 24 24"/);
  assert.doesNotMatch(nav, /nav-icon nav-/);
  assert.match(nav, /class="nav-pigments"/);
  assert.match(css, /\.nav-pigments\s*\{[^}]*stroke-dasharray/);
  assert.match(css, /\.active \.nav-pigments\s*\{[^}]*stroke-dasharray:\s*none/);
  assert.match(html, /id="addPigment"[^>]*aria-label="添加自定义颜料"[\s\S]*?<svg[\s\S]*?<\/svg>/);
});

test("splash is shown on launch and remains visible for about 1.5 seconds", () => {
  assert.match(html, /<div class="splash-screen" id="splashScreen"/);
  assert.match(html, /setTimeout\(\(\)=>\$\("#splashScreen"\)\.classList\.add\("is-hidden"\),1800\)/);
  assert.match(css, /\.splash-screen\.is-hidden\s*\{\s*opacity:\s*0;\s*visibility:\s*hidden/s);
});

test("recipe content is vertically centered within a roomy panel", () => {
  assert.match(css, /\.recipe-box\s*\{[^}]*min-height:\s*104px/s);
  assert.match(css, /\.recipe-box\s*\{[^}]*align-content:\s*center/s);
  assert.match(css, /\.recipe-row\s*\{[^}]*align-self:\s*center/s);
});

test("initial checked pigments match the prototype", () => {
  assert.match(html, /丙烯:\["ultra","lemon","sap"\]/);
});

test("brand, mascot asset, and Chinese line-breaking rule are preserved", () => {
  assert.match(html, /<title>Palette<\/title>/);
  assert.match(html, /src="assets\/palette-mascot\.png"/);
  assert.match(html, /rel="icon"[^>]*href="assets\/palette-mascot\.png"/);
  assert.ok(existsSync(path.join(root, "assets", "palette-mascot.png")));
  assert.match(css, /word-break:\s*keep-all/);
});

test("photo canvas keeps portrait cropping and prototype colors", () => {
  assert.match(css, /\.home-showcase\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(css, /\.photo-panel img\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /#fffcfb/i);
  assert.match(css, /#eef9ff/i);
  assert.match(css, /#cfe2ea/i);
});
