/* eslint-disable @next/next/no-img-element -- Local archive certificate. */

import { patents, type I18n } from "@/content/about";
import { Icon, Watermark, pad } from "./reference-parts";

export function PatentDetails({ t, image }: { t: (value: I18n) => string; image: string }) {
  return (
    <div className="yu-patent-details">
      <header className="yu-patent-details__head">
        <p className="oo-label">Archive / Frame 01 — Patents</p>
        <h2 id="yu-patent-dialog-title">
          {t({ zh: "参与过的专利", en: "Patents I contributed to" })}
        </h2>
        <Watermark kind="axes" className="yu-watermark--patents" />
      </header>
      <div className="yu-patents-grid">
        <figure className="oo-plate yu-patent-plate">
          {["tl", "tr", "bl", "br"].map((corner) => (
            <span className={`oo-crop oo-crop--${corner}`} key={corner} aria-hidden="true" />
          ))}
          <img src={image} alt={t({ zh: "部分专利证书", en: "Selected patent certificates" })} />
          <figcaption className="oo-plate__cap">
            <span>
              <span className="oo-amber-text">Fig.01</span> /{" "}
              {t({ zh: "部分专利证书", en: "Selected certificates" })}
            </span>
          </figcaption>
        </figure>
        <div>
          <p className="oo-label">
            {patents.filter((p) => p.status.zh === "已授权").length} Granted / {pad(patents.length)}{" "}
            Records
          </p>
          <table className="oo-models__table yu-patents-table">
            <thead>
              <tr>
                <th className="oo-models__no">No.</th>
                <th>{t({ zh: "专利 / Patent", en: "Patent" })}</th>
                <th>{t({ zh: "状态 / Status", en: "Status" })}</th>
              </tr>
            </thead>
            <tbody>
              {patents.map((patent, i) => (
                <tr key={patent.title.zh}>
                  <td className="oo-models__no">{pad(i + 1)}</td>
                  <td>
                    {patent.href ? (
                      <a
                        className="oo-link oo-link--mono"
                        href={patent.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {patent.number}
                        <Icon size={12} className="oo-link__arrow" />
                      </a>
                    ) : (
                      <span className="oo-label">{t({ zh: "申请中", en: "Filed" })}</span>
                    )}
                    <span className="yu-patent-title">{t(patent.title)}</span>
                    <span className="yu-patent-role">{t(patent.role)}</span>
                  </td>
                  <td>
                    <span
                      className={`yu-patent-status ${patent.status.zh === "已授权" ? "is-granted" : ""}`}
                    >
                      {t(patent.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
