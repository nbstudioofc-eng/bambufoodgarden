(function initializeObservability() {
  

  const config = window.BAMBU_RUNTIME_CONFIG || {};
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const queue = [];

  function redact(value) {
    if (typeof value !== "string") return value;
    return value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]").replace(/\b\d{10,13}\b/g, "[phone]");
  }

  function record(type, attributes = {}) {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      sessionId,
      release: config.release || "unknown",
      environment: config.environment || "production",
      path: location.pathname,
      attributes: Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, redact(value)])),
    };
    queue.push(event);
    if (queue.length > 50) queue.shift();
    return event;
  }

  function flush() {
    if (!config.otelLogsEndpoint || queue.length === 0) return;
    const records = queue.splice(0).map((event) => ({
      timeUnixNano: `${Date.parse(event.timestamp)}000000`,
      severityText: event.type.includes("error") || event.type.includes("exception") ? "ERROR" : "INFO",
      body: { stringValue: JSON.stringify(event) },
      attributes: [
        { key: "service.name", value: { stringValue: "bambu-food-garden" } },
        { key: "deployment.environment", value: { stringValue: event.environment } },
      ],
    }));
    const payload = JSON.stringify({
      resourceLogs: [{
        resource: { attributes: [{ key: "service.name", value: { stringValue: "bambu-food-garden" } }] },
        scopeLogs: [{ scope: { name: "bambu.web" }, logRecords: records }],
      }],
    });
    navigator.sendBeacon?.(config.otelLogsEndpoint, new Blob([payload], { type: "application/json" }));
  }

  function initializeVendorAdapters() {
    if (config.sentryDsn && window.Sentry?.init) {
      window.Sentry.init({ dsn: config.sentryDsn, environment: config.environment, release: config.release, tracesSampleRate: config.sampleRate });
      record("provider_ready", { provider: "sentry" });
    }
    if (config.datadog?.applicationId && config.datadog?.clientToken && window.DD_RUM?.init) {
      window.DD_RUM.init({
        applicationId: config.datadog.applicationId,
        clientToken: config.datadog.clientToken,
        site: config.datadog.site,
        service: "bambu-food-garden",
        env: config.environment,
        sessionSampleRate: config.sampleRate * 100,
        sessionReplaySampleRate: 0,
        trackUserInteractions: true,
      });
      record("provider_ready", { provider: "datadog" });
    }
    if (config.newRelic?.applicationId && window.newrelic?.setCustomAttribute) {
      window.newrelic.setCustomAttribute("applicationId", config.newRelic.applicationId);
      window.newrelic.setCustomAttribute("release", config.release);
      record("provider_ready", { provider: "newrelic" });
    }
  }

  window.addEventListener("error", (event) => record("exception", { message: event.message, source: event.filename }));
  window.addEventListener("unhandledrejection", (event) => record("unhandled_rejection", { message: String(event.reason) }));
  window.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          record("web_vital", { name: entry.name, value: String(Math.round(entry.startTime || entry.duration)) });
        });
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      record("telemetry_unavailable", { feature: "largest-contentful-paint" });
    }
  }

  window.BambuTelemetry = Object.freeze({ record, flush, getQueue: () => [...queue] });
  initializeVendorAdapters();
  record("page_view", { title: document.title });
})();
