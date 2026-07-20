import { chromium } from "file:///C:/Users/Whaifan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1698, height: 986 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:5173/#advantages", { waitUntil: "networkidle" });
await page.locator("#advantages").scrollIntoViewIfNeeded();
await page.waitForTimeout(1400);

const metrics = await page.evaluate(() => ({
  cardCount: document.querySelectorAll(".magic-bento-card").length,
  outcomesCount: document.querySelectorAll(".outcomes-section").length,
  sectionOrder: Array.from(document.querySelectorAll("main > section[id]"), (section) => section.id),
  navOrder: Array.from(document.querySelectorAll(".desktop-nav a"), (anchor) => anchor.getAttribute("href")),
  advantagesRect: (() => {
    const rect = document.querySelector("#advantages").getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  })(),
  cards: Array.from(document.querySelectorAll(".magic-bento-card"), (card) => {
    const rect = card.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height), text: card.innerText };
  }),
}));

await page.screenshot({ path: "qa/magic-bento-1698x986.png", fullPage: false });
const firstCard = page.locator(".magic-bento-card").first();
const firstCardBox = await firstCard.boundingBox();
await page.mouse.move(firstCardBox.x + firstCardBox.width * 0.58, firstCardBox.y + firstCardBox.height * 0.45);
await page.waitForTimeout(900);
const interaction = await page.evaluate(() => {
  const card = document.querySelector(".magic-bento-card");
  return {
    glowIntensity: getComputedStyle(card).getPropertyValue("--glow-intensity").trim(),
    particleCount: card.querySelectorAll(".magic-bento-particle").length,
    transform: getComputedStyle(card).transform,
  };
});
await page.screenshot({ path: "qa/magic-bento-hover-1698x986.png", fullPage: false });
console.log(JSON.stringify({ ...metrics, interaction }, null, 2));
await browser.close();
