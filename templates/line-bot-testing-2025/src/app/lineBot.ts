import { createMiddleware } from "hono/factory";
import {
    validateSignature,
    LINE_SIGNATURE_HTTP_HEADER_NAME,
} from "@line/bot-sdk";

import { Config } from "@/app/config";

export const verifySignature = createMiddleware(async (c, next) => {
    const config = c.var.resolve(Config);
    if (!config.channelSecret) {
        c.status(500);
        return c.text("channel secret not set");
    }

    const signature = c.req.header(LINE_SIGNATURE_HTTP_HEADER_NAME);
    if (
        !validateSignature(
            await c.req.text(),
            config.channelSecret,
            signature as string,
        )
    ) {
        c.status(401);
        return c.text("unauthorized");
    }

    await next();
});
