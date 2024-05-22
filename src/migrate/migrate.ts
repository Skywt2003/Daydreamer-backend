import addArticle from "./addArticle.ts";
import addComment from "./addComment.ts";

import sqlite3 from "sqlite3";

import { getDigest } from "../api/utils.ts";

// Daydreamer 2.0 的数据表，相比 1.0 的基本不同之处：
//  1. article 表增添 description 和 keywords 字段
//  2. 添加两表关系的外键约束
//  3. created、modified 字段由以毫秒为单位的时间戳数字类型改为 Date 类型
//  4. cid、coid 字段均改名为 id
//
// 注意：评论有树形结构，必须先添加父层级才能添加子层级。
//      解决这一问题，只要按照时间添加即可。
//
// node-sqlite3 完全不支持现代 Promise 异步编程
// 可以充分体验到回调的痛苦 T_T

interface ArticleRow {
  cid: number
  slug: string
  title: string
  created: number
  modified: number
  text: string
  headPic: string | null
  inTimeline: number
  allowComment: number
}

interface CommentRow {
  coid: number
  created: number
  author: string
  mail: string
  url: string
  text: string
  ip: string
  agent: string
  receiveMail: number
  isOwner: number
  status: "approved" | "pending"
  cid: number
  parent: number
}

const oldDatabasePath = process.env.OLD_DB_PATH ?? "/data/db.sqlite";
const db = new sqlite3.Database(oldDatabasePath);

// Postgres 默认不能指定自增主键
// 所以 cid / coid 和新的 id 将彻底无关，建立映射
const articleIdMap: Record<string, number> = {};
const commentIdMap: Record<number, number> = {};

db.all("SELECT * FROM Articles ORDER BY created ASC", [], (err, rows: ArticleRow[]) => {
  if (err !== null) throw err;
  (async (): Promise<void> => {
    for (const row of rows) {
      const id = await addArticle(
        row.slug,
        row.title,
        new Date(row.created),
        new Date(row.modified),
        row.text.replace("<!--markdown-->", ""),
        getDigest(row.text),
        [],
        row.headPic,
        row.inTimeline > 0,
        row.allowComment > 0);
      console.log("Article migrated: " + row.slug);
      articleIdMap[row.cid] = id;
    }
  })().then(() => {
    db.all("SELECT * FROM Comments ORDER BY created ASC", [], (err, rows: CommentRow[]) => {
      if (err !== null) throw err;
      (async (): Promise<void> => {
        for (const row of rows) {
          if (articleIdMap[row.cid] === undefined) {
            console.log(row);
            console.log("The article comment belongs to not found! ");
            continue;
          }
          if (row.parent !== 0 && commentIdMap[row.parent] === undefined) {
            console.log(row);
            throw Error("Parent comment not found! ");
          }
          const id = await addComment(
            new Date(row.created),
            row.author,
            row.mail,
            row.url,
            row.text,
            row.ip,
            row.agent,
            row.receiveMail > 0,
            row.isOwner > 0,
            row.status,
            articleIdMap[row.cid],
            row.parent === 0 ? null : commentIdMap[row.parent]
          );
          console.log("Comment migrated: " + row.coid + row.text.slice(0, 10) + "...");
          commentIdMap[row.coid] = id;
        }
      })().catch((err) => { throw (err); });
    });
  }).catch((err) => { throw err; });
});
