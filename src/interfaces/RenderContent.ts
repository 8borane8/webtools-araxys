import type * as telegraf from "telegraf";

export type RenderContent = (ctx: telegraf.Context, name: string) => Promise<string> | string;
