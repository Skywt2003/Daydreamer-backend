import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
  // type Relation
} from "typeorm";

@Entity("articles")
export class Article {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column({ unique: true })
    slug!: string;

  @Column()
    title!: string;

  @Column()
    created!: Date;

  @Column()
    modified!: Date;

  @Column("text")
    text!: string;

  @Column("text")
    description!: string;

  @Column("varchar", { array: true, default: [] })
    keywords!: string[];

  @Column("varchar", { nullable: true })
    headPic!: string | null;

  @Column({ default: true })
    inTimeline!: boolean;

  @Column({ default: true })
    allowComment!: boolean;

  @OneToMany(() => Comment, (comment) => comment.article)
    comments!: Comment[];
}

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    created!: Date;

  @Column()
    author!: string;

  @Column()
    mail!: string;

  @Column()
    url!: string;

  @Column("text")
    text!: string;

  @Column()
    ip!: string;

  @Column()
    agent!: string;

  @Column()
    receiveMail!: boolean;

  @Column()
    isOwner!: boolean;

  @Column()
    status!: "pending" | "approved";

  @ManyToOne(() => Article, async (article) => article.comments)
    article!: Article;

  @Column()
    articleId!: number;

  @ManyToOne(() => Comment, async (comment) => comment.children)
    parent!: Comment;

  @Column({ nullable: true })
    parentId!: number;

  @OneToMany(() => Comment, async (comment) => comment.parent)
    children!: Comment[];
}
