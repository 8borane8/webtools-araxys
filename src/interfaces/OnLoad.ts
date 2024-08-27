import type * as telegraf from "telegraf";

export type OnLoad = (ctx: telegraf.Context, name: string) => Promise<string | void> | string | void;
