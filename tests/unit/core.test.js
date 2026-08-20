import { describe, expect, it } from "vitest";
import * as core from "../../core.js";

describe("BambuCore", () => {
  it("builds a contextual WhatsApp reservation URL", () => {
    const url = core.buildWhatsAppUrl("reserva");
    expect(url).toContain("https://wa.me/5588996119828");
    expect(decodeURIComponent(url)).toContain("fazer uma reserva");
  });

  it("falls back to the contact message for unknown contexts", () => {
    expect(decodeURIComponent(core.buildWhatsAppUrl("unknown"))).toContain("falar com o Bambu");
  });

  it.each([
    [-100, 2000, 1000, 0],
    [500, 2000, 1000, 0.5],
    [5000, 2000, 1000, 1],
  ])("clamps scroll progress", (scrollY, height, viewport, expected) => {
    expect(core.getScrollProgress(scrollY, height, viewport)).toBe(expected);
  });

  it("only transitions same-origin page links", () => {
    const location = new URL("https://bambu.example/index.html");
    const internal = { href: "https://bambu.example/termos.html", target: "", hasAttribute: () => false };
    const external = { href: "https://instagram.com/bambufoodgarden", target: "_blank", hasAttribute: () => false };
    expect(core.isInternalPageLink(internal, location)).toBe(true);
    expect(core.isInternalPageLink(external, location)).toBe(false);
  });
});
