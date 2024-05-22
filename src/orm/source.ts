import { DataSource } from "typeorm";
import { Article, Comment } from "./entities.ts";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT === undefined ? 5432 : parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME ?? "daydreamer",
  password: process.env.DB_PASSWORD ?? "password",
  database: process.env.DB_DATABASE ?? "daydreamer",
  entities: [Article, Comment],
  synchronize: true,
  logging: false
});

await AppDataSource.initialize();

const Articles = AppDataSource.getRepository(Article);
const Comments = AppDataSource.getRepository(Comment);

export { Articles, Comments };
