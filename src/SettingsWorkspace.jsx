import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check } from "@phosphor-icons/react/dist/icons/Check";
import { Database } from "@phosphor-icons/react/dist/icons/Database";
import { DesktopTower } from "@phosphor-icons/react/dist/icons/DesktopTower";
import { Lightning } from "@phosphor-icons/react/dist/icons/Lightning";
import { LockSimple } from "@phosphor-icons/react/dist/icons/LockSimple";
import { Moon } from "@phosphor-icons/react/dist/icons/Moon";
import { Palette } from "@phosphor-icons/react/dist/icons/Palette";
import { ShieldCheck } from "@phosphor-icons/react/dist/icons/ShieldCheck";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/icons/SlidersHorizontal";
import { Sparkle } from "@phosphor-icons/react/dist/icons/Sparkle";
import { Stack } from "@phosphor-icons/react/dist/icons/Stack";
import { Sun } from "@phosphor-icons/react/dist/icons/Sun";
import { UserCircle } from "@phosphor-icons/react/dist/icons/UserCircle";
import { EASE } from "./pageMotion";

// 左栏分类不是纯高亮，它是正文的锚点：点按滚到对应段落，滚动时回读当前段落。
// 每个分类同时指向伴生体上的一个语义锚点（0 行为 / 1 权限 / 2 隐私）。
const CATEGORIES = [
  { id: "general", label: "通用偏好", title: "行为", icon: SlidersHorizontal, anchor: 0 },
  { id: "capability", label: "能力权限", title: "权限", icon: Database, anchor: 1 },
  { id: "privacy", label: "数据隐私", title: "隐私", icon: ShieldCheck, anchor: 2 },
  { id: "appearance", label: "外观", title: "外观", icon: Palette, anchor: 0 },
  { id: "security", label: "账户安全", title: "账户", icon: LockSimple, anchor: 1 },
];

// 改哪条偏好，回应哪个锚点。执行方式与外观属于"行为"，资料与联网属于"权限"。
const PREFERENCE_ANCHOR = { execution: 0, detail: 0, theme: 0, knowledge: 1, web: 1 };

const DEFAULTS = Object.freeze({ execution: "auto", detail: "balanced", knowledge: false, web: false, theme: "system" });

const EXECUTION_OPTIONS = [
  { id: "auto", label: "自动", icon: Sparkle },
  { id: "quick", label: "快速", icon: Lightning },
  { id: "deep", label: "深度", icon: Stack },
];
const DETAIL_OPTIONS = [
  { id: "compact", label: "简洁" },
  { id: "balanced", label: "平衡" },
  { id: "detailed", label: "详细" },
];
const THEME_OPTIONS = [
  { id: "system", label: "跟随系统", icon: DesktopTower },
  { id: "light", label: "浅色", icon: Sun },
  { id: "dark", label: "深色", icon: Moon },
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 分段选择器沿用输入条模式滑块的材质与规则：文字和图标不动，只有玻璃块在下面滑。
// 三段等宽，所以只补间 x，不去动 width 这类布局属性。
function SegmentedControl({ label, name, value, options, onChange }) {
  const rootRef = useRef(null);
  const glassRef = useRef(null);
  const causticRef = useRef(null);
  const placedRef = useRef(false);
  const index = Math.max(0, options.findIndex((option) => option.id === value));

  useGSAP(() => {
    const root = rootRef.current;
    const glass = glassRef.current;
    const caustic = causticRef.current;
    if (!root || !glass || !caustic) return undefined;

    const place = (animate) => {
      const button = root.querySelectorAll("button")[index];
      if (!button) return;
      const x = button.offsetLeft - glass.offsetLeft;
      if (!animate || prefersReducedMotion()) {
        gsap.set([glass, caustic], { x });
        return;
      }
      gsap.to([glass, caustic], { x, duration: .42, ease: "sine.inOut", overwrite: true });
    };

    place(placedRef.current);
    placedRef.current = true;

    // 断点切换会改变段宽，滑块得跟着重新落位，否则会停在旧的像素上。
    const observer = new ResizeObserver(() => place(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, { dependencies: [index], scope: rootRef });

  return (
    <div ref={rootRef} className="settings-segmented" role="group" aria-label={label}>
      <span ref={glassRef} className="settings-seg-glass" aria-hidden="true" />
      <span ref={causticRef} className="settings-seg-caustic" aria-hidden="true" />
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          data-option={`${name}-${option.id}`}
          className={value === option.id ? "is-selected" : ""}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.icon ? <option.icon weight={value === option.id ? "fill" : "regular"} /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// 打开不是"整条轨道换色"，而是青柠被拨块推着注满：填充层跟着拨块一起走，
// 只补间 scaleX（transform-origin 在左端），是合成器能自己跑完的那一类。
// 关闭时反向抽干，抽得比注入快一档——退场一律干脆。
function SettingsSwitch({ checked, label, onChange }) {
  const knobRef = useRef(null);
  const fillRef = useRef(null);
  const placedRef = useRef(false);

  useGSAP(() => {
    const knob = knobRef.current;
    const fill = fillRef.current;
    if (!knob || !fill) return undefined;
    const x = checked ? 18 : 0;
    const scaleX = checked ? 1 : 0;
    if (!placedRef.current || prefersReducedMotion()) {
      gsap.set(knob, { x });
      gsap.set(fill, { scaleX });
      placedRef.current = true;
      return undefined;
    }
    gsap.to(knob, { x, duration: .34, ease: EASE.settle, overwrite: true });
    gsap.to(fill, {
      scaleX,
      duration: checked ? .3 : .22,
      ease: checked ? EASE.glide : EASE.exit,
      overwrite: true,
    });
    return undefined;
  }, { dependencies: [checked] });

  return (
    <button
      type="button"
      className={`settings-switch${checked ? " is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <i ref={fillRef} className="switch-fill" aria-hidden="true" />
      <i ref={knobRef} className="switch-knob" aria-hidden="true" />
    </button>
  );
}

function SettingsRow({ title, detail, pref, children }) {
  return (
    <div className="settings-row" data-pref={pref}>
      <span><strong>{title}</strong><small>{detail}</small></span>
      {children}
    </div>
  );
}

// 这几行原先是带 › 的 button：箭头明示"点进去有下一层"，但下一层并不存在。
// 现在按它们真实的身份来——只读的当前值，跟上面的偏好行同一套版式。
function SettingsValueRow({ title, detail, value }) {
  return (
    <div className="settings-row">
      <span><strong>{title}</strong><small>{detail}</small></span>
      <span className="settings-row-value">{value}</span>
    </div>
  );
}

export function SettingsWorkspace({ onAnchorPulse, onAnchorSweep, onAnchorDim }) {
  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const railRef = useRef(null);
  const railGlassRef = useRef(null);
  const saveButtonRef = useRef(null);
  const saveRingRef = useRef(null);
  const saveTimerRef = useRef(null);
  const railPlacedRef = useRef(false);
  const spyLockRef = useRef(0);
  const [activeCategory, setActiveCategory] = useState("general");
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [savedPreferences, setSavedPreferences] = useState(DEFAULTS);
  const [saveState, setSaveState] = useState("synced");
  const dirty = useMemo(() => JSON.stringify(preferences) !== JSON.stringify(savedPreferences), [preferences, savedPreferences]);

  // 分类高亮走一块滑动玻璃，和左栏导航的 .nav-glass 是同一块材质、同一条曲线，
  // 不再用"绿底 + 左侧色条"另立一套。
  useGSAP(() => {
    const rail = railRef.current;
    const glass = railGlassRef.current;
    if (!rail || !glass) return undefined;

    const place = (animate) => {
      const button = rail.querySelector(`button[data-category="${activeCategory}"]`);
      if (!button) return;
      gsap.set(glass, { width: button.offsetWidth, height: button.offsetHeight });
      const target = { x: button.offsetLeft, y: button.offsetTop };
      if (!animate || prefersReducedMotion()) {
        gsap.set(glass, target);
        return;
      }
      gsap.to(glass, { ...target, duration: .46, ease: "sine.inOut", overwrite: true });
    };

    place(railPlacedRef.current);
    railPlacedRef.current = true;

    const observer = new ResizeObserver(() => place(false));
    observer.observe(rail);
    return () => observer.disconnect();
  }, { dependencies: [activeCategory], scope: rootRef });

  // 滚动时回读当前段落。观察区收到容器顶部 38%，读起来才是"正在看的那一段"。
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;
    const sections = [...content.querySelectorAll("[data-category]")];
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (performance.now() < spyLockRef.current) return;
      const top = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setActiveCategory(top.target.dataset.category);
    }, { root: content, rootMargin: "0px 0px -62% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // 保存成功的确认信号用形变而不是明暗：一次 back.out 落定，和任务就绪的 .task-live 同源。
  // 落定之外还要有"系统收到了"的回执：三个语义锚点在伴生体上按序各亮一次，
  // 最后一颗亮起的那一拍（约 .16s）正好接上按钮外圈收拢的细环。
  useGSAP(() => {
    if (saveState !== "saved" || prefersReducedMotion()) return undefined;
    const button = saveButtonRef.current;
    const ring = saveRingRef.current;
    const dot = rootRef.current?.querySelector(".settings-sync i");
    // 收拢环也是 immediateRender: false 的 fromTo：连着保存两次，
    // 上一条若被打断在起始值那一格就会一直亮着。进来先归零。
    if (ring) { gsap.killTweensOf(ring); gsap.set(ring, { autoAlpha: 0 }); }
    const timeline = gsap.timeline();
    if (button) timeline.fromTo(button, { scale: .955 }, { scale: 1, duration: .46, ease: EASE.settle, overwrite: "auto" }, 0);
    if (dot) timeline.fromTo(dot, { scale: .5 }, { scale: 1, duration: .52, ease: EASE.settle, overwrite: "auto" }, .04);
    if (ring) {
      timeline.fromTo(
        ring,
        { autoAlpha: .9, scale: 1.32 },
        { autoAlpha: 0, scale: 1, duration: .52, ease: EASE.reveal, overwrite: "auto" },
        .16,
      );
    }
    onAnchorSweep?.();
    return () => timeline.kill();
  }, { dependencies: [saveState], scope: rootRef });

  useEffect(() => () => window.clearTimeout(saveTimerRef.current), []);

  const goToCategory = (id) => {
    setActiveCategory(id);
    const content = contentRef.current;
    const target = content?.querySelector(`[data-category="${id}"]`);
    if (!content || !target) return;
    // 程序化滚动期间先把回读关掉，否则途经的段落会把高亮拽回去。
    spyLockRef.current = performance.now() + 720;
    content.scrollTo({ top: Math.max(0, target.offsetTop - 10), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const updatePreference = (key, value) => {
    setPreferences((current) => (current[key] === value ? current : { ...current, [key]: value }));
    setSaveState("changed");
    onAnchorPulse?.(PREFERENCE_ANCHOR[key] ?? 0);
  };

  const save = () => {
    if (!dirty || saveState === "saving") return;
    window.clearTimeout(saveTimerRef.current);
    setSaveState("saving");
    saveTimerRef.current = window.setTimeout(() => {
      setSavedPreferences(preferences);
      setSaveState("saved");
      saveTimerRef.current = window.setTimeout(() => setSaveState("synced"), 1400);
    }, 520);
  };

  // 恢复默认是"撤回"，语态属于停摆：被改回去的那几行各自回弹一次，
  // 伴生体的锚点整排暗一拍再回来。没被改过的行不动——动了就成了纯装饰。
  const reset = () => {
    const revertedKeys = Object.keys(DEFAULTS).filter((key) => preferences[key] !== DEFAULTS[key]);
    setPreferences(DEFAULTS);
    setSaveState("changed");
    onAnchorDim?.();
    if (prefersReducedMotion() || !revertedKeys.length) return;
    const rows = revertedKeys
      .map((key) => rootRef.current?.querySelector(`.settings-row[data-pref="${key}"]`))
      .filter(Boolean);
    if (!rows.length) return;
    gsap.killTweensOf(rows);
    gsap.fromTo(
      rows,
      { y: -3 },
      { y: 0, duration: .46, stagger: .03, ease: EASE.settle, overwrite: "auto", clearProps: "transform" },
    );
  };

  return (
    <section ref={rootRef} className="settings-workspace" aria-labelledby="settings-title">
      <header className="settings-header settings-reveal">
        <h1 id="settings-title">设置</h1>
        <p className={`settings-sync${dirty ? " is-dirty" : ""}`} aria-live="polite">
          <i />
          {saveState === "saving" ? "正在同步偏好…" : dirty ? "有尚未保存的更改" : "所有偏好已同步"}
        </p>
      </header>

      <nav ref={railRef} className="settings-categories settings-reveal" aria-label="设置分类">
        <span ref={railGlassRef} className="settings-rail-glass" aria-hidden="true" />
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const active = activeCategory === category.id;
          return (
            <button
              type="button"
              key={category.id}
              data-category={category.id}
              className={active ? "is-active" : ""}
              aria-current={active ? "true" : undefined}
              onClick={() => goToCategory(category.id)}
            >
              <Icon weight={active ? "fill" : "regular"} />
              <span>{category.label}</span>
            </button>
          );
        })}
        <div className="settings-account"><UserCircle weight="duotone" /><span><strong>企业成员</strong><small>已安全登录</small></span></div>
      </nav>

      <div ref={contentRef} className="settings-content">
        <section className="settings-section settings-reveal" data-category="general" aria-label="行为">
          <div className="section-label"><strong>行为</strong><i /></div>
          <SettingsRow pref="execution" title="默认执行模式" detail="新任务创建时优先使用的思考方式">
            <SegmentedControl
              label="默认执行模式"
              name="execution"
              value={preferences.execution}
              options={EXECUTION_OPTIONS}
              onChange={(value) => updatePreference("execution", value)}
            />
          </SettingsRow>
          <SettingsRow pref="detail" title="回复详细程度" detail="控制回答的篇幅和解释深度">
            <SegmentedControl
              label="回复详细程度"
              name="detail"
              value={preferences.detail}
              options={DETAIL_OPTIONS}
              onChange={(value) => updatePreference("detail", value)}
            />
          </SettingsRow>
          <SettingsRow pref="knowledge" title="知识库默认使用" detail="创建任务时默认连接企业私有资料">
            <SettingsSwitch checked={preferences.knowledge} label="知识库默认使用" onChange={(value) => updatePreference("knowledge", value)} />
          </SettingsRow>
          <SettingsRow pref="web" title="联网搜索默认启用" detail="仍可在每次任务中单独开关">
            <SettingsSwitch checked={preferences.web} label="联网搜索默认启用" onChange={(value) => updatePreference("web", value)} />
          </SettingsRow>
        </section>

        <section className="settings-section settings-reveal" data-category="capability" aria-label="权限">
          <div className="section-label"><strong>权限</strong><i /></div>
          <SettingsValueRow title="能力使用范围" detail="管理元枢可调用的资料、联网和工具能力" value="按任务确认" />
          <SettingsValueRow title="工具调用记录" detail="查看每次任务实际调用了哪些能力" value="最近 30 天" />
        </section>

        <section className="settings-section settings-reveal" data-category="privacy" aria-label="隐私">
          <div className="section-label"><strong>隐私</strong><i /></div>
          <div className="settings-row settings-privacy-note">
            <ShieldCheck weight="duotone" />
            <span><strong>你的数据始终属于你</strong><small>任务、文件与对话仅在当前企业空间内隔离使用，不会公开共享。</small></span>
          </div>
          <SettingsValueRow title="资料留存期限" detail="超期的临时会话附件会自动清理" value="90 天" />
        </section>

        <section className="settings-section settings-reveal" data-category="appearance" aria-label="外观">
          <div className="section-label"><strong>外观</strong><i /></div>
          <SettingsRow pref="theme" title="主题模式" detail="选择工作台的明暗外观">
            <SegmentedControl
              label="主题模式"
              name="theme"
              value={preferences.theme}
              options={THEME_OPTIONS}
              onChange={(value) => updatePreference("theme", value)}
            />
          </SettingsRow>
        </section>

        <section className="settings-section settings-reveal" data-category="security" aria-label="账户安全">
          <div className="section-label"><strong>账户</strong><i /></div>
          <SettingsValueRow title="登录方式" detail="当前通过企业统一身份登录" value="企业 SSO" />
          <SettingsValueRow title="活跃设备" detail="退出后该设备需要重新登录" value="2 台设备" />
        </section>

        <footer className="settings-actions settings-reveal">
          <button
            ref={saveButtonRef}
            type="button"
            className={`settings-save${saveState === "saved" ? " is-saved" : ""}`}
            onClick={save}
            disabled={!dirty || saveState === "saving"}
          >
            <i ref={saveRingRef} className="save-ring" aria-hidden="true" />
            {saveState === "saved" ? <Check weight="bold" /> : null}
            {saveState === "saving" ? "正在保存…" : saveState === "saved" ? "已保存" : "保存更改"}
          </button>
          <button type="button" className="settings-reset" onClick={reset}>恢复默认</button>
        </footer>
      </div>
    </section>
  );
}
