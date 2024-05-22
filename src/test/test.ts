import { Articles, Comments } from "../orm/source.ts";

async function addArticle (): Promise<void> {
  const article = Articles.create({
    slug: "hello-world",
    title: "Hello, World! ",
    created: new Date(),
    modified: new Date(),
    text: "你好，这是我的第一篇测试文章！",
    description: "本文是第一篇文章。",
    keywords: ["测试", "博客", "test"],
    inTimeline: true,
    allowComment: true,
    comments: []
  });
  await Articles.save(article);
  console.log("Article added: ");
  console.log(article);
}

async function addComment (): Promise<void> {
  const article = await Articles.findOne({
    where: {
      slug: "hello-world"
    }
  });
  if (article === null) {
    console.log("Not Found! ");
    return;
  }
  const comment = Comments.create({
    created: new Date(),
    author: "SkyWT",
    mail: "me@skywt,cn",
    url: "https://skywt.cn/",
    text: "你好世界！这是一条测试评论。",
    ip: "127.0.0.1",
    agent: "test agent",
    receiveMail: true,
    isOwner: false,
    status: "pending",
    article,
    children: []
  });
  await Comments.save(comment);
  console.log("Commend added: ");
  console.log(comment);
}

export default { addArticle, addComment };
