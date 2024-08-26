import type * as telegraf from "telegraf";

export type OnLoad = (ctx: telegraf.Context) => Promise<string | void> | string | void;
