FROM oven/bun:1-alpine
WORKDIR /app
RUN apk add --no-cache vips
COPY package.json ./
RUN bun install
COPY . .
RUN mkdir -p data uploads
RUN chmod 777 uploads
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
