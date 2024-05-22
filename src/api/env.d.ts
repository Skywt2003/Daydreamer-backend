interface GotArticle {
  id: number
  slug: string
  title: string
  created: Date
  modified: Date
  digest: string
  text?: string
  description: string | null
  keywords: string[] | null
  headPic: string | null
  inTimeline: boolean
  allowComment: boolean
  commentsNum: number
  comments?: GotComment[]
}

interface GotComment {
  id: number
  created: Date
  author: string
  avatar: string
  url: string
  text: string
  isOwner: boolean
  status: "pending" | "approved"
  articleId: number
  parentId: number | null
  children: GotComment[]
}
