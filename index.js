import { Op } from "sequelize";
import { Article, Comment } from "./model.js";

import CryptoJS from "crypto-js";

import Koa from "koa";
import Router from "koa-router";
import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";

const app = new Koa({ proxy: true });
const router = new Router();

// Cookie 签名使用的 keys，一个字符串数组
app.keys = process.env.COOKIE_KEYS.split(",");
const cookieOptions = {
  signed: true,
  path: "/",
  maxAge: 2592000,
  sameSite: "lax",
  domain: process.env.COOKIE_DOMAIN,
  httpOnly: false,
  overwrite: true,
};

router.get("/", async (ctx, next) => {
  ctx.body = "Hello, Daydreamer! ";
});

router.get("/timeline", async (ctx, next) => {
  const limit = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20;
  const offset = ctx.query.page ? (parseInt(ctx.query.page) - 1) * limit : 0;

  function getDigest(text) {
    text = text.replace("<!--markdown-->", "");
    const index = text.indexOf("<!--more-->");
    if (index === -1) {
      return text;
    } else {
      return text.slice(0, index);
    }
  }

  try {
    const timeline = await Article.findAll({
      where: {
        inTimeline: true,
      },
      offset,
      limit,
      order: [["created", "DESC"]],
    });
    ctx.body = timeline.map((article) => {
      return {
        slug: article.slug,
        title: article.title,
        created: article.created,
        modified: article.modified,
        digest: getDigest(article.text),
        headPic: article.headPic,
      };
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/article/:slug", async (ctx, next) => {
  const slug = ctx.params.slug;

  const article = await Article.findOne({
    where: { slug },
  });
  article.text = article.text.replace("<!--markdown-->", "");
  article.text = article.text.replace("<!--more-->", "");
  ctx.body = article;
});

function getAvatar(mail) {
  const match = mail.match(/^(\d{4,11})@qq.com$/i);
  if (match) {
    return "https://q3.qlogo.cn/g?b=qq&nk=" + match[1] + "&s=100";
  } else {
    // TODO: 这里其实可以做一个判断，如果是境内 IP 访问则提供镜像
    return (
      "https://gravatar.loli.net/avatar/" +
      CryptoJS.MD5(mail).toString() +
      "?s=64"
    );
  }
}

router.get("/article/:slug/comments", async (ctx, next) => {
  const slug = ctx.params.slug;
  // 评论暂时不做分页，否则评论回复显示可能出问题（由于查询结果按时间排序）
  // const limit = ctx.query.pageSize ? ctx.query.pageSize : 20;
  // const offset = ctx.query.page ? ctx.query.page * limit : 0;

  // 这个地方感觉可以优化……
  // 使用 slug 字符串作为主键并非推荐的实践，但使用 cid 作为主键则导致二次查询
  try {
    const article = await Article.findOne({
      where: { slug },
    });
    const cookieAuthor = decodeURIComponent(
      ctx.cookies.get("author", { signed: true })
    );
    const cookieMail = decodeURIComponent(
      ctx.cookies.get("mail", { signed: true })
    );

    const comments = await Comment.findAll({
      where: {
        [Op.or]: [
          {
            cid: article.cid,
            status: "approved",
          },
          {
            cid: article.cid,
            status: "pending",
            author: cookieAuthor,
            mail: cookieMail,
          },
        ],
      },
      order: [["created", "ASC"]],
      // limit,
      // offset,
    });

    // 二维表不好存储树形结构，或许 noSQL 类数据库能解决此问题
    const ret = [];
    const table = {};
    comments.forEach((comment) => {
      const commentToRet = {
        coid: comment.coid,
        created: comment.created,
        author: comment.author,
        url: comment.url,
        avatar: getAvatar(comment.mail),
        status: comment.status,
        text: comment.text,
        isOwner: comment.isOwner,
        parent: comment.parent,
        children: [],
      };
      table[comment.coid] = commentToRet;
      if (comment.parent === 0) {
        ret.push(commentToRet);
      } else {
        table[comment.parent].children.push(commentToRet);
      }
    });
    ctx.body = ret;
  } catch (e) {
    console.log(e);
  }
});

router.post("/article/:slug/comments", async (ctx, next) => {
  const slug = ctx.params.slug;

  const article = await Article.findOne({
    where: { slug },
  });
  console.log(ctx.request.body);
  const comment = await Comment.create({
    cid: article.cid,
    created: new Date(),
    author: ctx.request.body.author,
    mail: ctx.request.body.mail,
    url: ctx.request.body.url,
    ip: ctx.ip,
    agent: ctx.request.header["user-agent"],
    text: ctx.request.body.text,
    parent: ctx.request.body.parent,
    receiveMail: ctx.request.body.receiveMail,
  });
  const ret = {
    coid: comment.coid,
    created: comment.created,
    author: comment.author,
    url: comment.url,
    avatar: getAvatar(comment.mail),
    status: comment.status,
    text: comment.text,
    isOwner: comment.isOwner,
    parent: comment.parent,
    children: [],
  };
  ctx.body = ret;
  ctx.cookies.set("author", encodeURIComponent(comment.author), cookieOptions);
  ctx.cookies.set("mail", encodeURIComponent(comment.mail), cookieOptions);
  ctx.cookies.set("url", encodeURIComponent(comment.url), cookieOptions);
});

// use 的顺序需要注意
app
  .use(
    cors({
      // 当传递 credentials 时，Allow Origin 不能设置为 *
      // 现代浏览器的跨域限制，简直是规则类怪谈
      origin: (ctx) => {
        const origin = ctx.get("Origin");
        console.log(origin);
        if (
          origin.startsWith("http://localhost:4321") ||
          origin.startsWith("https://skywt.cn")
        ) {
          return origin;
        }
      },
      credentials: true,
    })
  )
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);
