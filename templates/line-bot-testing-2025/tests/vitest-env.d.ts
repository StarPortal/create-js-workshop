import { Hono } from "hono";

declare module "vitest" {
    export interface TestContext {
        app: Hono;
    }
}

export {};
