import { useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowLeft } from "@phosphor-icons/react";
import "./ProjectPanel.css";

export default function ProjectPanel({ project, projects = [], onSwitch, onClose, language = "zh" }) {
  const scrollRef = useRef(null);
  const wheelTargetRef = useRef(0);
  const wheelFrameRef = useRef(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    setActiveCategory(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [project?.id]);

  useEffect(() => {
    document.body.classList.add("is-locked");
    const onKeyDown = (event) => event.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("is-locked");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)),
      { root, threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );
    root.querySelectorAll(".panel-image-card").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [project?.id, activeCategory]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return undefined;
    const updateProgress = () => {
      const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      scroller.parentElement?.style.setProperty("--panel-progress", String(Math.min(1, scroller.scrollTop / max)));
    };
    scroller.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => scroller.removeEventListener("scroll", updateProgress);
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose?.(), 380);
  };

  const imageGroups = useMemo(() => {
    if (!project) return [];
    if (project.id === "bean-tennis") return project.categories || [];
    return project.categories?.[activeCategory] ? [project.categories[activeCategory]] : [];
  }, [project, activeCategory]);

  if (!project) return null;
  const categories = project.categories || [];

  return (
    <div className={`project-panel-overlay ${visible ? "is-visible" : ""} ${leaving ? "is-leaving" : ""}`}>
      <div className="project-panel-switchbar">
        <button className="panel-back glass-control" data-liquid-glass onClick={handleClose} type="button">
          <ArrowLeft size={18} /><span>{language === "zh" ? "返回项目" : "Back"}</span>
        </button>
        <div className="panel-project-switch" role="group" aria-label="Project switcher">
          <span className={`panel-switch-indicator ${project.id === "bean-tennis" ? "is-right" : ""}`} aria-hidden="true" />
          {projects.map((item) => (
            <button key={item.id} className={item.id === project.id ? "is-active" : ""} onClick={() => onSwitch?.(item)} type="button">
              {language === "zh" && item.titleZh ? item.titleZh : item.title}
            </button>
          ))}
        </div>
        <button className="panel-close-fab glass-control" data-liquid-glass onClick={handleClose} type="button" aria-label="Close">
          <X size={21} />
        </button>
      </div>

      <div className="project-panel-scroll" ref={scrollRef} data-lenis-prevent>
        <article className={`project-panel project-panel--${project.id}`}>
          <header className="panel-hero">
            <span className="panel-kicker">{project.id === "flexclip" ? "01 / CASE STUDY" : "02 / CASE STUDY"}</span>
            <h2>{language === "zh" && project.titleZh ? project.titleZh : project.title}</h2>
            <p className="panel-meta">{language === "zh" && project.metaZh ? project.metaZh : project.meta}</p>
            <p className="panel-summary">{language === "zh" && project.summaryZh ? project.summaryZh : project.summary}</p>
            <div className="panel-tags-row">
              {project.tags?.map((tag) => <span key={tag} className="panel-tag">{tag}</span>)}
            </div>
          </header>

          {categories.length > 1 && project.id !== "bean-tennis" && (
            <nav className="panel-categories" aria-label="Project categories">
              <span className="panel-category-indicator" style={{ "--category-index": activeCategory }} aria-hidden="true" />
              {categories.map((category, index) => (
                <button key={category.name} className={`panel-cat-tag ${index === activeCategory ? "is-active" : ""}`} onClick={() => { setActiveCategory(index); wheelTargetRef.current = 0; scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }} type="button">
                  {language === "zh" && category.nameZh ? category.nameZh : category.name}
                </button>
              ))}
            </nav>
          )}

          <div className="panel-story">
            {imageGroups.map((group) => (
              <section className="panel-story-group" key={group.name}>
                <div className={`panel-image-grid ${project.id === "bean-tennis" ? "is-seamless" : group.layout === "masonry" ? "is-masonry" : "is-single-column"}`}>
                  {group.images.map((image, index) => (
                    <figure className="panel-image-card" key={image.src} style={{ "--img-delay": `${Math.min(index, 8) * 45}ms` }}>
                      {project.id === "flexclip" && group.layout !== "masonry" && (
                        <figcaption>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{language === "zh" && image.captionZh ? image.captionZh : image.caption}</strong>
                        </figcaption>
                      )}
                      <div className="panel-image-wrap"><img src={image.src} alt={language === "zh" && image.captionZh ? image.captionZh : image.caption} loading={index < 2 ? "eager" : "lazy"} /></div>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
