FROM node:22.15.0-alpine AS builder
WORKDIR /frontend

RUN npm i -g bun@1.2.13

COPY package.json .
COPY bun.lock .
RUN bun install --frozen-lockfile

COPY . .
RUN npm run build
RUN rm -rf node_modules && bun install --frozen-lockfile --production


FROM node:22.15.0-alpine
WORKDIR /frontend

COPY --from=builder /frontend/build build/
COPY --from=builder /frontend/node_modules node_modules/

EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT [ "node", "--env-file=.env", "build" ]
