# Daydreamer / Backend

驱动 [skywt.cn](https://skywt.cn) 网站博客系统、评论系统的后端。

## 基本信息

### 技术栈

- Node.js
- Web 框架：Koa.js
- ORM 框架：TypeORM
- 数据库：Postgres

### 2.0 Changelog

- 全面使用 TypeScript
- 考虑到对 TypeScript 的兼容性，弃用 Sequelize ORM 框架，改为使用 TypeORM 框架
- 考虑到可拓展性，数据库从 SQLite 迁移到 Postgres
- 优化数据表设计，设置了充分的外键约束和合适的数据类型约束
- 根据 RESTful 规范重构了接口标准

## 部署与使用

### 环境变量

- `COOKIE_KEYS`：用于 Cookie 签名的 key 字符串。如果有多个 key 用逗号分隔。
- `COOKIE_DOMAIN`：Cookie 域名，请设置为前端域名，否则跨域无法访问。
- `ALLOW_ORIGIN`：允许的请求 Origin，请设置为前端域名，否则跨域无法访问。
- `DB_HOST`：Postgres 服务器主机地址。默认为 `localhost`。
- `DB_PORT`：Postgres 服务器端口号。默认为 `5432`。
- `DB_DATABASE`：Postgres 数据库名。
- `DB_USERNAME`：Postgres 用户名。
- `DB_PASSWORD`：Postgres 密码。
- `BARK_URL`：Bark 评论通知 URL，请设置为自己的 Bark 实例 URL。留空则关闭评论通知。
- `OLD_DB_PATH`：待迁移的 SQLite 文件路径，用于从 1.0 版本进行迁移。

### 从 1.0 迁移

首先配置好相关环境变量，包括 `OLD_DB_PATH` 环境变量以及 Postgres 数据库等。

构建 docker 容器，运行 migrate 命令。

```bash
docker build -t daydreamer:new --network=host .
docker run -it --rm \
  --name daydreamer_migrate \
  -v /data/daydreamer:/data \
  --env-file .env \
  --network postgres \
  daydreamer:new migrate
```

### Docker 部署

推荐使用 Docker 方式部署。示例 `compose.yml` 文件如下：

```yaml
services:
  daydreamer-backend:
    build:
      context: .
      network: host
      dockerfile: Dockerfile
    container_name: daydreamer-backend
    environment:
      - COOKIE_KEYS=YOUR_KEY1,YOUR_KEY2,YOUR_KEY3
      - COOKIE_DOMAIN=.skywt.cn
      - ALLOW_ORIGIN=http://localhost:4321,https://skywt.cn,https://alpha.skywt.cn
      - BARK_URL=https://push.skywt.cn/YOUR_BARK_TOKEN/
      - DB_HOST=postgres
      - DB_DATABASE=daydreamer
      - DB_USERNAME=daydreamer
      - DB_PASSWORD=YOUR_PASSWORD
    ports:
      - "3000:3000"
    networks:
      - caddy
      - postgres
    restart: unless-stopped

networks:
  caddy:
    external: true
  postgres:
    external: true
```

## API

请参见 [main.ts](./src/api) 中的各模块 API 实现。

暂时只实现了面向用户的获取文章、获取评论、发表评论 API，没有实现面向管理员的 API。对于管理文章和评论操作，可以直接使用数据库管理软件，如 DBeaver。

## TODO

- [ ] OpenAPI Standard
- [ ] 新评论回复邮件通知
- [ ] GitHub Actions 构建 Docker image 并发布到 DockerHub
