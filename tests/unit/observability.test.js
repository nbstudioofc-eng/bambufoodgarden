import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function loadTelemetry(config = {}) {
  const listeners = {};
  const sendBeacon = vi.fn(() => true);
  const window = {
    BAMBU_RUNTIME_CONFIG: { environment: "test", release: "test@1", ...config },
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const sandbox = {
    Blob,
    console,
    crypto: { randomUUID: () => "session-1" },
    Date,
    document: { title: "Bambu", visibilityState: "visible" },
    JSON,
    location: { pathname: "/index.html" },
    navigator: { sendBeacon },
    Object,
    String,
    window,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(readFileSync(resolve(process.cwd(), "observability.js"), "utf8"), sandbox);
  return { telemetry: window.BambuTelemetry, sendBeacon, listeners };
}

describe("observability", () => {
  it("records events and redacts common contact data", () => {
    const { telemetry } = loadTelemetry();
    const event = telemetry.record("contact", { value: "cliente@example.com 5588996119828" });
    expect(event.attributes.value).toBe("[email] [phone]");
  });

  it("exports queued events as OTLP JSON when configured", () => {
    const { telemetry, sendBeacon } = loadTelemetry({ otelLogsEndpoint: "https://collector.example/v1/logs" });
    telemetry.record("test_event", { result: "ok" });
    telemetry.flush();
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon.mock.calls[0][0]).toBe("https://collector.example/v1/logs");
  });
});
