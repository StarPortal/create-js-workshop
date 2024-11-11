import { MessagePresenter, TextMessage } from "./interface";

export class EchoCommand {
    constructor(private readonly presenter: MessagePresenter) {}

    async execute(message: TextMessage): Promise<void> {
        return this.presenter.replyText(message.replyToken, message.content);
    }
}
