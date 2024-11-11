import { TodoItem } from "@/entity/todoItem";
import { TodoList } from "@/entity/todoList";

export const MessagePresenter = Symbol("MessagePresenter");
export interface MessagePresenter {
    replyText(token: string, text: string): Promise<void>;
    replyList(token: string, items: TodoItem[]): Promise<void>;
}

export const TodoRepository = Symbol("TodoRepository");
export interface TodoRepository {
    find(userId: string): Promise<TodoList>;
    save(todoList: TodoList): Promise<void>;
}

export type TextMessage = {
    replyToken: string;
    userId: string;
    content: string;
};
