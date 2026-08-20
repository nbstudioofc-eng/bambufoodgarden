# Observabilidade

O site possui telemetria própria, captura global de erros, rejeições de promises, carregamento de imagens, abertura da galeria, prontidão da interface e Largest Contentful Paint.

## Estratégia

- **OpenTelemetry:** destino principal e neutro. Configure `otelLogsEndpoint` com a rota OTLP/HTTP JSON `/v1/logs` do seu collector.
- **Sentry:** adaptador ativado quando `sentryDsn` estiver configurado e o SDK `window.Sentry` for carregado pela plataforma.
- **Datadog RUM:** adaptador ativado quando `applicationId`, `clientToken` e o SDK `window.DD_RUM` estiverem disponíveis.
- **New Relic Browser:** adaptador ativado quando o agente da conta disponibilizar `window.newrelic`.

Os quatro fornecedores não devem ser ligados simultaneamente sem uma razão operacional. A recomendação é OpenTelemetry como camada neutra e apenas um fornecedor de experiência/erros. Isso reduz JavaScript, custos, duplicação de eventos e impacto de privacidade.

## Segurança

Não coloque tokens privados no navegador. DSNs e client tokens públicos devem ser limitados por domínio e ambiente nos painéis dos fornecedores. O arquivo `runtime-config.js` vem vazio por padrão e pode ser gerado no deploy a partir do cofre de segredos.

O coletor deve definir CORS apenas para o domínio publicado, aplicar rate limiting e descartar atributos não autorizados. O runtime remove padrões simples de e-mail e telefone antes do envio.

## Privacidade

Ao ativar um fornecedor, revise a Política de Privacidade, a base legal, a retenção, os subprocessadores e a transferência internacional de dados antes de publicar.
