/**
 * “关于我”页面的配置。
 * 正文段落来自 src/content/blog/welcome.md（按 ## 标题拆分），
 * 这里只放 Markdown 表达不了的东西：段落映射、轮播卡片、专利列表。
 */

export type Lang = "zh" | "en";
export type I18n = Record<Lang, string>;

export type AboutSection = {
  title: string;
  paragraphs: string[];
  bullets: string[];
  images: string[];
};

export type Patent = {
  number: string | null;
  title: I18n;
  status: I18n;
  role: I18n;
  /** 查询链接；没有专利号的不生成链接 */
  href: string | null;
};

export type PastCardConfig = {
  kind?: "patents";
  date?: string;
  title: I18n;
  body: I18n;
  /** 关联的博客 slug，卡片自动使用该文章的第一张图片 */
  postSlug?: string;
  /** 没有关联文章时的兜底图片 */
  image?: string;
  link?: { href: string; label: I18n };
};

/** 专利公开文本查询页（国家知识产权局） */
const patentUrl = (number: string) =>
  `https://pss-system.cponline.cnipa.gov.cn/conventionalSearch?searchWord=${number}`;

export const patents: Patent[] = [
  {
    number: "CN116342849B",
    title: { zh: "在三维网格上生成牙模倒凹区域的方法", en: "Generating undercut regions on 3D dental meshes" },
    status: { zh: "已授权", en: "Granted" },
    role: { zh: "第一设计人", en: "Lead inventor" },
    href: patentUrl("CN116342849B"),
  },
  {
    number: "CN115861547B",
    title: { zh: "一种基于投影的模型表面样条线生成方法", en: "Projection-based spline generation on model surfaces" },
    status: { zh: "已授权", en: "Granted" },
    role: { zh: "第二设计人", en: "Co-inventor" },
    href: patentUrl("CN115861547B"),
  },
  {
    number: "CN115661374B",
    title: { zh: "一种基于空间划分和模型体素化的快速检索方法", en: "Fast retrieval via spatial partitioning and voxelization" },
    status: { zh: "已授权", en: "Granted" },
    role: { zh: "第二设计人", en: "Co-inventor" },
    href: patentUrl("CN115661374B"),
  },
  {
    number: "CN115797599B",
    title: { zh: "基于标注网格和Kennedy分类的基牙选择匹配方法", en: "Abutment matching with annotated meshes and Kennedy classification" },
    status: { zh: "已授权", en: "Granted" },
    role: { zh: "第一设计人", en: "Lead inventor" },
    href: patentUrl("CN115797599B"),
  },
  {
    number: "CN115826836A",
    title: { zh: "一种基于广度优先搜索的三维标注方法", en: "3D annotation based on breadth-first search" },
    status: { zh: "驳回", en: "Rejected" },
    role: { zh: "第二设计人", en: "Co-inventor" },
    href: patentUrl("CN115826836A"),
  },
  {
    number: null,
    title: { zh: "一种基于光线追踪的数据标注方法（2024-12-26 提交）", en: "Ray-tracing based data annotation (filed 2024-12-26)" },
    status: { zh: "未知", en: "Pending" },
    role: { zh: "第一设计人", en: "Lead inventor" },
    href: null,
  },
];

export const aboutConfig = {
  name: { zh: "昱安", en: "Yu'an" } as I18n,
  email: "3051798796@qq.com",
  issue: { zh: "Issue No.01 — 个人档案", en: "Issue No.01 — Profile" } as I18n,
  title: { zh: "关于我", en: "About me" } as I18n,
  location: { zh: "北京", en: "Beijing" } as I18n,
  coordinate: "39°54′24″N 116°23′51″E",
  traits: [
    { zh: "独立开发者", en: "Indie developer" },
    { zh: "ENFP", en: "ENFP" },
    { zh: "狮子座", en: "Leo" },
  ] as I18n[],
  keywords: ["渲染 Rendering", "几何 Geometry", "图形 Graphics", "产品实现 Product", "AI", "开源 Open Source", "独立游戏 Indie Game"],
  github: "https://github.com/3dsfgs",
  /** welcome.md 里各段落标题与页面模块的对应关系 */
  sectionTitles: {
    zh: {
      intro: "独立开发者",
      now: "现在关注的内容",
      past: "一些过去的尝试",
      site: "关于这个网站",
      later: "之后",
    },
    en: {
      intro: "Independent Developer",
      now: "What I Am Exploring Now",
      past: "Some Past Experiments",
      site: "About This Website",
      later: "Going Forward",
    },
  },
  past: {
    note: {
      zh: "有些已经完成，有些留下了一点遗憾，不过它们都算是这段经历的一部分。",
      en: "Some were completed, others left a little regret — all of them are part of the journey.",
    } as I18n,
    cards: [
      {
        kind: "patents",
        title: { zh: "参与过的专利", en: "Patents I contributed to" },
        body: {
          zh: "围绕三维网格、牙模几何与数据标注的一些尝试。点击这一帧，查看证书和专利记录。",
          en: "Experiments with 3D meshes, dental geometry and data annotation. Open this frame for certificates and patent records.",
        },
        image: "/images/blogimages/welcome_xuanyao.jpg",
      },
      {
        date: "2026.06",
        title: { zh: "从零搭建这个网站", en: "Building this site" },
        body: {
          zh: "从古法 PPT 到个人主页，第一次把自己的内容放到网上。",
          en: "From old-school slides to a personal homepage — putting my work online for the first time.",
        },
        postSlug: "0611",
        link: { href: "/blog/0611", label: { zh: "阅读建站记录", en: "Read the story" } },
      },
      {
        date: "2026.07",
        title: { zh: "当迭代开始倒退", en: "When iteration goes backwards" },
        body: {
          zh: "一次游戏开发中的失控与回退，以及重新思考开发策略。",
          en: "Losing control during game development, rolling back, and rethinking strategy.",
        },
        postSlug: "0817",
        link: { href: "/blog/0817", label: { zh: "阅读开发记录", en: "Read the notes" } },
      },
      {
        date: "2026.09",
        title: { zh: "第一款独立游戏", en: "My first indie game" },
        body: {
          zh: "一款偏女性向审美的都市剧情轻游戏，把一个想法慢慢做成了游戏。",
          en: "A light urban story game — turning an idea into something playable, slowly.",
        },
        postSlug: "0930",
        link: { href: "/blog/0930", label: { zh: "了解这款游戏", en: "About the game" } },
      },
      {
        date: "Next",
        title: { zh: "试玩版 · 筹备中", en: "Playable build · coming" },
        body: {
          zh: "正在完善稳定的下载 / 试玩方式，准备好之后会放在这里。",
          en: "Working on a stable way to download and play. It will land here when ready.",
        },
      },
    ] as PastCardConfig[],
  },
  elsewhere: [
    { href: "/blog", zh: "我写的东西", en: "Writings" },
    { href: "/friendship_links", zh: "友情链接", en: "Friends" },
    { href: "/ink", zh: "水墨", en: "Ink" },
    { href: "https://github.com/3dsfgs", zh: "开源项目", en: "GitHub" },
  ] as { href: string; zh: string; en: string }[],
};
