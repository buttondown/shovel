server-dev:
  bun dev | pino-pretty

server-playwright:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true DISABLE_ICONHORSE=true bun playwright

install:
  bun i
  bunx playwright install

test *args:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true DISABLE_ICONHORSE=true bun test {{args}}

e2e-test *args:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true DISABLE_ICONHORSE=true bun e2e-test {{args}}
