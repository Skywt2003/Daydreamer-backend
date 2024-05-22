import { type Context, type Next } from "koa";
import { Articles } from "../orm/source.ts";
import { getRetArticle, getQueryNumber } from "./utils.ts";

export default async (ctx: Context, next: Next): Promise<void> => {
  const limit = getQueryNumber(ctx.query.pageSize, 20);
  const offset = getQueryNumber(ctx.query.page, 1) - 1;

  const articles = await Articles.find({
    relations: {
      comments: true
    },
    select: {
      comments: { id: true }
    },
    where: {
      inTimeline: true
    },
    skip: offset,
    take: limit,
    order: {
      created: "DESC"
    }
  });

  ctx.body = {
    data: articles.map((article) => getRetArticle(article, false))
  };
};
