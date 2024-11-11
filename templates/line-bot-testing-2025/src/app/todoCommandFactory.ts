import { Context } from "hono";
import { webhook } from "@line/bot-sdk";

import {
    MessagePresenter,
    TodoRepository,
    TextMessage,
} from "@/usecase/interface";
import { EchoCommand } from "@/usecase/echoCommand";
import { ListCommand } from "@/usecase/listCommand";
import { InvalidCommand } from "@/usecase/invalidCommand";

interface TextMessageUsecase {
    execute(message: TextMessage): Promise<void>;
}

export const isCommand = (message: string): boolean => message.startsWith("/");
export function buildTodoCommandFromTextMessage(
    ctx: Context,
    message: TextMessage,
): TextMessageUsecase {
    const presenter = ctx.var.resolve<MessagePresenter>(MessagePresenter);
    const todos = ctx.var.resolve<TodoRepository>(TodoRepository);

    if (isCommand(message.content)) {
        const [name, ...args] = message.content.slice(1).split(" ");
        switch (name) {
            case "todo":
                return new ListCommand(presenter, todos);
            default:
                return new InvalidCommand(presenter);
        }
    }

    return new EchoCommand(presenter);
}
