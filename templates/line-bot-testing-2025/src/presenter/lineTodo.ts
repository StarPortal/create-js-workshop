import { injectable, inject } from "tsyringe";
import { messagingApi } from "@line/bot-sdk";

import { MessagePresenter } from "@/usecase/interface";
import { TodoItem } from "@/entity/todoItem";

const completedIconUrl =
    "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png";
const incompleteIconUrl =
    "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png";

@injectable()
export class LineTodoPresenter implements MessagePresenter {
    constructor(
        @inject(messagingApi.MessagingApiClient)
        private client: messagingApi.MessagingApiClient,
    ) {}

    async replyText(token: string, reply: string): Promise<void> {
        const message: messagingApi.TextMessage = {
            type: "text",
            text: reply,
        };

        await this.client.replyMessage({
            replyToken: token,
            messages: [message],
        });
    }

    async replyList(token: string, items: TodoItem[]): Promise<void> {
        const contents: messagingApi.FlexComponent[] = items.map((item) => {
            const iconUrl = item.isDone ? completedIconUrl : incompleteIconUrl;

            return {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                alignItems: "center",
                contents: [
                    {
                        type: "icon",
                        url: iconUrl,
                    },
                    {
                        type: "text",
                        text: item.content,
                        wrap: true,
                        color: item.isDone ? "#aaaaaa" : "#666666",
                        size: "sm",
                        flex: 5,
                    },
                ],
            };
        });

        await this.client.replyMessage({
            replyToken: token,
            messages: [
                {
                    type: "flex",
                    altText: "Todo List",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            margin: "lg",
                            spacing: "sm",
                            contents,
                        },
                    },
                },
            ],
        });
    }
}
