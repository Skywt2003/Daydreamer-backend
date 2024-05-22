import "reflect-metadata";

import Koa from "koa";
import bodyParser from "@koa/bodyparser";

import router from "./routes.ts";
import cors from "./cors.ts";

const app = new Koa({ proxy: true });
app.keys = (process.env.COOKIE_KEYS ?? "").split(",");
app
  .use(cors)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);

console.log("The server is ready. ");
