import type Koa from "koa";
import { Articles } from "../orm/source.ts";
import { getRetArticle } from "./utils.ts";

export default async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const isNum = (str: string): boolean => /^\d+$/.test(str);
  const identifier = ctx.params.id as string;
  const where = isNum(identifier) ? { id: Number(identifier) } : { slug: identifier };

  const article = await Articles.findOne({
    relations: {
      comments: true
    },
    select: {
      comments: { id: true }
    },
    where
  });

  if (article === null) {
    ctx.throw(404, "Article not found. ");
  }

  ctx.body = {
    data: getRetArticle(article, true)
  };
};
