server-dev:
  bun dev | pino-pretty

server-playwright:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true bun playwright | pino-pretty

install:
  bun i
  bunx playwright install

test *args:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true bun test {{args}}

e2e-test *args:
  PINO_LEVEL=silent DISABLE_DATABASE=true DISABLE_PUPPETEER=true bun e2e-test {{args}}
