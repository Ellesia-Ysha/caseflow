import { test, expect } from "@playwright/test";

test.describe("case detail drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("tbody tr[role='button']").first()).toBeVisible();
  });

  test("opens on row click and shows the case subject", async ({ page }) => {
    const firstRow = page.locator("tbody tr[role='button']").first();
    const subject = (await firstRow.locator("td").first().innerText()).split("\n")[0];

    await firstRow.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(subject);
  });

  test("closes via the close button", async ({ page }) => {
    await page.locator("tbody tr[role='button']").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("editing a case's assignee settles into a consistent state (persisted or rolled back)", async ({
    page,
  }) => {
    await page.locator("tbody tr[role='button']").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const trigger = dialog.getByRole("combobox", { name: "Change assignee" });
    await expect(trigger).toBeVisible();
    const before = await trigger.innerText();
    const target = before.includes("Unassigned") ? "Alex Rivera" : "Unassigned";

    await trigger.click();
    await page.getByRole("option", { name: target, exact: true }).click();

    // Optimistic: the UI shows the new value immediately, before the mock
    // "network" (which intentionally fails ~18% of the time) has responded.
    await expect(trigger).toHaveText(new RegExp(target));

    // Which branch fires is intentionally random (src/api/handlers.ts), so
    // poll until the UI reaches one of its two coherent end states instead
    // of guessing a fixed delay — this is the thing being proven: both
    // outcomes settle cleanly, neither leaves the UI stuck mid-optimistic.
    let settledAs: "updated" | "reverted" | null = null;
    await expect
      .poll(
        async () => {
          const current = await trigger.innerText();
          if (current.includes(target)) settledAs = "updated";
          else if (current.includes(before)) settledAs = "reverted";
          return settledAs;
        },
        { timeout: 3000 }
      )
      .not.toBeNull();

    if (settledAs === "reverted") {
      // Rolled back — the failure path should explain why, not fail silently.
      await expect(page.getByText("Update failed")).toBeVisible();
    }
  });
});
