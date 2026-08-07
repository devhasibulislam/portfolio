// Scroll and verify all home sections render. Companion to visual-check.mjs.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([
  { name: "locale", value: "en", url: BASE },
  { name: "theme", value: "dark", url: BASE },
]);
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

// Scroll to bottom in steps to fire every ScrollTrigger
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(300);
}
await page.waitForTimeout(1500);

// Check each section rendered
const sections = await page.$$eval("section[aria-labelledby]", (els) =>
  els.map((el) => ({
    id: el.getAttribute("aria-labelledby"),
    visible: el.getBoundingClientRect().height > 20,
    text: el.querySelector("h1,h2")?.textContent?.trim().slice(0, 60) ?? "",
  })),
);
console.log("Sections rendered:", sections.length);
for (const s of sections) console.log(" -", s.id, `[${s.text}]`);

await page.screenshot({ path: "scripts/.visual-check/desktop_en_home_scrolled.png", fullPage: true });
await browser.close();
