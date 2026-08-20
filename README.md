# Bambu Food Garden

Site institucional estático, responsivo e orientado a reservas por WhatsApp.

## Visualização rápida

Abra `index.html` em um navegador. Não há etapa de instalação ou build.

## Desenvolvimento e qualidade

Requer Node.js 24 LTS.

```bash
npm install
npm run check
```

O pipeline inclui Biome, contrato arquitetural, Knip, Vitest com cobertura, build Vite e Playwright em desktop e mobile. O teste de mutação é executado separadamente com `npm run test:mutation` por ser mais demorado.

Consulte `OBSERVABILITY.md` antes de configurar Sentry, Datadog, New Relic ou um collector OpenTelemetry.

## Antes da publicação

- Converta as fotografias para AVIF/WebP antes da publicação para reduzir o peso do carregamento.
- Adicione a URL definitiva em canonical, Open Graph, robots.txt e sitemap.xml.
- Configure uma imagem Open Graph oficial.

## Conteúdo confirmado

Telefone/WhatsApp: (88) 99611-9828  
Endereço: Av. Tab. Edmar Lopes Martins, 207, Planalto, Crateús — CE, 63700-000.

Horário: todos os dias, das 11h à meia-noite.  
Instagram: https://www.instagram.com/bambufoodgarden/
