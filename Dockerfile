FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN mkdir -p /app/data /app/public/uploads
RUN chown -R bun:bun /app/data /app/public/uploads
USER bun
EXPOSE 3000
CMD ["bun", "src/server/index.ts"]
