import type * as telegraf from "telegraf";

export type OnMessage = (ctx: telegraf.Context) => Promise<void> | void;
