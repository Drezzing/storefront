import pino from "pino";

export const logger = pino({
    transport: {
        targets: [
            { level: "info", target: "pino/file", options: { destination: 1 } },
            { level: "error", target: "pino/file", options: { destination: "./error.log" } },
        ],
    },
    base: undefined,
});
