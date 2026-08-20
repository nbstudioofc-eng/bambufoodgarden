import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const document = new JSDOM(html).window.document;

describe("site document", () => {
  it("has one semantic heading and a skip link", () => {
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector(".skip-link")?.getAttribute("href")).toBe("#conteudo");
  });

  it("keeps every content image descriptive", () => {
    const images = [...document.querySelectorAll("main img")];
    expect(images.length).toBeGreaterThan(5);
    expect(images.every((image) => image.hasAttribute("alt"))).toBe(true);
  });

  it("exposes privacy, terms, Instagram and contextual WhatsApp actions", () => {
    expect(document.querySelector('a[href="privacidade.html"]')).not.toBeNull();
    expect(document.querySelector('a[href="termos.html"]')).not.toBeNull();
    expect(document.querySelector('a[href*="instagram.com/bambufoodgarden"]')).not.toBeNull();
    expect(document.querySelectorAll("[data-whatsapp]").length).toBeGreaterThanOrEqual(5);
  });
});
