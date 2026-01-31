FROM oven/bun:1-alpine

WORKDIR /app


COPY package.json bun.lock* ./


RUN bun install

COPY . .

RUN mkdir -p /app/data /app/public/uploads


EXPOSE 3000


CMD ["bun", "src/server/index.ts"]
