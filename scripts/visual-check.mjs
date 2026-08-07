// Quick visual smoke test: cross-locale, cross-viewport screenshots of /.
// Not part of the test suite; run with `node scripts/visual-check.mjs`.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "scripts/.visual-check";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const LOCALES = [
  { code: "en", dir: "ltr" },
  { code: "bn", dir: "ltr" },
  { code: "ar", dir: "rtl" },
];

const ROUTES = ["/", "/experience", "/projects", "/skills", "/blog", "/resume"];

const errors = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const loc of LOCALES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    await ctx.addCookies([
      { name: "locale", value: loc.code, url: BASE },
      { name: "theme", value: "dark", url: BASE },
    ]);
    const page = await ctx.newPage();
    page.on("pageerror", (e) =>
      errors.push(`${vp.name}/${loc.code} pageerror: ${e.message}`),
    );
    page.on("console", (msg) => {
      if (msg.type() === "error")
        errors.push(`${vp.name}/${loc.code} console: ${msg.text()}`);
    });

    for (const route of ROUTES) {
      try {
        const resp = await page.goto(`${BASE}${route}`, {
          waitUntil: "networkidle",
          timeout: 25000,
        });
        const status = resp?.status() ?? 0;
        const htmlDir = await page.evaluate(
          () => document.documentElement.getAttribute("dir") ?? "",
        );
        const htmlLang = await page.evaluate(
          () => document.documentElement.getAttribute("lang") ?? "",
        );
        const slug =
          route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "");
        const file = `${OUT}/${vp.name}_${loc.code}_${slug}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(
          `[ok ${status}] ${vp.name} ${loc.code} ${route} lang=${htmlLang} dir=${htmlDir} → ${file}`,
        );
        if (loc.dir === "rtl" && htmlDir !== "rtl") {
          errors.push(
            `${vp.name}/${loc.code} ${route}: expected dir=rtl, got '${htmlDir}'`,
          );
        }
      } catch (e) {
        errors.push(`${vp.name}/${loc.code} ${route}: ${e.message}`);
        console.log(`[FAIL] ${vp.name} ${loc.code} ${route}: ${e.message}`);
      }
    }
    await ctx.close();
  }
}

await browser.close();

if (errors.length) {
  console.log("\n=== ERRORS ===");
  for (const e of errors) console.log(e);
  process.exit(1);
}
console.log("\n=== ALL CLEAN ===");
