/*
 * @Author: kasuie
 * @Date: 2024-05-22 19:32:38
 * @LastEditors: kasuie
 * @LastEditTime: 2026-04-28 15:25:40
 * @Description:
 */
"use client";
import { Image } from "@/components/ui/image/Image";
import useModal from "@/components/ui/modal/useModal";
import { Modal } from "@/components/ui/modal/Modal";
import Link from "next/link";
import { ExternalLink, DotsHorizontal } from "@kasuie/icon";
import { clsx } from "@kasuie/utils";
import { Site, SitesConfig } from "@/config/config";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { CSSProperties } from "react";

const FlipCard = dynamic(
  async () => (await import("../cards/FlipCard")).FlipCard
);

export function Links({
  staticSites,
  modalSites,
  primaryColor,
  cardOpacity,
  sitesConfig = {
    hoverScale: true,
    hoverBlur: true,
    modal: true,
  },
  motions = {},
}: {
  primaryColor?: string;
  cardOpacity?: number;
  staticSites: Array<Site>;
  modalSites: Array<Site>;
  sitesConfig?: SitesConfig;
  motions?: object;
}) {
  const { isVisible, openModal, closeModal } = useModal();

  const itemContent = (item: Site, outer: boolean = true) => {
    const style: CSSProperties = outer
      ? {
          backgroundColor: `rgba(var(--mio-main), ${cardOpacity})`,
        }
      : {};

    if (sitesConfig.cardStyle == "flip") {
      return (
        <FlipCard
          data={item}
          outer={outer}
          style={style}
          direction={sitesConfig?.direction}
          hoverFlip={sitesConfig?.hoverFlip}
          warpClass="h-full w-full min-w-0"
        />
      );
    }

    const className = clsx(
      "group/main relative z-[1] flex h-[72px] flex-row flex-nowrap items-center gap-[8px] overflow-hidden rounded-2xl bg-black/10 p-[8px_12px] duration-500 hover:z-10 hover:border-transparent hover:!blur-none shadow-mio-link",
      {
        "hover:!scale-110 backdrop-blur-[7px]": outer,
        "group-hover/links:scale-90": sitesConfig.hoverScale,
        "group-hover/links:blur-[1px]": sitesConfig.hoverBlur,
      }
    );

    return (
      <div style={style} className={className}>
        {/* {animate && (
          <div className="absolute left-[20px] right-0 top-24 z-[-1] h-[25rem] w-[25rem] rotate-[-36deg] rounded-full bg-[#3651cf26] duration-500 group-hover/main:left-[-20px] group-hover/main:top-[-20px]"></div>
        )} */}
        {item.icon && (
          <div className="shrink-0 p-[3px]">
            <Image
              alt={item.title}
              src={item.icon}
              width={36}
              height={36}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                height: "36px",
                width: "36px",
              }}
            ></Image>
          </div>
        )}
        <div className="min-w-0 p-[4px]">
          {item.title && (
            <p className="truncate text-[15px] leading-5 text-white">
              {item.title}
            </p>
          )}
          {item.desc && (
            <p className="truncate pt-[6px] text-[13px] leading-5 text-white/70">
              {item.desc}
            </p>
          )}
        </div>
        <span className="absolute bottom-[5px] right-[7px] text-white/70">
          {item?.url ? (
            <ExternalLink size={14} />
          ) : (
            <DotsHorizontal size={14} />
          )}
        </span>
      </div>
    );
  };

  const linkItem = (item: Site, key: number, outer: boolean = true) => {
    const isExternalUrl = /^https?:\/\//i.test(item.url || "");
    return (
      <div
        key={key}
        title={item.title}
        className={clsx(
          "flex min-w-0 cursor-pointer flex-col justify-center",
          {
            "w-full": outer,
            "sm:mio-col-2 basis-full": !outer,
          }
        )}
      >
        {item?.url ? (
          <Link
            href={item.url}
            className="h-full w-full"
            target={isExternalUrl ? "_blank" : undefined}
            rel={isExternalUrl ? "noreferrer" : undefined}
          >
            {itemContent(item, outer)}
          </Link>
        ) : (
          <div
            onClick={() => sitesConfig?.modal && openModal()}
            className="h-full w-full"
          >
            {itemContent(item)}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      {...motions}
      className="group/links z-[1] mt-3 grid w-[95vw] grid-cols-1 gap-3 md:mt-8 md:w-[65vw] md:grid-cols-3"
    >
      {staticSites.map((v, index) => linkItem(v, index))}
      {sitesConfig?.modal && modalSites?.length ? (
        <Modal
          className="w-[650px]"
          visible={isVisible}
          title={sitesConfig?.modalTitle}
          closeModal={closeModal}
        >
          {sitesConfig?.modalTips && (
            <div className="relative pb-2 indent-5 text-sm text-white/90 before:absolute before:left-[7px] before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-[#229fff] before:content-[''] after:absolute after:left-[5px] after:top-[6px] after:h-2 after:w-2 after:rounded-full after:border after:border-[#229fff]">
              {sitesConfig.modalTips}
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-y-6">
            {modalSites.map((v, index) => linkItem(v, index, false))}
          </div>
        </Modal>
      ) : null}
    </motion.div>
  );
}
