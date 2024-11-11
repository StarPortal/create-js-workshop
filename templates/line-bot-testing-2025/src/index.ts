import "reflect-metadata";
import { container, instanceCachingFactory } from "tsyringe";
import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { webhook, messagingApi } from "@line/bot-sdk";

import { dependencyInjection } from "@/app/tsyringe";
import { verifySignature } from "@/app/lineBot";
import { Config } from "@/app/config";
import { MessagePresenter, TodoRepository } from "@/usecase/interface";
import { LineTodoPresenter } from "@/presenter/lineTodo";
import { InMemoryTodoRepository } from "@/repository/inMemoryTodos";
import { buildTodoCommandFromTextMessage } from "@/app/todoCommandFactory";

export const config = {
    api: {
        bodyParser: false,
    },
};

container.register(Config, {
    useFactory: () =>
        new Config(
            process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
            process.env.LINE_CHANNEL_SECRET ?? "",
        ),
});
container.register<messagingApi.MessagingApiClient>(
    messagingApi.MessagingApiClient,
    {
        useFactory: instanceCachingFactory((c) => {
            const config = c.resolve(Config);

            return new messagingApi.MessagingApiClient({
                channelAccessToken: config.channelAccessToken,
            });
        }),
    },
);
container.register(MessagePresenter, { useToken: LineTodoPresenter });
container.register(TodoRepository, { useToken: InMemoryTodoRepository });

export const app = new Hono();
app.use(dependencyInjection());

app.post("/", verifySignature, async (c) => {
    const body = await c.req.json();
    const events = body.events as webhook.Event[];

    await Promise.all(
        events.map(async (event) => {
            if (event.type !== "message" || event.message.type !== "text") {
                return null;
            }

            const { replyToken, message } = event;
            const textMessage = {
                replyToken: replyToken ?? "",
                userId: event.source?.userId ?? "",
                content: message.text,
            };

            const usecase = buildTodoCommandFromTextMessage(c, textMessage);
            await usecase.execute(textMessage);
        }),
    );

    return c.text("OK");
});

export default handle(app);
