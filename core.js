const messages = Object.freeze({
  reserva: "Olá! Gostaria de fazer uma reserva no Bambu Food Garden.",
  evento: "Olá! Gostaria de saber mais sobre eventos no Bambu Food Garden.",
  contato: "Olá! Gostaria de falar com o Bambu Food Garden.",
});

function buildWhatsAppUrl(context, phone = "5588996119828") {
  const message = messages[context] || messages.contato;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function getScrollProgress(scrollY, scrollHeight, viewportHeight) {
  const available = Math.max(scrollHeight - viewportHeight, 1);
  return Math.min(1, Math.max(0, scrollY / available));
}

function isInternalPageLink(anchor, location) {
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, location.href);
  return url.origin === location.origin && url.pathname !== location.pathname && !url.hash;
}

export { buildWhatsAppUrl, getScrollProgress, isInternalPageLink, messages };
