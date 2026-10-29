'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { attachmentQuestions, loveQuestions } from './questions';
import { calculateScores, type Answers, type Mode, type Score } from './scoring';
import { storyGroups } from './storyData';
import { toTraditional } from './language';
import './love.css';

type Module = Mode | 'story';
type Screen = 'home' | 'quiz' | 'result' | 'story';
type Theme = 'night' | 'sunset' | 'paper';
type Locale = 'zh-CN' | 'zh-TW';

// Translate the rendered text tree, not the question IDs/values/URLs. Keeps original scoring and React behavior intact.
function localizeTree(node: React.ReactNode, locale: Locale): React.ReactNode {
  if (locale === 'zh-CN') return node;
  if (typeof node === 'string') return toTraditional(node);
  if (Array.isArray(node)) return node.map(item => localizeTree(item, locale));
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{children?: React.ReactNode; title?: string; placeholder?: string; 'aria-label'?: string}>;
    const props: {children?: React.ReactNode; title?: string; placeholder?: string; 'aria-label'?: string} = {};
    if ('children' in element.props) props.children = localizeTree(element.props.children, locale);
    for (const attr of ['title', 'placeholder', 'aria-label'] as const) {
      const value = element.props[attr];
      if (typeof value === 'string') props[attr] = toTraditional(value);
    }
    return React.cloneElement(element, props);
  }
  return node;
}


const THEMES: { id: Theme; label: string; mark: string }[] = [
  { id: 'night', label: '夜色星图', mark: '✦' },
  { id: 'sunset', label: '暖色手账', mark: '☀' },
  { id: 'paper', label: '极简纸张', mark: '◌' },
];
const MODULES: { id: Module; order: string; eyebrow: string; title: string; desc: string; tag: string; image: string }[] = [
  { id: 'attachment', order: '01', eyebrow: 'ATTACHMENT', title: '人与人之间的距离', desc: '理解亲近、依赖、安全感与自我保护。探索你在人际关系中的四种依附倾向。', tag: '24 题 · 约 5 分钟', image: 'warmth' },
  { id: 'story', order: '02', eyebrow: 'LOVE AS A STORY', title: '爱，是一个故事', desc: '每个人都带着自己的爱情脚本。沿着五条路径，探索 26 种爱情故事原型。', tag: '互动地图 · 自由探索', image: 'map' },
  { id: 'love', order: '03', eyebrow: 'LOVE STYLE', title: '爱，是怎样的表达', desc: '从八个不同维度，看看自己如何看待承诺、浪漫、亲密与相处。', tag: '40 题 · 约 8 分钟', image: 'romance' },
];
const images: Record<string, string> = {
  secure: 'warmth', anxious: 'longing', fearful: 'distance', dismissive: 'solitude',
  ludus: 'distance', devotion: 'embrace', reserved: 'solitude', passion: 'warmth',
  marriage: 'companions', possessive: 'longing', sensory: 'romance', romance: 'romance',
};

function Radar({ scores }: { scores: Score[] }) {
  const cx = 240, cy = 218, r = 140;
  const pos = (i: number, level: number, offset = 0) => {
    const a = i * 2 * Math.PI / scores.length - Math.PI / 2;
    return [cx + Math.cos(a) * (r * level + offset), cy + Math.sin(a) * (r * level + offset)];
  };
  const poly = (level: number) => scores.map((_, i) => pos(i, level).join(',')).join(' ');
  const chart = scores.map((s, i) => pos(i, s.value / s.max).join(',')).join(' ');
  return <svg className="love-radar" viewBox="0 0 480 440" role="img" aria-label={scores.map(s => `${s.name}${s.value}分`).join('，')}>
    <defs><linearGradient id="loveRadarFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f9b8be" stopOpacity=".75"/><stop offset="1" stopColor="#9b9ef6" stopOpacity=".28"/></linearGradient></defs>
    {[.2, .4, .6, .8, 1].map(level => <polygon key={level} points={poly(level)} fill="none" stroke="currentColor" strokeOpacity=".16" strokeWidth="1"/>)}
    {scores.map((s, i) => {const [x,y]=pos(i,1);return <line key={s.id} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity=".16"/>;})}
    <polygon points={chart} fill="url(#loveRadarFill)" stroke="#ec9da9" strokeWidth="2.5" strokeLinejoin="round" />
    {scores.map((s,i) => {const [x,y]=pos(i,s.value/s.max);return <circle key={s.id} cx={x} cy={y} r="4" fill={s.hue} stroke="var(--l-card)" strokeWidth="2"/>;})}
    {scores.map((s,i) => {
      const [x,y]=pos(i,1,28);
      return <text key={s.id} x={x} y={y-3} textAnchor="middle" dominantBaseline="central" className="love-radar-label">
        <tspan x={x}>{s.name}</tspan><tspan x={x} dy="17" fill={s.hue} fontWeight="700">{s.value} / {s.max}</tspan>
      </text>;
    })}
  </svg>;
}

function SourceFooter({ locale }: { locale: Locale }) {
  return localizeTree(<section className="love-sources" aria-label="资料来源与致谢">
    <details className="love-sources-disclosure">
      <summary className="love-sources-toggle">
        <span className="love-sources-toggle-text"><strong>资料来源与致谢</strong><small>课程出处、引用说明与隐私承诺</small></span>
        <span className="love-sources-caret" aria-hidden="true" />
      </summary>
      <div className="love-sources-body">
        <p>本栏目参考国立云林科技大学陈斐娟老师的「情感教育」公开课程介绍与用户提供的相关课堂资料。人际依附风格量表原编制署名：王庆福（1997）；爱情风格量表依据所提供的《台湾人爱情风格量表》及计分说明整理。</p>
        <p>爱情故事地图以 Robert J. Sternberg 的《Love Is a Story》及所提供的《爱是一个故事》教学讲义为依据，标注讲义页码。文本转为简体中文以供阅读，内容所呈现的主张属于原始教学资料，不代表本站赞同全部观点。</p>
        <div className="love-source-links">
          <a href="https://www.ewant.org/admin/tool/mooccourse/mnetcourseinfo.php?hostid=34&id=17590" target="_blank" rel="noopener noreferrer">ewant 情感教育课程介绍 ↗</a>
          <a href="https://www.ewant.org/admin/tool/mooccourse/mnetcourseinfo.php?hostid=34&id=17932" target="_blank" rel="noopener noreferrer">2026 年课程详情 ↗</a>
          <a href="https://academic.oup.com/book/53818" target="_blank" rel="noopener noreferrer">Sternberg 原著信息 ↗</a>
          <a href="https://www.tipo.gov.tw/tw/copyright/701-21232.html" target="_blank" rel="noopener noreferrer">知识产权与合理引用说明 ↗</a>
          <a href="/friendship_links">返回友情链接 ↗</a>
        </div>
        <p className="love-source-note">版权说明：本页面旨在学习、研究与知识分享，原著及教学材料的权利归各权利人所有，标注来源不代表获得授权。若发现未经许可的内容，请通过本站公开联系渠道告知，我们将核实并及时撤下或修正相关内容。联系或下架请求不影响依法可能承担的责任。</p>
        <p className="love-source-note">上线提醒：完整课堂讲义、测试题目的公开转载可能需要另行授权。尚未核实公开传播许可时，请将引用原题和原文例句的部分保持非公开；这里的出处声明不能替代授权。</p>
        <p className="love-source-note">隐私说明：作答记录只在当前浏览器页面的 React 内存中处理，页面不主动将答案提交到服务器，也不使用 localStorage 储存；刷新或离开后即清除。请另外核对网站全局统计、日志或第三方脚本的实际隐私行为。</p>
        <p className="love-source-note">插画由 AI 辅助制作；结果供自我探索与交流，不属于临床心理诊断。</p>
      </div>
    </details>
  </section>, locale) as React.ReactElement;
}

export default function LoveExplorer() {
  const [theme, setTheme] = useState<Theme>('night');
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [module, setModule] = useState<Module>('attachment');
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<Answers>({});
  const [cursor, setCursor] = useState(0);
  const [groupId, setGroupId] = useState(storyGroups[0].id);
  const [storyId, setStoryId] = useState(storyGroups[0].items[0].id);
  const [chosen, setChosen] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const captureRef = useRef<HTMLDivElement>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);
  // Only on chapter changes: avoid carrying the previous page's scroll position into a new screen.
  // Next/previous question deliberately does NOT scroll or move the viewport.
  useEffect(() => {
    const anchor = contentTopRef.current;
    if (!anchor || typeof window === 'undefined') return;
    const rect = anchor.getBoundingClientRect();
    if (rect.top < -20 || rect.top > window.innerHeight * 0.65) {
      window.scrollTo({ top: window.scrollY + rect.top - 12, behavior: 'instant' });
    }
  }, [screen]);
  // When answering from the bottom of a long question, reveal the next card only if hidden.
  // Otherwise preserve the exact current scroll position without page jumps.
  useEffect(() => {
    if (screen !== 'quiz' || !questionCardRef.current) return;
    const rect = questionCardRef.current.getBoundingClientRect();
    if (rect.bottom < 110 || rect.top > window.innerHeight - 100) {
      window.scrollTo({ top: window.scrollY + rect.top - 18, behavior: 'instant' });
    }
  }, [cursor, screen]);

  const questions = module === 'attachment' ? attachmentQuestions : loveQuestions;
  const n = questions.length;
  const answered = Object.keys(answers).length;
  const complete = answered === n;
  const scores = useMemo(() => {
    if (screen !== 'result' || module === 'story') return [];
    try { return calculateScores(module, answers); } catch { return []; }
  }, [screen, module, answers]);
  const primary = [...scores].sort((a,b)=>b.value / b.max - a.value / a.max)[0];
  const group = storyGroups.find(s => s.id === groupId) ?? storyGroups[0];
  const story = group.items.find(s => s.id === storyId) ?? group.items[0];
  const selectedStories = storyGroups.flatMap(s => s.items).filter(s => chosen.includes(s.id));
  const start = (m: Module) => { setModule(m);setAnswers({});setCursor(0);setHint('');setChosen([]);setScreen(m === 'story' ? 'story' : 'quiz'); };
  const goHome = () => {setScreen('home');setAnswers({});setCursor(0);setChosen([]);setHint('');};
  const next = () => {
    if (!answers[cursor + 1]) {setHint('先选一个最符合你此刻真实感受的选项。');return;}
    if (cursor < n-1) setCursor(c=>c+1);
    else if (complete) {setScreen('result');setHint('');}
    else {const firstMissing = Array.from({length:n},(_,i)=>i).find(i=>!answers[i+1]); if (firstMissing !== undefined) setCursor(firstMissing);}
  };
  const download = async () => {
    if (!captureRef.current) return;
    setHint('');
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(captureRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: theme==='night'?'#172235':'#fff9f4' });
      const a = document.createElement('a');a.href=url;a.download=`love-explorer-${module}-${new Date().toISOString().slice(0,10)}.png`;a.click();
    } catch (e) {console.error(e);setHint('截图生成失败，可尝试使用 Chrome/Edge 重新保存，或直接使用浏览器截图。');}
  };

  return localizeTree(<div className="love-ui" data-theme={theme} lang={locale}>
    <div className="love-wrap">
      <div ref={contentTopRef} aria-hidden="true" className="love-content-anchor" />
      <nav className="love-nav" aria-label="栏目导航">
        <button type="button" className="love-wordmark" onClick={goHome}><span className="love-logo">✳</span><span>LOVE <b>&</b> RELATIONSHIPS</span></button>
        <div className="love-nav-right"><span className="love-privacy">◉ 不保存答题记录</span><a href="/friendship_links">↗ 友情链接</a></div>
      </nav>
      <div className="love-themes" aria-label="切换视觉风格"><div className="love-language" aria-label="切换中文语言"><button type="button" className={locale==='zh-CN'?'is-active':''} aria-pressed={locale==='zh-CN'} onClick={()=>setLocale('zh-CN')}>简体</button><button type="button" className={locale==='zh-TW'?'is-active':''} aria-pressed={locale==='zh-TW'} onClick={()=>setLocale('zh-TW')}>繁體</button></div><span>视觉风格</span>{THEMES.map(t=><button key={t.id} type="button" aria-pressed={theme===t.id} className={theme===t.id?'is-active':''} onClick={()=>setTheme(t.id)}>{t.mark} {t.label}</button>)}</div>

      {screen==='home' && <>
        <header className="love-hero">
          <div className="love-hero-text"><span className="love-kicker">A QUIET PLACE TO UNDERSTAND LOVE · VOL. 01</span><h1>关于爱，<br/><em>我们还有很多</em><br/>可以了解。</h1><p>爱不是一张测验结果，而是一段不断认识自己、理解他人，也学会照顾边界的旅程。</p><div className="love-hero-meta"><span>✦ 三个探索章节</span><span>✦ 完全匿名</span><span>✦ 随时可以重新开始</span></div></div>
          <div className="love-hero-picture" style={{backgroundImage:"url('/images/love-explorer/companions.webp')"}} aria-hidden="true"><div className="love-hero-sticker">SOME STORIES<br/>ARE WORTH<br/>UNDERSTANDING ♡</div></div>
        </header>
        <div className="love-section-heading"><div><span className="love-kicker">THREE CHAPTERS</span><h2>选择你的探索章节</h2></div><p>可以按顺序体验，也可以从任何一章开始。</p></div>
        <div className="love-module-grid">{MODULES.map(m=><button type="button" key={m.id} className="love-module" onClick={()=>start(m.id)}>
          <div className="love-module-art" style={{backgroundImage:`url('/images/love-explorer/${m.image}.webp')`}}><span className="love-module-number">{m.order} / 03</span></div>
          <div className="love-module-body"><span className="love-kicker">{m.eyebrow}</span><h3>{m.title}</h3><p>{m.desc}</p><div className="love-module-bottom"><span>{m.tag}</span><span className="love-arrow">↗</span></div></div>
        </button>)}</div>
        <div className="love-notice">✧ <b>一份轻柔的提醒</b>　没有一种爱情风格可以定义你。题目描述的是某些倾向，而不是决定你是谁，更不决定你能否拥有好的关系。</div>
      </>}

      {screen==='quiz' && <div className="love-quiz-wrap"><button type="button" className="love-back" onClick={goHome}>← 返回三个章节</button>
        <div className="love-quiz-header"><div><span className="love-kicker">{module === 'attachment' ? 'CHAPTER 01 · ATTACHMENT' : 'CHAPTER 03 · LOVE STYLE'}</span><h1>{module==='attachment'?'人与人之间的距离':'爱，是怎样的表达'}</h1></div><span className="love-counter">{String(cursor+1).padStart(2,'0')} <small>/ {n}</small></span></div>
        <div className="love-progress" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={answered} aria-label="已完成题数"><div style={{width:`${answered/n*100}%`}}/></div>
        <div className="love-quiz-card" ref={questionCardRef}><div className="love-question-overline">QUESTION {String(cursor+1).padStart(2,'0')} <span>· 按照真实感受回答</span></div>
          <fieldset><legend>{questions[cursor]}</legend><div className="love-scale-names"><span>非常不符合 / 不同意</span><span>非常符合 / 同意</span></div>
          <div className="love-answer-grid">{[1,2,3,4,5,6].map(num=><label key={num} className={answers[cursor+1]===num?'is-picked':''}>
             <input type="radio" name={`question-${cursor+1}`} checked={answers[cursor+1]===num} onChange={()=>{setAnswers(prev=>({...prev,[cursor+1]:num}));setHint('');}} value={num}/><span>{num}</span>
          </label>)}</div></fieldset>
        </div>
        <div className="love-quiz-actions"><button type="button" className="love-quiet-btn" disabled={cursor===0} onClick={()=>{setCursor(c=>c-1);setHint('');}}>← 上一题</button><span>{answered} / {n} 已作答</span><button type="button" className="love-primary-btn" disabled={!answers[cursor+1]} onClick={next}>{cursor===n-1?'完成并查看结果 ↗':'下一题 →'}</button></div>
        {hint && <p className="love-alert" role="status">{hint}</p>}
        <p className="love-privacy-bottom">🔒 不需要登录；答案保存在此页面的运行内存中，离开或刷新即清空。</p>
      </div>}

      {screen==='result' && primary && <div className="love-result-wrap"><button type="button" className="love-back" onClick={goHome}>← 返回三个章节</button>
        <div className="love-result-intro"><span className="love-kicker">YOUR PERSONAL REFLECTION</span><h1>关于你与爱的<br/><em>一张小小地图。</em></h1><p>这张图记录的是你此刻的回答。分数越高，代表对应描述与你当前感受的符合程度越高，而不是“好坏排名”。</p></div>
        <div className="love-result-card" ref={captureRef}><div className="love-result-top"><div><span className="love-kicker">LOVE & RELATIONSHIPS · PERSONAL CARD</span><h2>{module==='attachment'?'人际依附风格探索':'我的爱情风格图'}</h2><p>你的各维度倾向 · 原始量表分数</p></div><span className="love-result-logo">✳</span></div>
          <div className="love-result-main"><div className="love-radar-side"><Radar scores={scores}/></div><div className="love-result-story"><div className="love-result-image" style={{backgroundImage:`url('/images/love-explorer/${images[primary.id] ?? 'warmth'}.webp')`}} aria-hidden="true"/>
          <span className="love-kicker">MOST PROMINENT TENDENCY</span><h3>{primary.name}</h3><p>{primary.description}</p><small>最高维度并不代表唯一风格；多种倾向可以同时存在，也会随经历改变。</small></div></div>
          <div className="love-score-list">{scores.map(s=><div key={s.id} className="love-score-row"><div><span style={{background:s.hue}} className="love-score-dot"/>{s.name}</div><div className="love-score-track"><span style={{width:`${s.value/s.max*100}%`,background:s.hue}}/></div><strong>{s.value}<small> / {s.max}</small></strong></div>)}</div>
          <div className="love-result-footer">✦ 一份关于此刻的记录 · 仅供自我探索参考 <span>LOVE, AS YOU ARE.</span></div>
        </div>
        <div className="love-result-actions"><button type="button" className="love-primary-btn" onClick={download}>↓ 保存结果截图 PNG</button><button type="button" className="love-quiet-btn" onClick={()=>{setAnswers({});setCursor(0);setScreen('quiz');}}>重新作答 ↻</button></div>{hint&&<p className="love-alert">{hint}</p>}
      </div>}

      {screen==='story' && <div className="love-map-wrap"><button type="button" className="love-back" onClick={goHome}>← 返回三个章节</button><div className="love-map-intro"><span className="love-kicker">CHAPTER 02 · YOUR LOVE STORY ATLAS</span><h1>每段爱情，<br/><em>都有自己的故事。</em></h1><p>点击五个故事区域，在 26 种原型中发现共鸣。你可以收藏最多五种故事，生成一张只属于此刻的探索地图。</p></div>
        <div className="love-map-workspace"><section className="love-story-atlas" aria-label="爱情故事分类地图" ref={captureRef}>
          <div className="love-story-atlas-title"><span className="love-kicker">STERNBERGS LOVE STORIES · FIVE REGIONS</span><h2>LOVE STORY ATLAS</h2></div>
          <div className="love-story-node-grid">{storyGroups.map(g=><button key={g.id} type="button" aria-pressed={group.id===g.id} onClick={()=>{setGroupId(g.id);setStoryId(g.items[0].id);}} style={{'--node-accent':g.color} as React.CSSProperties} className={`love-story-region ${g.id===group.id?'is-selected':''}`}><span className="love-story-emoji">{g.emoji}</span><strong>{g.name}</strong><small>{g.items.length} 种故事</small><span className="love-story-region-dots">{g.items.map(s=><i key={s.id} className={chosen.includes(s.id)?'picked':''}/>)}</span></button>)}</div>
          <div className="love-atlas-selected">你收藏的故事：{selectedStories.length ? selectedStories.map(s=>s.name).join(' · ') : '尚未选择，旅程正在开始'}</div>
          <div className="love-story-atlas-footer">“爱是一种故事，故事也可以被重新书写。” · 理论启发式可视化，非原始测验结果</div>
        </section>
        <aside className="love-story-details"><div className="love-story-group-head"><span style={{color:group.color}}>{group.emoji} {group.name}</span><h2>这一片故事区域</h2><p>{group.lead}</p></div><div className="love-story-chip-list">{group.items.map(s=><button key={s.id} className={story.id===s.id?'is-current':''} type="button" onClick={()=>setStoryId(s.id)}>{s.name}</button>)}</div><div className="love-story-interpret"><span className="love-kicker">STORY PROFILE</span><h3>{story.name}</h3><p>{story.summary}</p>
          <div className="love-story-material">
            <div className="love-story-material-title"><strong>讲义内容 · 相关观点与例句</strong><small>PDF 第 {story.excerpts.map(e=>e.page).join('、')} 页</small></div>
            {story.excerpts.map(excerpt => <section key={excerpt.page} className="love-story-page">
              <h4>{excerpt.subtype || story.name}<small>讲义第 {excerpt.page} 页</small></h4>
              <ul>{excerpt.items.map((item,i)=><li key={i}>{item}</li>)}</ul>
              <p className="love-story-citation">资料注明：{excerpt.reference}</p>
            </section>)}
          </div>
          <button type="button" className="love-primary-btn" onClick={()=>setChosen(prev=>prev.includes(story.id)?prev.filter(i=>i!==story.id):prev.length<5?[...prev,story.id]:prev)}>{chosen.includes(story.id)?'✓ 已收藏 · 点击取消':chosen.length>=5?'已达到 5 个上限':'＋ 这很像我的爱情想象'}</button></div></aside></div>
        <div className="love-result-actions"><button type="button" className="love-primary-btn" onClick={download}>↓ 保存我的故事地图</button><button type="button" className="love-quiet-btn" onClick={()=>setChosen([])}>清空选择 ↻</button></div>{hint&&<p className="love-alert">{hint}</p>}
        <details className="love-story-guide"><summary>阅读讲义：理解与调整爱情故事的方法（PDF 第 58–59 页）</summary>
          <div className="love-story-guide-body">
            <h4>讲义第 58 页：认识自己的爱情故事</h4>
            <ol>
              <li>思考上面提到的问题，给自己打分。</li>
              <li>思考何种人吸引你、何种事件在你与这些人的关系中发生，以及这些人和事件嵌入何种故事。</li>
              <li>问自己书里、电视上、电影里何种爱情故事吸引你。</li>
              <li>问别人他们对你的看法。</li>
            </ol>
            <h4>讲义第 59 页：理解与改写故事</h4>
            <ul>
              <li>了解伴侣的爱情故事。</li>
              <li>考虑你的理想故事与你所处的故事间的联系。</li>
              <li>试着将故事的优点极大化、缺点极小化。</li>
              <li>了解尽管故事引导我们如何选择伴侣、维持关系，但故事不控制关系或伴侣。</li>
              <li>了解故事影响发生在关系中的事件及对事件的诠释。</li>
              <li>了解故事是不断地被改写。</li>
              <li>懂得在一种故事内，有许多种写的方式。</li>
              <li>了解故事很难，但并不是不可能改变。</li>
            </ul>
            <small>来源：用户提供《爱是一个故事》课程讲义第 58–59 页，课件注明 Sternberg（1999: 278–281）；转为简体字形便于阅读。</small>
          </div>
        </details>
        <p className="love-map-footnote">注：故事节点的简述是为了帮助浏览与思考，并非完整的原版故事测验；选中数量不构成正式的心理测量分数。</p>
      </div>}
      {screen==='home' && <SourceFooter locale={locale}/>}
    </div>
  </div>, locale) as React.ReactElement;
}
