import { Articles } from "../orm/source.ts";

export default async function (
  slug: string,
  title: string,
  created: Date,
  modified: Date,
  text: string,
  description: string,
  keywords: string[],
  headPic: string | null,
  inTimeline: boolean,
  allowComment: boolean
): Promise<number> {
  try {
    const article = Articles.create({ slug, title, created, modified, text, description, keywords, headPic, inTimeline, allowComment, comments: [] });
    await Articles.save(article);
    return article.id;
  } catch (err) {
    console.log(arguments);
    console.log("Error during commit article. ");
    throw err;
  }
};
