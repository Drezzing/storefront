FROM node:22.15.0-alpine AS builder
WORKDIR /frontend

COPY package*.json .
RUN npm ci
COPY . .
# RUN mv .env.prod .env
RUN npm run build
RUN npm prune --omit=dev


FROM node:22.15.0-alpine
WORKDIR /frontend

# COPY --from=builder /frontend/.env .env
COPY --from=builder /frontend/build build/
COPY --from=builder /frontend/node_modules node_modules/

EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT [ "node", "--env-file=.env", "build" ]