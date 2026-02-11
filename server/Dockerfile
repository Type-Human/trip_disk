FROM oven/bun:1-alpine
WORKDIR /app


RUN apk add --no-cache \
    vips \
    vips-dev \
    vips-tools \
    build-base \
    python3

COPY package.json ./
RUN bun install

RUN bun add sharp

COPY . .

RUN mkdir -p data uploads
RUN chmod 777 uploads

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]