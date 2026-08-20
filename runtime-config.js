// Configure somente no ambiente publicado. Nunca coloque chaves secretas neste arquivo.
window.BAMBU_RUNTIME_CONFIG = Object.freeze({
  environment: "production",
  release: "bambu-food-garden@1.0.0",
  otelLogsEndpoint: "",
  sentryDsn: "",
  datadog: { applicationId: "", clientToken: "", site: "datadoghq.com" },
  newRelic: { applicationId: "", accountId: "" },
  sampleRate: 0.1,
});
