import { MessagePresenter, TodoRepository, TextMessage } from "./interface";

export class ListCommand {
    constructor(
        private readonly presenter: MessagePresenter,
        private readonly todos: TodoRepository,
    ) {}

    async execute(message: TextMessage): Promise<void> {
        const todo = await this.todos.find(message.userId);
        if (todo.isEmpty) {
            return this.presenter.replyText(message.replyToken, "沒有待辦事項");
        }

        return this.presenter.replyList(message.replyToken, todo.items);
    }
}
