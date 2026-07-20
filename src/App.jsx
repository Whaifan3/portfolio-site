import { useEffect, useMemo, useRef, useState } from "react";

import { ReactLenis } from "lenis/react";

import "lenis/dist/lenis.css";

import "@fontsource/inter/400.css";

import "@fontsource/inter/500.css";

import "@fontsource/inter/600.css";

import "@fontsource/cormorant-garamond/500-italic.css";

import Prism from "./Prism";

import ScrollStack, { ScrollStackItem } from "./ScrollStack";

import MagicBento from "./MagicBento";

import Strands from "./Strands";

import Folder from "./Folder";

import ProjectPanel from "./ProjectPanel";
import BorderGlow from "./BorderGlow";
import LiquidEther from "./LiquidEther";

import "./ProjectsEnhancements.css";
import "./ContactEnhancements.css";

import { flexclipProject, beanTennisProject } from "./projects-data";

import {

  ArrowDown,

  ArrowUp,

  ArrowUpRight,

  EnvelopeSimple,

  List,

  MapPin,

  Phone,

  X,

} from "@phosphor-icons/react";



const content = {zh:{role:"UI 设计师",nav:[["关于","#about"],["优势","#advantages"],["项目","#projects"],["联系","#contact"]],heroEyebrow:"成都 / 2026",heroTitle:["王海帆","VibeCoding","设计作品集"],heroSerif:["Design with clarity,","build with purpose."],scroll:"向下探索",aboutLabel:"关于我",aboutEn:"BIOGRAPHY",aboutLead:"近4年设计经验，专注 AI 产品与多端体验设计，为复杂用户创造清晰、可信、可落地的产品价值。",aboutBody:"我关注复杂问题的简单表达，擅长从商业目标与用户需求出发，构建设计系统与可复用组件，推动创意从协作与规范中稳定落地。无论从 0 到 1，还是持续迭代，我都重视设计成为产品增长与品牌信任的底座。",contactMe:"联系我",timeline:[{period:"2024.06 — 2026.03",company:"成都孚介科技有限公司",role:"UI 设计师",detail:"FlexClip AI 产品与视频编辑器"},{period:"2023.06 — 2024.03",company:"成都创元科技有限公司",role:"UI 设计师助理",detail:"景区业务产品全端体验"},{period:"2023.03 — 2023.06",company:"成都一片森林有限公司",role:"平面 / UI 设计师",detail:"官网、品牌与活动视觉"},{period:"2021.09 — 2023.06",company:"重庆外语外事学院",role:"视觉传达 · 本科",detail:"设计与传播制作"}],projectsLabel:"精选项目",projectsEn:"SELECTED WORKS",projectHint:"点击查看项目摘要",projects:[{index:"01",title:"FlexClip AI",meta:"AI 产品设计 · Web / Mobile · 设计系统",summary:"参与千万级在线视频剪辑产品设计，负责 AI 工具从 0 到 1 的搭建与持续迭代，覆盖图像、视频与音频生成场景。",tags:["AI Tools","Web","Mobile","Design System"]},{index:"02",title:"豆子网球",meta:"品牌视觉 · 小程序 UI · 体验设计",summary:"从品牌视觉系统到小程序核心体验，建立年轻、活力且可扩展的产品语言，连接场馆、课程与运动数据。",tags:["Brand VI","Mini Program","UX","Visual System"]}],advantagesLabel:"个人优势",advantagesEn:"ADVANTAGES",advantagesIntro:"以系统化方法与协作思维，让设计更清晰、更高效、更可持续。",advantages:[["01","AI 产品设计","理解 AI 场景与用户心智，打通可用、可懂、可信赖的智能体验。"],["02","多端体验","覆盖 Web、移动端与小程序，建立一致的体验语言与交互规范。"],["03","设计系统","构建可扩展的组件与规范，提升一致性、复用率与交付效率。"],["04","跨团队协作","与产品、研发、市场紧密协作，推动从策略到落地的闭环。"],["05","结果导向","关注业务指标与用户价值，用设计推动增长与品牌信任。"]],contactLabel:"联系我",contactEn:"LET'S CONNECT",contactTitle:"一起打造清晰、可信、可落地的数字体验。",contactCta:"发起合作",projectNote:"当前为基础预览版本，高清案例图片将在素材补齐后加入。",close:"关闭",backTop:"返回顶部",copyright:"? 2026 王海帆. All rights reserved."},en:{role:"UI Designer",nav:[["About","#about"],["Strengths","#advantages"],["Projects","#projects"],["Contact","#contact"]],heroEyebrow:"Chengdu / 2026",heroTitle:["Wang Haifan","VibeCoding","Design Portfolio"],heroSerif:["Design with clarity,","build with purpose."],scroll:"Scroll to explore",aboutLabel:"About me",aboutEn:"BIOGRAPHY",aboutLead:"Nearly four years of design experience focused on AI products and cross-platform experiences that make complex systems feel clear and dependable.",aboutBody:"I simplify complex problems by connecting business goals with real user needs. I build reusable systems, collaborate closely with product and engineering, and carry ideas from 0–1 through continuous iteration with care for quality and consistency.",contactMe:"Contact me",timeline:[{period:"2024.06 — 2026.03",company:"PearlMountain Technology",role:"UI Designer",detail:"FlexClip AI & video editor"},{period:"2023.06 — 2024.03",company:"Chengdu Chuangyuan Tech",role:"Assistant UI Designer",detail:"Cross-platform tourism products"},{period:"2023.03 — 2023.06",company:"Chengdu Yipian Forest",role:"Graphic / UI Designer",detail:"Web, brand & campaign design"},{period:"2021.09 — 2023.06",company:"CIFS University",role:"Visual Communication · BA",detail:"Design and communication"}],projectsLabel:"Selected works",projectsEn:"PROJECTS",projectHint:"Open project summary",projects:[{index:"01",title:"FlexClip AI",meta:"AI Product · Web / Mobile · Design System",summary:"Design for a video product serving over ten million global users, including 0–1 AI tools across image, video and audio generation workflows.",tags:["AI Tools","Web","Mobile","Design System"]},{index:"02",title:"Bean Tennis",meta:"Brand Identity · Mini Program · UX",summary:"A youthful, scalable visual and product system connecting tennis venues, coaching, courses and live performance data.",tags:["Brand VI","Mini Program","UX","Visual System"]}],advantagesLabel:"Strengths",advantagesEn:"ADVANTAGES",advantagesIntro:"Systems thinking and close collaboration make design clearer, faster and more sustainable.",advantages:[["01","AI product design","Translate AI capability into useful, understandable and trustworthy product experiences."],["02","Cross-platform UX","Build one coherent product language across web, mobile and mini-program surfaces."],["03","Design systems","Create scalable components and standards that improve consistency and delivery."],["04","Team collaboration","Partner with product, engineering and marketing from strategy through launch."],["05","Outcome focus","Connect user value and business signals to meaningful design decisions."]],contactLabel:"Contact",contactEn:"LET'S CONNECT",contactTitle:"Let’s build a clear, credible and buildable digital experience.",contactCta:"Start a conversation",projectNote:"This is the foundation preview. High-resolution case-study imagery will be added when the assets arrive.",close:"Close",backTop:"Back to top",copyright:"? 2026 Wang Haifan. All rights reserved."}};

const resumeContent = {zh:{profileEyebrow:"01 / 个人信息",profileTitle:"Hi，我是",name:"王海帆",facts:[["年龄","26"],["在职时长","2 年 9 月"],["性别","男"],["学历","本科"]],phoneLabel:"电话",phone:"18381883478（微信同号）",emailLabel:"邮箱",email:"whaifan3@gmail.com",bioLabel:"个人简介",bio:["近4年设计经验（含大学接单1年），涵盖产品UI/UX及平面设计，参与负责海外用户规模超千万的在线视频剪辑产品设计工作，负责AI工具产品从0到1的搭建与迭代，具备从需求拆解到设计落地的完整项目经验","对AI产品及AIGC领域有深入了解，持续关注行业前沿动态，日常熟练使用ChatGPT、Midjourney、即梦、可灵等主流AI工具辅助设计与创作，对图片、视频生成类AI产品的交互逻辑与用户体验有较深的理解与实践积累","具备成熟的组件化设计思维，能独立搭建与维护设计组件库，保障多端输出的规范性与一致性；善于与前端开发紧密协作，注重设计还原质量与多端适配细节。了解Material Design、iOS等主流规范，具备国际化审美视野"],educationLabel:"教育经历",education:[{school:"重庆外语外事学院",degree:"全日制本科",major:"视觉传达",period:"2021.9-2023.6"},{school:"重庆工程职业技术大学",degree:"全日制专科",major:"视觉与传播制作",period:"2018.9-2021.6"}],workEyebrow:"02 / 工作经历",workTitle:"工作经历",workIntro:"从产品理解、界面设计到开发交付，持续参与多端产品的完整设计闭环。",jobs:[{company:"成都孚介科技有限公司",role:"UI设计师",period:"2024.6-2026.3",description:"参与负责海外用户规模超千万的在线视频剪辑产品设计工作，负责AI工具产品从0到1的搭建与迭代，覆盖AI文生视频、AI图生图、AI文生图、AI自动字幕、AI背景消除、AI图像高清修复、AI人脸替换等多项功能的界面设计与体验优化；同时负责视频编辑器Web端及移动端的UI迭代、外联需求与活动专题设计及产品配图等工作。"},{company:"成都创元科技有限公司",role:"UI设计师助理",period:"2023.6-2024.3",description:"任职期间独立负责西项景区业务产品的全端UI设计工作，涵盖微信小程序C端、APP及Web端后台等多个业务场景，完成从视觉设计到开发交付的完整闭环。深入理解业务逻辑与开发工作流程，具备良好的跨部门协作与项目推动能力。"},{company:"成都一片森林有限公司",role:"平面/UI设计师（实习）",period:"2023.3-2023.6",description:"实习期间独立完成公司官网Web UI设计及落地上线，同时承担公众号文章排版、活动海报设计及员工手册排版等工作，能够独立推进多类型设计任务，保障输出质量与规范。"}],sideLabel:"其余兼职经历",sideJobs:[["大学网店接单","大学期间个人接单服务100+客户，涵盖UI界面、插画、海报、画册、三折页、易拉宝等多类型设计"],["H&M","负责门店服装的分类陈列与日常整理归纳，确保卖场视觉整洁有序，同时承担收银结账工作"],["戴尔校园大使","负责校园地推与品牌销售宣传推广，通过线上与线下活动有效扩大产品影响力，获优秀实习证明"],["书亦烧仙草","负责饮品制作与门店收银服务，熟悉门店日常运营流程"],["大地影院","影院服务员 负责日常检票及影厅开闭场秩序引导，保障观影流程顺畅与观众体验"]]},en:{profileEyebrow:"01 / PROFILE",profileTitle:"Hi, I’m",name:"Wang Haifan",facts:[["Age","26"],["Experience","2 yrs 9 mos"],["Gender","Male"],["Education","Bachelor’s"]],phoneLabel:"Phone",phone:"18381883478 (WeChat)",emailLabel:"Email",email:"whaifan3@gmail.com",bioLabel:"Profile",bio:["Nearly four years of design experience, including one year of freelance work during university, spanning product UI/UX and graphic design. Contributed to an online video editing product serving over ten million overseas users and built AI tools from 0 to 1, with complete experience from requirement analysis through delivery.","Deeply familiar with AI products and AIGC, continually following industry developments and using ChatGPT, Midjourney, Dreamina and Kling in daily design work. Experienced in the interaction logic and user experience of image- and video-generation products.","Experienced in component-based design, independently building and maintaining design libraries to ensure cross-platform consistency. Works closely with frontend development, values implementation quality and responsive detail, and understands Material Design and iOS conventions with an international visual perspective."],educationLabel:"Education",education:[{school:"Chongqing Institute of Foreign Studies",degree:"Full-time Bachelor’s",major:"Visual Communication",period:"2021.9-2023.6"},{school:"Chongqing Engineering Vocational University",degree:"Full-time Associate",major:"Visual Communication Production",period:"2018.9-2021.6"}],workEyebrow:"02 / EXPERIENCE",workTitle:"Work experience",workIntro:"Working across product understanding, interface design and engineering delivery to complete the full design loop.",jobs:[{company:"PearlMountain Technology",role:"UI Designer",period:"2024.6-2026.3",description:"Contributed to an online video editing product serving over ten million overseas users and led AI tools from 0 to 1, including text-to-video, image-to-image, text-to-image, automatic subtitles, background removal, image enhancement and face replacement. Also handled Web and mobile editor UI iteration, partner requests, campaign pages and product graphics."},{company:"Chengdu Chuangyuan Technology",role:"Assistant UI Designer",period:"2023.6-2024.3",description:"Independently handled end-to-end UI design for scenic-area products across WeChat mini programs, apps and Web admin systems, completing the loop from visual design to engineering handoff while collaborating across teams and driving delivery."},{company:"Chengdu Yipian Forest",role:"Graphic / UI Designer (Intern)",period:"2023.3-2023.6",description:"Independently designed and launched the company website, while producing official-account layouts, campaign posters and employee handbooks, managing varied design tasks with consistent quality and standards."}],sideLabel:"Additional experience",sideJobs:[["University online-store commissions","Served 100+ clients across UI, illustration, posters, brochures, tri-folds and display stands."],["H&M","Handled clothing display, daily organization and checkout while keeping the store visually orderly."],["Dell Campus Ambassador","Promoted the brand through online and offline campus activities and received an excellent internship certificate."],["Shuyi Tealicious","Prepared drinks, handled checkout and learned daily store operations."],["Dadi Cinema","Managed ticket checks, auditorium opening and closing, and audience flow."]]}};

function WordReveal({ children, className = "" }) {

  const parts = useMemo(() => {

    const text = String(children);

    return /[\u3400-\u9fff]/.test(text)

      ? text.match(/[A-Za-z0-9]+|[\u3400-\u9fff]|\s+|[^\s]/gu) ?? []

      : text.split(/(\s+)/);

  }, [children]);



  return (

    <p className={`word-reveal ${className}`} data-reveal>

      {parts.map((part, index) =>

        /^\s+$/.test(part) ? (

          part

        ) : (

          <span key={`${part}-${index}`} style={{ "--word-index": index }}>

            {part}

          </span>

        ),

      )}

    </p>

  );

}



export function App() {

  const [language, setLanguage] = useState("en");

  const [menuOpen, setMenuOpen] = useState(false);

  const [activeProject, setActiveProject] = useState(null);

  const [scrolled, setScrolled] = useState(false);

  const [showTop, setShowTop] = useState(false);

  const [activePanelProject, setActivePanelProject] = useState(null);
  const [folderKey, setFolderKey] = useState(0);
  const handleProjectToggle = (project) => {
    if (activePanelProject?.id === project.id) {
      setActivePanelProject(null);
      setFolderKey(k => k + 1);
    } else {
      setActivePanelProject(project);
    }
  };


  const lenisRef = useRef(null);

  const t = content[language];

  const resume = resumeContent[language];

  const lenisOptions = useMemo(() => {

    return {

      autoRaf: true,

      smoothWheel: true,

      syncTouch: false,

      lerp: 0.075,

      wheelMultiplier: 0.82,

      anchors: {

        offset: -84,

        duration: 1.35,

        easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),

      },

    };

  }, []);



  useEffect(() => {

    document.documentElement.classList.add("js");

    const observer = new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          entry.target.classList.toggle("is-visible", entry.isIntersecting);

        });

      },

      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" },

    );



    const elements = document.querySelectorAll("[data-reveal]");

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();

  }, [language]);



  useEffect(() => {

    let ticking = false;

    const update = () => {

      const y = window.scrollY;

      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

      document.documentElement.style.setProperty(

        "--scroll-progress",

        `${pageHeight > 0 ? y / pageHeight : 0}`,

      );



      const hero = document.querySelector("[data-hero-media]");

      if (hero) {

        const heroProgress = Math.max(0, Math.min(1, y / window.innerHeight));

        const offset = Math.min(y * 0.13, 130);

        hero.style.setProperty("--hero-shift", `${offset}px`);

        document.documentElement.style.setProperty("--hero-progress", heroProgress.toFixed(4));

      }



      document.querySelectorAll("[data-project-media]").forEach((media) => {

        const card = media.closest(".project-card");

        if (!card) return;

        const rect = card.getBoundingClientRect();

        const shift = Math.max(-72, Math.min(72, (rect.top - window.innerHeight / 2) * -0.085));

        media.style.setProperty("--project-shift", `${shift}px`);

      });



      document.querySelectorAll("[data-scroll-section]").forEach((section) => {

        const rect = section.getBoundingClientRect();

        const rawProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

        const progress = Math.max(0, Math.min(1, rawProgress));

        const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);

        const presence = Math.max(0, Math.min(1, 1 - centerDistance / (window.innerHeight + rect.height * 0.35)));

        section.style.setProperty("--section-progress", progress.toFixed(4));

        section.style.setProperty("--section-presence", presence.toFixed(4));

        const sectionShift = (0.5 - progress) * 92;

        section.style.setProperty("--section-shift", `${sectionShift.toFixed(2)}px`);

        section.style.setProperty("--section-shift-soft", `${(sectionShift * 0.45).toFixed(2)}px`);

      });



      const navActivationLine = window.innerHeight * 0.36;

      document.querySelectorAll(".desktop-nav [data-nav-target]").forEach((anchor) => {

        const section = document.getElementById(anchor.dataset.navTarget);

        if (!section) return;

        const rect = section.getBoundingClientRect();

        const isActive = rect.top <= navActivationLine && rect.bottom > navActivationLine;

        const progress = Math.max(

          0,

          Math.min(1, (navActivationLine - rect.top) / Math.max(1, rect.height)),

        );

        anchor.classList.toggle("is-active", isActive);

        anchor.style.setProperty("--nav-progress", isActive ? progress.toFixed(4) : "0");

      });



      setScrolled(y > 28);

      setShowTop(y > window.innerHeight * 0.85);

      ticking = false;

    };



    const onScroll = () => {

      if (!ticking) {

        ticking = true;

        requestAnimationFrame(update);

      }

    };



    update();

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", onScroll);

    return () => {

      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onScroll);

    };

  }, []);



  useEffect(() => {

    const onPointerMove = (event) => {

      const glass = event.target.closest?.("[data-liquid-glass]");

      if (!glass) return;

      const rect = glass.getBoundingClientRect();

      glass.style.setProperty("--glass-x", `${event.clientX - rect.left}px`);

      glass.style.setProperty("--glass-y", `${event.clientY - rect.top}px`);

    };



    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => document.removeEventListener("pointermove", onPointerMove);

  }, []);



  useEffect(() => {

    const locked = menuOpen || Boolean(activeProject);

    const panelOpen = Boolean(activePanelProject);

    document.body.classList.toggle("is-locked", locked || panelOpen);

    if (locked || panelOpen) lenisRef.current?.lenis?.stop();

    else lenisRef.current?.lenis?.start();

    const onKeyDown = (event) => {

      if (event.key === "Escape") {

        setMenuOpen(false);

        setActiveProject(null);

        setActivePanelProject(null);

      }

    };

    window.addEventListener("keydown", onKeyDown);

    return () => {

      document.body.classList.remove("is-locked");

      window.removeEventListener("keydown", onKeyDown);

    };

  }, [menuOpen, activeProject, activePanelProject]);



  const closeMenu = () => setMenuOpen(false);

  const toggleLanguage = () => setLanguage((current) => (current === "zh" ? "en" : "zh"));



  return (

    <ReactLenis ref={lenisRef} root options={lenisOptions}>

    <div className={`site-shell language-${language}`}>

      <div className="scroll-progress" aria-hidden="true" />



      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>

        <div className="header-inner" data-liquid-glass>

          <a href="#top" className="brand" aria-label={language === "zh" ? "返回首页" : "Home"}>

            <span className="brand-name">Whaifan</span>

          </a>



          <nav className="desktop-nav" aria-label={language === "zh" ? "主导航" : "Main navigation"}>

            {t.nav.map(([label, href]) => (

              <a key={href} href={href} data-nav-target={href.slice(1)}>

                {label}

              </a>

            ))}

                    </nav>

          <div className="header-actions">

            <button className="language-toggle glass-control" data-liquid-glass type="button" onClick={toggleLanguage} aria-label="切换中英文">

              <span className={language === "zh" ? "is-active" : ""}>中</span>

              <span className="language-divider">/</span>

              <span className={language === "en" ? "is-active" : ""}>English</span>

            </button>

            <button

              className="menu-toggle glass-control"

              data-liquid-glass

              type="button"

              onClick={() => setMenuOpen((open) => !open)}

              aria-expanded={menuOpen}

              aria-controls="mobile-navigation"

              aria-label={menuOpen ? "关闭菜单" : "打开菜单"}

            >

              {menuOpen ? <X size={22} /> : <List size={22} />}

            </button>

          </div>

        </div>

      </header>



      <div id="mobile-navigation" className={`mobile-menu glass-nav ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>

        <nav aria-label={language === "zh" ? "移动端导航" : "Mobile navigation"}>

          {t.nav.map(([label, href], index) => (

            <a key={href} href={href} onClick={closeMenu} style={{ "--menu-index": index }}>

              <span>0{index + 1}</span>

              {label}

              <ArrowUpRight size={24} />

            </a>

          ))}

                  </nav>

      </div>



      <main>

        <section className="hero" id="top">

          <div className="hero-media" data-hero-media aria-hidden="true">

            <Prism

              animationType="hover"

              timeScale={0.5}

              height={3.5}

              baseWidth={5}

              scale={3.6}

              hueShift={0}

              colorFrequency={1.2}

              noise={0}

              glow={1}

              hoverStrength={1.8}

              inertia={0.075}

              transparent={false}

              suspendWhenOffscreen

            />

          </div>

          <div className="hero-content layout-container">

            <div className="hero-copy">

              <p className="hero-kicker" data-reveal>

                <span className="blue-dot" /> {t.heroEyebrow}

              </p>

              <h1 data-reveal="hero-title">

                <span className="hero-title-line hero-title-line-name">

                  <span className="hero-title-person">{t.heroTitle[0]}</span>

                  <span className="hero-title-vibe">VibeCoding</span>

                </span>

                <span className="hero-title-line hero-title-work">{t.heroTitle[2]}</span>

              </h1>

              <p className="hero-serif" data-reveal style={{ "--reveal-delay": "160ms" }}>

                {t.heroSerif.map((line) => (

                  <span key={line}>{line}</span>

                ))}

              </p>

            </div>



            <a className="scroll-cue" href="#about" data-reveal style={{ "--reveal-delay": "300ms" }}>

              <span className="scroll-circle glass-control" data-liquid-glass>

                <ArrowDown size={18} />

              </span>

              <span className="scroll-cue-label">{t.scroll}</span>

            </a>

          </div>

        </section>



        <section className="about about-resume" id="about" data-scroll-section>

          <div className="layout-container">

            <div className="section-label about-section-label" data-reveal>

              <span>{t.aboutLabel}</span>

              <small>{t.aboutEn}</small>

            </div>



            <ScrollStack

              className="about-scroll-stack"

              useWindowScroll

              itemDistance={120}

              itemScale={0.025}

              itemStackDistance={20}

              stackPosition="12%"

              scaleEndPosition="5%"

              baseScale={0.95}

              blurAmount={0.45}

            >

              <ScrollStackItem

                itemClassName="resume-card resume-profile-card"

                borderGlow={{

                  edgeSensitivity: 34,

                  glowColor: "221 100 66",

                  glowRadius: 34,

                  glowIntensity: 0.58,

                  coneSpread: 20,

                  colors: ["#2866ff", "#7b9cff", "#e6ecff"],

                  fillOpacity: 0,

                  backgroundColor: "#050506",

                }}

              >

                <div className="resume-card-heading" data-reveal>

                  <p>{resume.profileEyebrow}</p>

                  <h2>

                    <span className={language === "zh" ? "resume-profile-prefix is-muted" : "resume-profile-prefix"}>

                      {resume.profileTitle}

                    </span>{" "}

                    <strong>{resume.name}</strong>

                  </h2>

                </div>



                <div className="resume-profile-grid">

                  <div className="resume-profile-summary">

                    <dl className="resume-facts" data-reveal>

                      {resume.facts.map(([label, value], index) => {

                        const isDuration = label === "在职时长" || label === "Experience";

                        return (

                          <div key={label} style={{ "--reveal-delay": `${index * 55}ms` }}>

                            <dt>{label}</dt>

                            {isDuration ? (

                              <dd className="resume-duration-value" aria-label={value}>

                                <strong>2</strong><span>{language === "zh" ? "年" : "yrs"}</span>

                                <strong>9</strong><span>{language === "zh" ? "月" : "mos"}</span>

                              </dd>

                            ) : (

                              <dd>{value}</dd>

                            )}

                          </div>

                        );

                      })}

                    </dl>



                    <div className="resume-contact-pair" data-reveal>

                      <a className="glass-control" data-liquid-glass href="tel:+8618381883478">

                        <span><Phone size={16} /> {resume.phoneLabel}</span>

                        <strong>{resume.phone}</strong>

                      </a>

                      <a className="glass-control" data-liquid-glass href="mailto:whaifan3@gmail.com">

                        <span><EnvelopeSimple size={16} /> {resume.emailLabel}</span>

                        <strong>{resume.email}</strong>

                      </a>

                    </div>



                    <div className="resume-education" data-reveal>

                      <p className="resume-group-label">{resume.educationLabel}</p>

                      <div className="resume-education-list">

                        {resume.education.map((item) => (

                          <article key={item.school}>

                            <div>

                              <h3>{item.school}</h3>

                              <p>{item.major}</p>

                            </div>

                            <div>

                              <strong>{item.degree}</strong>

                              <span>{item.period}</span>

                            </div>

                          </article>

                        ))}

                      </div>

                    </div>

                  </div>



                  <div className="resume-bio" data-reveal>

                    <p className="resume-group-label">{resume.bioLabel}</p>

                    {resume.bio.map((paragraph) => (

                      <p key={paragraph}>{paragraph}</p>

                    ))}

                  </div>

                </div>

              </ScrollStackItem>



              <ScrollStackItem

                itemClassName="resume-card resume-work-card"

                borderGlow={{

                  edgeSensitivity: 34,

                  glowColor: "221 100 66",

                  glowRadius: 34,

                  glowIntensity: 0.58,

                  coneSpread: 20,

                  colors: ["#2866ff", "#7b9cff", "#e6ecff"],

                  fillOpacity: 0,

                  backgroundColor: "#050506",

                }}

              >

                <div className="resume-work-header" data-reveal>

                  <div>

                    <p>{resume.workEyebrow}</p>

                    <h2>{resume.workTitle}</h2>

                  </div>

                  <p>{resume.workIntro}</p>

                </div>



                <div className="resume-work-list">

                  {resume.jobs.map((job, index) => (

                    <article key={`${job.company}-${job.period}`} data-reveal style={{ "--reveal-delay": `${index * 80}ms` }}>

                      <div className="resume-work-meta">

                        <span className={index === 0 ? "is-current" : ""} />

                        <p>{job.period}</p>

                      </div>

                      <div className="resume-work-copy">

                        <div>

                          <h3>{job.company}</h3>

                          <strong>{job.role}</strong>

                        </div>

                        <p>{job.description}</p>

                      </div>

                    </article>

                  ))}

                </div>



                <div className="resume-side-experience">

                  <p className="resume-group-label">{resume.sideLabel}</p>

                  <div data-reveal>

                    {resume.sideJobs.map(([title, description], index) => (

                      <article key={title}>

                        <h3>{title}</h3>

                        <p>{description}</p>

                      </article>

                    ))}

                  </div>

                </div>

              </ScrollStackItem>

            </ScrollStack>

          </div>

        </section>



        <section className="advantages section-space" id="advantages" data-scroll-section>

          <div className="layout-container">

            <div className="advantages-heading" data-reveal>

              <div className="section-label">

                <span>{t.advantagesLabel}</span>

                <small>{t.advantagesEn}</small>

              </div>

              <p>{t.advantagesIntro}</p>

            </div>



            <MagicBento

              cards={t.advantages}

              textAutoHide={false}

              enableBorderGlow

              enableStars={false}

              enableSpotlight={false}

              enableTilt={false}

              enableMagnetism={false}

              clickEffect={false}

              glowColor="40, 102, 255"

              cardLabel={t.advantagesEn}

            />

          </div>

        </section>



        <section className="projects section-space" id="projects" data-scroll-section>

          <div className="projects-strands" data-reveal="scale" aria-hidden="true">

            <Strands

              colors={["#2866ff", "#7b9cff", "#e6ecff"]}

              count={3}

              speed={0.34}

              amplitude={0.82}

              waviness={0.9}

              thickness={0.52}

              glow={2.15}

              taper={3.4}

              spread={1.15}

              intensity={0.48}

              saturation={0.82}

              opacity={0.78}

              scale={1.32}

              glass={false}

            />

            <span className="projects-strands-vignette" />

          </div>



          <div className="layout-container">

            <div className="projects-heading" data-reveal>

              <div className="section-label">

                <span>{t.projectsLabel}</span>

                <small>{t.projectsEn}</small>

              </div>

              <p>{t.projectHint}</p>

            </div>



            <div className="project-folder-stage" data-reveal>
              <div className="project-folders" key={folderKey}>
                {[flexclipProject, beanTennisProject].map((project, index) => (
                  <BorderGlow key={project.id} edgeSensitivity={28} glowColor={project.id === "flexclip" ? "221 100 66" : "80 100 65"} glowRadius={28} glowIntensity={0.7} coneSpread={18} borderRadius={28} backgroundColor="#090a0e" colors={project.id === "flexclip" ? ["#2866ff", "#7b9cff", "#e6ecff"] : ["#d1ff54", "#8cff6e", "#e6ffd4"]} fillOpacity={0}>
                  <article
                    className={`project-folder-case project-folder-case--${project.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={language === "zh" ? `打开${project.titleZh || project.title}项目` : `Open ${project.title} project`}
                    onClick={() => setActivePanelProject(project)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActivePanelProject(project);
                      }
                    }}
                  >
                    <div className="project-folder-case__copy">
                      <span>0{index + 1}</span>
                      <h3>{language === "zh" && project.titleZh ? project.titleZh : project.title}</h3>
                      <p className="project-folder-case__meta">{language === "zh" && project.metaZh ? project.metaZh : project.meta}</p>
                      <p className="project-folder-case__summary">{language === "zh" && project.summaryZh ? project.summaryZh : project.summary}</p>
                    </div>
                    <Folder
                      color={project.id === "flexclip" ? "#2866ff" : "#D1FF54"}
                      size={1.18}
                      label=""
                      subLabels={project.id === "flexclip"
                        ? [language === "zh" ? "AI 网页" : "AI Web", language === "zh" ? "移动端" : "Mobile", language === "zh" ? "网页设计" : "Web Pages"]
                        : [language === "zh" ? "品牌" : "Identity", language === "zh" ? "界面" : "UI", language === "zh" ? "功能" : "Features"]}
                      onOpen={() => setActivePanelProject(project)}
                      panelLabel=""
                    />
                  </article>
                  </BorderGlow>
                ))}
              </div>
            </div>

        



        </div>
        </section>

<section className="contact section-space" id="contact" data-scroll-section>

          <div className="layout-container">

            <BorderGlow edgeSensitivity={28} glowColor="221 100 66" glowRadius={28} glowIntensity={0.7} coneSpread={18} borderRadius={30} backgroundColor="transparent" colors={["#2866ff", "#7b9cff", "#e6ecff"]} fillOpacity={0}>
            <div className="contact-panel" data-reveal="scale">

              <LiquidEther className="contact-ether" colors={["#2866ff", "#6d8fff", "#f2f5ff"]} mouseForce={10} cursorSize={80} resolution={0.5} autoDemo autoSpeed={0.45} autoIntensity={1.0} />

              <div className="contact-content">

                <div className="contact-copy">

                  <div className="section-label">

                    <span>{t.contactLabel}</span>

                    <small>{t.contactEn}</small>

                  </div>

                  <WordReveal className="contact-title">{language === "zh" ? "感谢您的查看" : "Thank you for viewing"}</WordReveal>

                </div>

                                <div className="contact-details">

                  <a href="tel:+8618381883478">{language === "zh" ? "183 8188 3478（微信同号）" : "183 8188 3478 · WeChat"}</a>

                  <a href="mailto:whaifan3@gmail.com">whaifan3@gmail.com</a>

                  <span>{language === "zh" ? "成都 / 2026" : "Chengdu / 2026"}</span>

                </div></div>
            </div>
            </BorderGlow>
          </div>
        </section>
      </main>




      <footer className="site-footer">
        <p>{t.copyright}</p>
        <a href="#top">
          {t.backTop} <ArrowUp size={15} />
        </a>
      </footer>


      <button

        className={`back-to-top glass-control ${showTop ? "is-visible" : ""}`}

        data-liquid-glass

        type="button"

        onClick={() => lenisRef.current?.lenis?.scrollTo(0, { duration: 1.2 })}

        aria-label={t.backTop}

      >

        <ArrowUp size={18} />

      </button>



      <div className={`project-dialog ${activeProject ? "is-open" : ""}`} aria-hidden={!activeProject}>

        <button

          className="dialog-backdrop"

          type="button"

          onClick={() => setActiveProject(null)}

          aria-label={t.close}

        />

        {activeProject && (

          <article className="dialog-panel glass-panel" data-liquid-glass data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="dialog-title">

            <button className="dialog-close glass-control" data-liquid-glass type="button" onClick={() => setActiveProject(null)} aria-label={t.close}>

              <X size={22} />

            </button>

            <p className="dialog-index">{activeProject.index} / SELECTED WORK</p>

            <h2 id="dialog-title">{activeProject.title}</h2>

            <p className="dialog-meta">{activeProject.meta}</p>

            <p className="dialog-summary">{activeProject.summary}</p>

            <div className="dialog-tags">

              {activeProject.tags.map((tag) => (

                <span key={tag}>{tag}</span>

              ))}

            </div>

            <p className="dialog-note">{t.projectNote}</p>

            <a className="solid-button glass-control" data-liquid-glass href="mailto:whaifan3@gmail.com">

              {t.contactCta}

              <ArrowUpRight size={18} />

            </a>

          </article>

        )}

      </div>



      {activePanelProject && (

        <ProjectPanel

          project={activePanelProject}

          projects={[flexclipProject, beanTennisProject]}

          onSwitch={setActivePanelProject}

          onClose={() => { setActivePanelProject(null); setFolderKey(k => k + 1); }}
          language={language}


        />

      )}

    </div>

    </ReactLenis>

  );

}
