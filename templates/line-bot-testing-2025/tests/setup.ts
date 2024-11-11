import "reflect-metadata";
import { container } from "tsyringe";
import { messagingApi } from "@line/bot-sdk";
import { vi, beforeEach, beforeAll, afterAll } from "vitest";

import { app } from "@";
import { Config } from "@/app/config";
import { MessagePresenter, TodoRepository } from "@/usecase/interface";
import { LineTodoPresenter } from "@/presenter/lineTodo";
import { InMemoryTodoRepository } from "@/repository/inMemoryTodos";

beforeEach((ctx) => {
    vi.resetAllMocks();
    container.clearInstances();

    const config = new Config("dummy-token", "dummy-secret");
    container.register(Config, { useValue: config });
    container.register(MessagePresenter, { useToken: LineTodoPresenter });
    container.register(TodoRepository, { useToken: InMemoryTodoRepository });

    const client = new messagingApi.MessagingApiClient({
        channelAccessToken: config.channelAccessToken,
    });
    vi.spyOn(client, "replyMessage").mockImplementation(async () =>
        Promise.resolve({ sentMessages: [] }),
    );
    container.register(messagingApi.MessagingApiClient, { useValue: client });

    ctx.app = app;
});
