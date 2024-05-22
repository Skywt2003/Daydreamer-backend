import { Articles, Comments } from "../orm/source.ts";

export default async function (
  created: Date,
  author: string,
  mail: string,
  url: string,
  text: string,
  ip: string,
  agent: string,
  receiveMail: boolean,
  isOwner: boolean,
  status: "pending" | "approved",
  articleId: number,
  parentId: number | null
): Promise<number> {
  const article = await Articles.findOne({ where: { id: articleId } });
  if (article === null) {
    console.log(arguments);
    throw Error("Article Not Found! ");
  }

  try {
    const comment = Comments.create({ created, author, mail, url, text, ip, agent, receiveMail, isOwner, status, article, children: [] });
    if (parentId != null) {
      const parent = await Comments.findOne({ where: { id: parentId } });
      if (parent === null) {
        console.log(arguments);
        throw Error("Parent not found! ");
      }
      comment.parent = parent;
    }
    await Comments.save(comment);
    return comment.id;
  } catch (err) {
    console.log(arguments);
    console.log("Error during add comment. ");
    throw err;
  }
};
