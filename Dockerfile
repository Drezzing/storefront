FROM node:22.15.0-alpine AS builder
WORKDIR /frontend

RUN npm i -g bun@1.2.13

COPY package.json .
COPY bun.lock .
COPY patches/* patches/
RUN bun install --frozen-lockfile

COPY . .
RUN npm run prepare
RUN npm run build
RUN rm -rf node_modules && bun install --frozen-lockfile --production


FROM node:22.15.0-alpine
WORKDIR /frontend

COPY --from=builder /frontend/build build/
COPY --from=builder /frontend/dist dist/
COPY --from=builder /frontend/node_modules node_modules/

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD wget --spider -nv -t1 "http://0.0.0.0:3000/health?partial=true"

ENV NODE_ENV=production
ENTRYPOINT [ "node", "--env-file=.env", "build" ]
