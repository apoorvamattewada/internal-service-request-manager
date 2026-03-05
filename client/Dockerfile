# ─────────────────────────────────────────
# Stage 1: Build React app
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY public ./public
COPY src ./src

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Serve with nginx
# ─────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config for SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
