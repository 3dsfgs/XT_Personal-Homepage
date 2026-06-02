/*
 * @Author: kasuie
 * @Date: 2024-05-31 13:22:52
 * @LastEditors: kasuie
 * @LastEditTime: 2025-02-22 19:54:25
 * @Description:
 */
import { HTMLAttributes } from "react";
import { clsx } from "@kasuie/utils";
import { Avatar } from "../ui/image/Avatar";
import { getMotion } from "@/lib/motion";
import {
  AvatarConfig,
  Link,
  Site,
  SitesConfig,
  SlidersConfig,
  SocialConfig,
  SubTitleConfig,
} from "@/config/config";
import { TextEffect } from "../effect/TextEffect";
import { SocialIcons } from "../social-icons/SocialIcons";
import { Links } from "../links/Links";
import { Sliders } from "../sliders/Sliders";
interface VerticalProps extends HTMLAttributes<HTMLDivElement> {
  gapSize: string;
  name: string;
  avatarConfig?: AvatarConfig;
  subTitleConfig?: SubTitleConfig;
  sitesConfig?: SitesConfig;
  socialConfig?: SocialConfig;
  istTransition: boolean;
  links: Link[];
  staticSites: Site[];
  modalSites: Site[];
  primaryColor?: string;
  subTitle?: string;
  sliders?: SlidersConfig;
  cardOpacity?: number;
  footers?: number;
}

export function Vertical({
  gapSize,
  name,
  avatarConfig,
  subTitleConfig,
  sitesConfig,
  socialConfig,
  istTransition,
  links,
  staticSites,
  modalSites,
  primaryColor,
  subTitle,
  sliders,
  cardOpacity = 0.1,
  className,
  footers = 0,
  ...others
}: VerticalProps) {
  return (
    <div
      className={clsx(
        "relative z-[1] flex w-full flex-col items-center justify-center pb-16",
        {
          // 调整后的示例
          "gap-4 pt-[5vh]": gapSize == "sm",  // 间距变小，整体往上提
          "gap-6 pt-[8vh]": gapSize == "md",
          "gap-8 pt-[7vh]": gapSize == "lg",
          "!pb-12": footers > 2,                // 底部留白变得更大    
          [`${className}`]: className,
        }
      )}
      {...others}
    >
      {!avatarConfig?.hidden && (
        <Avatar
          priority
          isShowMotion
          alt={name}
          src={avatarConfig?.src || ""}
          motions={getMotion(0.1, 0, 0, istTransition)}
          animateStyle={avatarConfig?.style}
          {...avatarConfig}
          style={""}
        />
      )}
      <TextEffect
        {...subTitleConfig}
        motions={getMotion(0.1, 1, 0.2, istTransition)}
        text={subTitle}
      ></TextEffect>
      {(subTitleConfig?.content || subTitleConfig?.desc) && (
        <div className="relative z-[1] mx-4 -mt-4 flex max-w-3xl flex-col items-center gap-1 text-center text-sm leading-6 text-white/70 sm:mx-0 sm:text-base">
          {subTitleConfig?.content ? (
            <p className="text-white/80">{subTitleConfig.content}</p>
          ) : null}
          {subTitleConfig?.desc ? (
            <p className="text-white/55">{subTitleConfig.desc}</p>
          ) : null}
        </div>
      )}
      <SocialIcons
        {...socialConfig}
        motions={getMotion(0.1, 2, 0.2, istTransition)}
        links={links}
      />
      {!sitesConfig?.hidden && (
        <Links
          sitesConfig={sitesConfig}
          motions={getMotion(0.1, 3, 0.2, istTransition)}
          primaryColor={primaryColor}
          staticSites={staticSites}
          modalSites={modalSites}
          cardOpacity={cardOpacity}
        />
      )}
      {!sliders?.hidden && (
        <Sliders
          motions={getMotion(0.1, 4, 0.2, istTransition)}
          cardOpacity={cardOpacity}
          {...sliders}
        />
      )}
    </div>
  );
}
