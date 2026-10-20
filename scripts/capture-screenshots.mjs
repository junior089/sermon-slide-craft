// Gera as capturas de tela do README a partir do app rodando em modo
// demonstração (sem NIM_API_KEY). Uso: npm run dev e, em outro terminal,
// npm run screenshots [url-base].
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:8080";
const outDir = new URL("../docs/assets/", import.meta.url);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  locale: "pt-BR",
});

async function capture(name, options = {}) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, outDir)), ...options });
  console.log(`docs/assets/${name}.png`);
}

await page.goto(`${baseUrl}/gerar`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Exemplo" }).click();
await capture("formulario");

await page.getByRole("button", { name: "Gerar apresentação" }).click();
await page.getByText("Deck aberto").waitFor({ timeout: 60_000 });
await page.addStyleTag({
  content: "[data-sonner-toaster], header.sticky { display: none !important; }",
});
await page.waitForTimeout(400);
const box = await page.locator(".preview-workbench").boundingBox();
const scrollY = await page.evaluate(() => window.scrollY);
await page.screenshot({
  path: fileURLToPath(new URL("editor.png", outDir)),
  fullPage: true,
  clip: { x: box.x, y: box.y + scrollY, width: box.width, height: Math.min(box.height, 1080) },
});
console.log("docs/assets/editor.png");

await page.getByRole("button", { name: "Apresentar" }).click();
await page.keyboard.press("ArrowRight");
await page.keyboard.press("ArrowRight");
await capture("apresentacao");
await page.keyboard.press("Escape");

await browser.close();
