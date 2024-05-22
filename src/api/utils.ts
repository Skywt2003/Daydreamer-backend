import type Cookies from "cookies";
import { type Comment, type Article } from "../orm/entities.ts";
import CryptoJS from "crypto-js";

const getAvatar = (mail: string): string => {
  const match = mail.match(/^(\d{4,11})@qq.com$/i);
  if (match !== null) {
    return "https://q3.qlogo.cn/g?b=qq&nk=" + match[1] + "&s=100";
  } else {
    // TODO: 这里其实可以做一个判断，如果是境内 IP 访问则提供镜像
    return (
      "https://gravatar.loli.net/avatar/" +
      CryptoJS.MD5(mail).toString() +
      "?s=64"
    );
  }
};

const getDigest = (text: string): string => {
  text = text.replace("<!--markdown-->", "");
  const index = text.indexOf("<!--more-->");
  if (index === -1) {
    return text;
  } else {
    return text.slice(0, index);
  }
};

const getQueryNumber = (query: string | string[] | undefined, defaultValue: number): number => {
  if (query === undefined) {
    return defaultValue;
  } else if (Array.isArray(query)) {
    if (query.length === 0 || query[0] === undefined) {
      return defaultValue;
    } else {
      return parseInt(query[0]);
    }
  } else {
    return parseInt(query);
  }
};

const cookieOptions: Cookies.SetOption = {
  signed: true,
  path: "/",
  maxAge: 2592000,
  sameSite: "lax",
  domain: process.env.COOKIE_DOMAIN,
  httpOnly: false,
  overwrite: true
};

const barkMessage = async (title: string, content: string): Promise<void> => {
  if (process.env.BARK_URL === undefined) {
    console.log("No Bark URL configured. ");
    return;
  }
  try {
    const url = `${process.env.BARK_URL}${title}/${content}`;
    await fetch(url);
  } catch (err) {
    console.log("Bark push failed: ");
    console.log(err);
  }
};

const getRetComment = (comment: Comment): GotComment => ({
  id: comment.id,
  created: comment.created,
  author: comment.author,
  avatar: getAvatar(comment.mail),
  url: comment.url,
  text: comment.text,
  isOwner: comment.isOwner,
  status: comment.status,
  articleId: comment.articleId,
  parentId: comment.parentId ?? null,
  children: []
});

const getRetArticle = (article: Article, includeFullText: boolean): GotArticle => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  created: article.created,
  modified: article.modified,
  digest: getDigest(article.text),
  text: includeFullText ? article.text : undefined,
  description: article.description,
  keywords: article.keywords,
  headPic: article.headPic,
  inTimeline: article.inTimeline,
  allowComment: article.allowComment,
  commentsNum: article.comments == null ? 0 : article.comments.length
});

export { getAvatar, getDigest, getQueryNumber, cookieOptions, barkMessage, getRetComment, getRetArticle };
