import { aboutConfig } from "@/content/about";
import { firstImageOfPost, getAboutSections } from "@/lib/about";
import { AboutExperience } from "./AboutExperience";
import "./fonts.css";
import "./reference.css";
import "./about.css";

export const metadata = {
  title: "关于我 | 博客",
  description: "关于独立开发、技术试错、北京生活，以及一些过去与现在的记录。",
};

export default function AboutPage() {
  const sections = getAboutSections();
  // 轮播卡片：关联文章时自动取文章中的第一张图片
  const cards = aboutConfig.past.cards.map((card) => ({
    ...card,
    image: (card.postSlug && firstImageOfPost(card.postSlug)) || card.image || null,
  }));

  return <AboutExperience sections={sections} cards={cards} />;
}
