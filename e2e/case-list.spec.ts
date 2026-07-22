import { test, expect } from "@playwright/test";

test.describe("case list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait past the initial skeleton for real rows to mount.
    await expect(page.locator("tbody tr[role='button']").first()).toBeVisible();
  });

  test("loads and shows cases in the table", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Subject" })).toBeVisible();
    const rows = page.locator("tbody tr[role='button']");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("searching filters the table and the URL reflects the query", async ({ page }) => {
    const search = page.getByRole("textbox", { name: "Search cases" });
    const firstRowBefore = await page.locator("tbody tr[role='button']").first().innerText();

    // A search term unlikely to match everything currently on screen.
    await search.fill("zzz-no-such-case-zzz");

    // Debounced (300ms) — give it room, then assert the URL actually updated.
    await expect(page).toHaveURL(/q=zzz-no-such-case-zzz/, { timeout: 2000 });
    await expect(page.getByText("No cases match your filters.")).toBeVisible();

    await search.fill("");
    await expect(page).not.toHaveURL(/q=/, { timeout: 2000 });
    await expect(page.locator("tbody tr[role='button']").first()).toBeVisible();
    // Sanity check we're back to a real result set, not just an empty query string.
    expect(await page.locator("tbody tr[role='button']").first().innerText()).toBeTruthy();
    void firstRowBefore;
  });

  test("changing the status filter updates the URL and survives a reload", async ({ page }) => {
    await page.getByRole("combobox", { name: "Filter by status" }).click();
    await page.getByRole("option", { name: "Closed" }).click();

    await expect(page).toHaveURL(/status=closed/);

    await page.reload();
    await expect(page.locator("tbody tr[role='button']").first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Filter by status" })).toHaveText(/Closed/);
  });

  test("clicking a sortable column header toggles sort direction", async ({ page }) => {
    const header = page.getByRole("columnheader", { name: "Subject" });

    await header.click();
    await expect(page).toHaveURL(/sortBy=subject/);
    const firstDir = await header.getAttribute("aria-sort");

    await header.click();
    const secondDir = await header.getAttribute("aria-sort");

    expect(firstDir).not.toBe(secondDir);
  });
});
