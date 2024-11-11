import { MessagePresenter, TextMessage } from "./interface";

export class InvalidCommand {
    constructor(private readonly presenter: MessagePresenter) {}

    async execute(message: TextMessage): Promise<void> {
        return this.presenter.replyText(message.replyToken, "無效指令");
    }
}
