import { injectable, singleton } from "tsyringe";

import { TodoRepository } from "@/usecase/interface";
import { TodoItem } from "@/entity/todoItem";
import { TodoList } from "@/entity/todoList";

type TodoItemSchema = {
    content: string;
    isDone: boolean;
};

@singleton()
export class InMemoryTodoRepository implements TodoRepository {
    private items: Record<string, TodoItemSchema[]> = {};

    async find(userId: string): Promise<TodoList> {
        const items = this.items[userId] || [];
        return new TodoList(
            userId,
            items.map((item) => new TodoItem(item.content, item.isDone)),
        );
    }

    async save(todoList: TodoList): Promise<void> {
        this.items[todoList.id] = todoList.items.map((item) => ({
            content: item.content,
            isDone: item.isDone,
        }));
    }
}
