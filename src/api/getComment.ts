import type Koa from "koa";
import { Comments } from "../orm/source.ts";
import { getRetComment, getQueryNumber } from "./utils.ts";

export default async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const commentId = getQueryNumber(ctx.params.id as string, -1);

  const author = decodeURIComponent(ctx.cookies.get("author", { signed: true }) ?? "");
  const mail = decodeURIComponent(ctx.cookies.get("mail", { signed: true }) ?? "");

  const comment = await Comments.findOne({
    where: [
      {
        id: commentId,
        status: "approved"
      },
      {
        id: commentId,
        status: "pending",
        author,
        mail
      }
    ]
  });

  if (comment === null) {
    ctx.throw(404, "Comment not found. ");
  }

  ctx.body = {
    data: getRetComment(comment)
  };
};
