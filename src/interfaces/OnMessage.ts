import type * as telegraf from "telegraf";

export type OnMessage = (ctx: telegraf.Context, name: string) => Promise<void> | void;
