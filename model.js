import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "/data/db.sqlite",
});

// Sequelize 的神奇设定：实际表名通过 inflection 库计算得到
// 例：user -> users，person -> people
class Article extends Model {}

Article.init(
  {
    // 由于习惯原因，仍然称 article id 为 cid（源于 content id）
    cid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    // 面向前端时，将 slug 作为唯一标识符
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    // 由于要求完全自定义发布时间，此处不使用 Sequelize 提供的 createdAt 等
    created: { type: DataTypes.INTEGER, allowNull: false },
    modified: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    inTimeline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    headPic: { type: DataTypes.STRING },
    allowComment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Article",
    timestamps: false,
  }
);

await Article.sync();

class Comment extends Model {}

Comment.init(
  {
    coid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    cid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Article,
        key: "cid",
      },
    },
    created: { type: DataTypes.INTEGER, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    mail: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    ip: { type: DataTypes.STRING, allowNull: false },
    agent: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved"),
      allowNull: false,
      defaultValue: "pending",
    },
    parent: { type: DataTypes.INTEGER, allowNull: false },
    receiveMail: { type: DataTypes.BOOLEAN, allowNull: false },
    isOwner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    timestamps: false,
  }
);

await Comment.sync();

export { Article, Comment };
