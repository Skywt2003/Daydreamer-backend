import type Koa from "koa";
import { Comments } from "../orm/source.ts";
import { getRetComment, getQueryNumber } from "./utils.ts";

// 评论区域，有三种方法做树形结构：
//   1. 不用外键，一次查询本文所有评论，拿到数据在后端构造树形结构发给前端
//   2. 自引用外键，一次查询所有一级评论，其中嵌套深层评论，直接发给前端
//        本质上是自己和自己连接，连一次多一层，效率也不会很高！
//   3. TypeORM 提供的 Tree Entity
// 关系型数据库里，还有什么办法存储树形结构？
// 暂时采用方案 1，不支持分页

export default async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  // const limit = getQueryNumber(ctx.query.pageSize, 100);
  // const offset = getQueryNumber(ctx.query.page, 1) - 1;
  const articleId = getQueryNumber(ctx.query.articleId, -1);

  const author = decodeURIComponent(ctx.cookies.get("author", { signed: true }) ?? "");
  const mail = decodeURIComponent(ctx.cookies.get("mail", { signed: true }) ?? "");

  const comments = await Comments.find({
    where: [
      {
        status: "approved",
        articleId
      },
      {
        status: "pending",
        author,
        mail,
        articleId
      }
    ],
    // skip: offset,
    // take: limit,
    order: {
      created: "ASC"
    }
  });

  const commentsIdMap: Record<number, GotComment> = {};
  const gotRootComments = comments
    .filter((comment) => comment.parentId == null)
    .map((rootComment) => getRetComment(rootComment));
  gotRootComments.forEach((gotRootComment, index) => { commentsIdMap[gotRootComment.id] = gotRootComment; });
  comments.forEach((comment) => {
    if (comment.parentId == null) return;
    const gotComment = getRetComment(comment);
    commentsIdMap[comment.parentId].children.push(gotComment);
    commentsIdMap[comment.id] = gotComment;
  });

  ctx.body = {
    data: gotRootComments
  };
};
