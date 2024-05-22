import Router from "koa-router";
import api from "./api/index.ts";

const router = new Router();

// router.get("/", async (ctx, next) => {
//   ctx.body = "Hello, Daydreamer! ";
// });

router.get("/articles", api.getArticles);
router.get("/articles/:id", api.getArticle);

router.get("/comments", api.getComments);
router.get("/comments/:id", api.getComment);

router.post("/comments", api.postComment);

export default router;
