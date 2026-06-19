/*
 * @Description: 友情链接静态页面
 */
import React from "react";

// 定义链接数据结构
interface LinkItem {
  name: string;
  url: string;
  desc: string;
}

interface LinkGroup {
  category: string;
  links: LinkItem[];
}

export default function FriendshipLinks() {
  // 友情链接数据
  const linkData: LinkGroup[] = [
    {
      category: "资源类",
      links: [
        // { name: "免费PPT模板", url: "https://www.pptsupermarket.com/", desc: "高质量演示文稿模板库" },
        { name: "免费字体", url: "https://font.icu/", desc: "开源免费字体收集" },
        { name: "软仓windows", url: "https://www.ruancang.net/", desc: "实用软件资源分享站" },
      ],
    },
    {
        category: "设计类",
        links: [
          { name: "Design Prompts", url: "https://www.designprompts.dev/", desc: "AI驱动的设计风格探索与灵感平台" },
          { name: "getdesign.md", url: "https://getdesign.md/", desc: "面向AI编程智能体的DESIGN.md设计系统集合" },
        ],
    },
    {
        category: "其他工具",
        links: [
          { name: "色卡", url: "https://colordrop.io/", desc: "精美的色彩搭配调色板集合" },
          { name: "拆字", url: "https://www.qqxiuzi.cn/zh/chaizi.htm", desc: "汉字拆分与结构分析工具" },
          { name: "草料二维码", url: "https://cli.im/", desc: "免费且功能强大的二维码生成器" },
          { name: "封面生成器", url: "https://cover.ciriu.com/", desc: "生成简洁美观的封面" },
        ],
    },
    {
      category: "我喜欢的文章",
      links: [
        { name: "提问的智慧", url: "https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md", desc: "你所提技术问题的解答的好坏，很大程度上取决于你提问的方式与此问题的难度" },
        { name: "排版艺术", url: "https://re.karlbaey.top/articles/typography/", desc: "关于文字排版的审美与艺术" },
        { name: "Easy-Vibe 知识库", url: "https://datawhalechina.github.io/easy-vibe/zh-cn/appendix/", desc: "出自DataWhale,涵盖从计算机基础、前端、后端、系统设计、基础设施到人工智能的完整知识体系" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* 头部标题 */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            友情链接
          </h1>
          <p className="text-gray-400 text-sm">常用的一些网址与推荐内容</p>
        </header>

        {/* 分组内容 */}
        {linkData.map((group, gIdx) => (
          <section key={gIdx} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-800 text-gray-300 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              {group.category}
            </h2>
            
            {/* 卡片栅格布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.links.map((link, lIdx) => (
                <a
                  key={lIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                      {link.name}
                    </h3>
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                      ↗
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {link.desc}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* 返回主页按钮 */}
        <footer className="mt-16 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            ← 返回主页
          </a>
        </footer>
      </div>
    </div>
  );
}