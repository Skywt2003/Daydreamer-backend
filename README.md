# Daydreamer Backend

实现 Typecho Restful API 后端的替代品，但是并不完全兼容。

长期以来，博客一直使用基于 PHP 的博客系统搭建，从 WordPress 到 Typecho。然而，作为服务端语言的 PHP 并不利于实践前后端分离的现代前端技术。基于这一原因，2024 年开始，我使用 Typecho Restful API 插件，基于其提供的 API 开发博客前端，作为替代方案。

现在前端已实现基本功能，很想拓展后端的一些功能，然而 Typecho 的 PHP 技术栈已经是属于上个时代的技术，我并不想基于其继续开发。所以，是时候从头开发一个 headless 的博客系统后端，来取代 Typecho 了。

## 基本信息

技术选型：

- Node.js
- Web 框架：Koa.js
- ORM 框架：Sequelize
- 数据库：SQLite（后续可升级）
- 容器化部署

## 设计理念

尽量使用**优雅的设计**。

1. 评论和内容不能解耦合。**评论都是隶属于某篇文章或页面的的**。（这是我不喜欢「静态博客 + 独立评论系统」方案的原因）
2. **Restful API 应该有足够的抽象度**，而不仅是对数据表的描述。例如，评论和文章作为独立的两张表，这是关系型数据库的局限，而非数据结构的应然设计。所以 API 中设计的评论接口 URL 隶属某篇文章（/blog/:slug/comments）。

## 数据表设计

仔细思考，Typecho 中文章（post）和页面（page）的区别，只是「是否在 timeline 中显示」而已。对于传统的大型 CMS 来说，这个区分或许很重要；但是对于我们这样的小型个人博客来说，其实并没有必要。因为没几个「页面」。

本博客系统使用简化的概念：文章和页面都是内容。文章是显示在 timeline 的内容，页面是不显示在 timeline 的内容，增添 boolean 属性 inTimeline。有一个词可以统一 page 和 post，那就是 **article**。所以在我的设计里，所有内容都是一篇篇 article。

可见 [model.js](./model.js) 中的 ORM 定义。

- Articles 表
- Comments 表
- Subscriptions 表

## API

可见 [api-standard.yaml](./api-standard.yaml) 中的 API 定义。

## TODO

- 各种环节的错误捕捉和处理
- 全面启用 TypeScript（Sequelize 对 ts 支持似乎并不好）
