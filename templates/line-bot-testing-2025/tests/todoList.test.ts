import { container } from "tsyringe";
import { createHmac } from "crypto";
import { vi, expect, describe, it } from "vitest";
import {
    WebhookEvent,
    WebhookRequestBody,
    LINE_SIGNATURE_HTTP_HEADER_NAME,
    messagingApi,
} from "@line/bot-sdk";

import { Config } from "@/app/config";
import { TodoRepository } from "@/usecase/interface";

function createSignature(body: any): string {
    const config = container.resolve(Config);

    return createHmac("SHA256", config.channelSecret)
        .update(JSON.stringify(body))
        .digest("base64");
}

describe("todoList", () => {
    it("no items", async (ctx) => {
        const replyToken = "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA";
        const body: WebhookRequestBody = {
            destination: "U4af4980629",
            events: [
                {
                    type: "message",
                    deliveryContext: {
                        isRedelivery: false,
                    },
                    source: {
                        userId: "U4af4980629",
                        type: "user",
                    },
                    webhookEventId: "B64f5d5f6e4f5f4g5f4",
                    mode: "active",
                    replyToken,
                    timestamp: 1462629479859,
                    message: {
                        type: "text",
                        id: "1234567890",
                        quoteToken: "",
                        text: "/todo",
                    },
                },
            ],
        };
        const signature = createSignature(body);
        const res = await ctx.app.request("/", {
            method: "POST",
            headers: { [LINE_SIGNATURE_HTTP_HEADER_NAME]: signature },
            body: JSON.stringify(body),
        });

        expect(res.status).toEqual(200);

        const botClient = container.resolve<messagingApi.MessagingApiClient>(
            messagingApi.MessagingApiClient,
        );
        expect(botClient.replyMessage).toHaveBeenCalledWith({
            replyToken,
            messages: [
                {
                    type: "text",
                    text: "沒有待辦事項",
                },
            ],
        });
    });

    it("has one item", async (ctx) => {
        const userId = "U4af4980629";
        const todoRepository =
            container.resolve<TodoRepository>(TodoRepository);
        const todoList = await todoRepository.find(userId);
        todoList.add("買牛奶");
        await todoRepository.save(todoList);

        const replyToken = "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA";
        const body: WebhookRequestBody = {
            destination: "U4af4980629",
            events: [
                {
                    type: "message",
                    deliveryContext: {
                        isRedelivery: false,
                    },
                    source: {
                        userId,
                        type: "user",
                    },
                    webhookEventId: "B64f5d5f6e4f5f4g5f4",
                    mode: "active",
                    replyToken,
                    timestamp: 1462629479859,
                    message: {
                        type: "text",
                        id: "1234567890",
                        quoteToken: "",
                        text: "/todo",
                    },
                },
            ],
        };
        const signature = createSignature(body);
        const res = await ctx.app.request("/", {
            method: "POST",
            headers: { [LINE_SIGNATURE_HTTP_HEADER_NAME]: signature },
            body: JSON.stringify(body),
        });

        expect(res.status).toEqual(200);

        const botClient = container.resolve<messagingApi.MessagingApiClient>(
            messagingApi.MessagingApiClient,
        );
        expect(botClient.replyMessage).toHaveBeenCalledWith({
            replyToken,
            messages: [
                expect.objectContaining({
                    contents: expect.objectContaining({
                        body: expect.objectContaining({
                            contents: expect.arrayContaining([
                                expect.objectContaining({
                                    contents: expect.arrayContaining([
                                        {
                                            type: "text",
                                            text: "買牛奶",
                                            wrap: true,
                                            color: "#666666",
                                            size: "sm",
                                            flex: 5,
                                        },
                                    ]),
                                }),
                            ]),
                        }),
                    }),
                }),
            ],
        });
    });
});
