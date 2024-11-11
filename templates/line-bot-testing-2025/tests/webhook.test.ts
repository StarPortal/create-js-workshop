import { container } from "tsyringe";
import { createHmac } from "crypto";
import { vi, expect, it } from "vitest";
import {
    WebhookEvent,
    WebhookRequestBody,
    LINE_SIGNATURE_HTTP_HEADER_NAME,
} from "@line/bot-sdk";

import { Config } from "@/app/config";

function createSignature(body: any): string {
    const config = container.resolve(Config);

    return createHmac("SHA256", config.channelSecret)
        .update(JSON.stringify(body))
        .digest("base64");
}

it("webhook works correctly", async (ctx) => {
    const body: WebhookRequestBody = {
        destination: "U4af4980629",
        events: [],
    };
    const signature = createSignature(body);

    const res = await ctx.app.request("/", {
        method: "POST",
        headers: { [LINE_SIGNATURE_HTTP_HEADER_NAME]: signature },
        body: JSON.stringify(body),
    });

    expect(res.status).toEqual(200);
});

it("reject if no channel secret", async (ctx) => {
    container.register(Config, {
        useValue: {
            channelSecret: "",
            channelAccessToken: "",
        },
    });

    const body: WebhookRequestBody = {
        destination: "U4af4980629",
        events: [],
    };
    const signature = createSignature(body);

    const res = await ctx.app.request("/", {
        method: "POST",
        headers: { [LINE_SIGNATURE_HTTP_HEADER_NAME]: signature },
        body: JSON.stringify(body),
    });

    expect(res.status).toEqual(500);
});
