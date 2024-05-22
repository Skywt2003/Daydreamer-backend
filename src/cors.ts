import cors from "@koa/cors";

const checkAllowOrigin = (origin: string): boolean =>
  (process.env.ALLOW_ORIGIN ?? "").split(",").includes(origin);

const middleware = cors({
  origin: (ctx) => checkAllowOrigin(ctx.get("Origin")) ? ctx.get("Origin") : "",
  credentials: true
});

export default middleware;
