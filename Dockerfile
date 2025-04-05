FROM node:20.16-alpine AS builder
WORKDIR /frontend
COPY package*.json .
RUN npm ci --force
COPY . .
# RUN mv .env.prod .env
RUN npm run build
RUN npm prune --omit=dev --force

FROM node:20.16-alpine
WORKDIR /frontend
# COPY --from=builder /frontend/.env .env
COPY --from=builder /frontend/build build/
COPY --from=builder /frontend/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "--env-file=.env", "build" ]