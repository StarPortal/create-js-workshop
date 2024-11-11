export class TodoItem {
    constructor(
        public readonly content: string,
        public readonly isDone: boolean = false,
    ) {}
}
