import { test, expect } from "@playwright/test";

test("direkte CSR laster Dekoratøren", async ({ page }) => {
  const envRequest = page.waitForRequest(
    (request) => new URL(request.url()).pathname.endsWith("/env"),
  );
  await page.goto("/csr-uten-moduler");
  const request = await envRequest;
  const origin = new URL(page.url()).origin;
  expect((await request.allHeaders())["origin"]).toBe(origin);
  await expect(page.getByTestId("integration-origin")).toHaveText(origin);
  await expect(page.locator("header")).toBeAttached({ timeout: 15_000 });
  await expect(page.locator("footer")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByTestId("integration-state")).toHaveText(
    "rendret/lastet",
    { timeout: 15_000 },
  );
});
