import { test, expect } from "@playwright/test";

const teamName = "nav-dekoratoren-status-csr.navno";

test("CSR med moduler laster Dekoratøren", async ({ page }) => {
  const csrRequest = page.waitForRequest(
    (request) => new URL(request.url()).pathname.endsWith("/csr"),
  );
  await page.goto("/csr-med-moduler");
  const request = await csrRequest;
  expect(new URL(request.url()).searchParams.get("teamName")).toBe(teamName);
  await expect(page.locator("header")).toBeAttached({ timeout: 15_000 });
  await expect(page.locator("footer")).toBeAttached({ timeout: 15_000 });
  await expect(page.getByTestId("integration-team-name")).toHaveText(teamName);
  await expect(page.getByTestId("integration-state")).toHaveText(
    "rendret/lastet",
    { timeout: 15_000 },
  );
});
