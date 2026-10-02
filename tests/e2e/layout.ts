import { expect, type Page } from "@playwright/test";

export async function expectNoSideScroll(page: Page) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const tooWide = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && (box.right > width + 1 || box.left < -1);
      })
      .slice(0, 5)
      .map((el) => `<${el.tagName.toLowerCase()} class="${el.getAttribute("class") ?? ""}">`);
    return { pageWidth: document.documentElement.scrollWidth, width, tooWide };
  });
  expect(result.pageWidth, `Page scrolls sideways. Elements sticking out: ${result.tooWide.join(", ")}`).toBeLessThanOrEqual(
    result.width,
  );
}

export async function saveScreen(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screens/${name}.png`, fullPage: true });
}
