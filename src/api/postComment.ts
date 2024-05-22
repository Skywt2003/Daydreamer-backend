import type Koa from "koa";
import { Articles, Comments } from "../orm/source.ts";
import { cookieOptions, getRetComment, barkMessage } from "../api/utils.ts";

export default async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const articleId = ctx.request.body.articleId;
  const parentId = ctx.request.body.parentId;

  const article = await Articles.findOne({ where: { id: articleId } });
  if (article === null) {
    ctx.throw(400, "Article not found. ");
  }

  const comment = Comments.create({
    created: new Date(),
    author: ctx.request.body.author,
    mail: ctx.request.body.mail,
    url: ctx.request.body.url,
    text: ctx.request.body.text,
    ip: ctx.ip,
    agent: ctx.request.header["user-agent"] ?? "",
    receiveMail: ctx.request.body.receiveMail,
    isOwner: false,
    status: "pending",
    article,
    children: []
  });

  if (parentId != null) {
    const parent = await Comments.findOne({ where: { id: parentId } });
    if (parent === null) {
      ctx.throw(400, "Parent not found. ");
    }
    comment.parent = parent;
  }

  await Comments.save(comment);

  void barkMessage("博客有新的评论", `来自 ${comment.author} 的评论。`);

  ctx.body = {
    data: getRetComment(comment)
  };

  ctx.cookies.set("author", encodeURIComponent(comment.author), cookieOptions);
  ctx.cookies.set("mail", encodeURIComponent(comment.mail), cookieOptions);
  ctx.cookies.set("url", encodeURIComponent(comment.url), cookieOptions);
};
