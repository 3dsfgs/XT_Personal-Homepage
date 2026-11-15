import { ALink, DotFilled, ExternalLink, Globe } from "@kasuie/icon";
import type { SVGProps } from "react";

export { ALink, DotFilled, ExternalLink, Globe };

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 16, ...rest } = props;
  return { width: size, height: size, ...rest };
}

/** 细线左箭头，替代裸字符 ← */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...base(props)}>
      <path d="M13 8H3M7 3.5 3 8l4 4.5" />
    </svg>
  );
}

/** 细线右箭头，替代裸字符 → */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...base(props)}>
      <path d="M3 8h10M9 3.5 13 8l-4 4.5" />
    </svg>
  );
}

/** 十字四向箭头，替代实心 DRAG 徽标里的文字 */
export function DragIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...base(props)}>
      <path d="M8 2v12M2 8h12M5.5 4.5 8 2l2.5 2.5M5.5 11.5 8 14l2.5-2.5M4.5 5.5 2 8l2.5 2.5M11.5 5.5 14 8l-2.5 2.5" />
    </svg>
  );
}

/** 细线十字星，替代裸字符 ✳ */
export function SparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...base(props)}>
      <path d="M8 1.5v13M1.5 8h13M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}
