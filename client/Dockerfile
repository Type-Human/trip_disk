FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json ./
# Устанавливаем sass-embedded и зависимости
RUN bun install && bun add -D sass-embedded
COPY . .
RUN bunx --bun vite build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Полная замена nginx.conf (client_max_body_size 0 = без лимита)
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
