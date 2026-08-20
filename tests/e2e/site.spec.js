import { expect, test } from "@playwright/test";

test("loads the experience and completes its loading state", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-loader]")).toHaveClass(/is-complete/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bambu");
  await expect(page.locator(".hero-photo")).toBeVisible();
});

test("opens and closes the gallery lightbox", async ({ page }) => {
  await page.goto("/");
  await page.locator(".gallery-item").first().click();
  await expect(page.locator(".lightbox")).toHaveAttribute("open", "");
  await page.locator(".lightbox-close").click();
  await expect(page.locator(".lightbox")).not.toHaveAttribute("open", "");
});

test("mobile navigation exposes primary destinations", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only behavior");
  await page.goto("/");
  await page.locator(".menu-toggle").click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await expect(page.locator("#mobile-menu").getByText("Abrir cardápio")).toBeVisible();
});

test("reduced-motion users receive final states without transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".reveal").first()).toHaveCSS("transform", "none");
});
