import { TodoItem } from "./todoItem";

export class TodoList {
    constructor(
        public readonly id: string,
        private _items: TodoItem[] = [],
    ) {}

    get pendings() {
        return this._items.filter((item) => !item.isDone);
    }

    get isEmpty() {
        return this._items.length === 0;
    }

    get items() {
        return [...this._items];
    }

    add(content: string, isDone: boolean = false) {
        this._items = [...this._items, new TodoItem(content, isDone)];
    }
}
