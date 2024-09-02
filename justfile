dev:
  bun dev | pino-pretty

install:
  bun i

bootstrap:
  python3 scripts/bootstrap.py

test:
  PINO_LEVEL=silent DISABLE_DATABASE=true bun test
