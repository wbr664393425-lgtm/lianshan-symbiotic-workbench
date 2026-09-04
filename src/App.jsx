import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "@phosphor-icons/react/dist/icons/ArrowRight";
import { BookOpen } from "@phosphor-icons/react/dist/icons/BookOpen";
import { Brain } from "@phosphor-icons/react/dist/icons/Brain";
import { Briefcase } from "@phosphor-icons/react/dist/icons/Briefcase";
import { CheckCircle } from "@phosphor-icons/react/dist/icons/CheckCircle";
import { CirclesThreePlus } from "@phosphor-icons/react/dist/icons/CirclesThreePlus";
import { Folder } from "@phosphor-icons/react/dist/icons/Folder";
import { GlobeHemisphereWest } from "@phosphor-icons/react/dist/icons/GlobeHemisphereWest";
import { House } from "@phosphor-icons/react/dist/icons/House";
import { Lightning } from "@phosphor-icons/react/dist/icons/Lightning";
import { LinkSimple } from "@phosphor-icons/react/dist/icons/LinkSimple";
import { Paperclip } from "@phosphor-icons/react/dist/icons/Paperclip";
import { Play } from "@phosphor-icons/react/dist/icons/Play";
import { ShieldCheck } from "@phosphor-icons/react/dist/icons/ShieldCheck";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/icons/SlidersHorizontal";
import { Sparkle } from "@phosphor-icons/react/dist/icons/Sparkle";
import { Stop } from "@phosphor-icons/react/dist/icons/Stop";
import { X } from "@phosphor-icons/react/dist/icons/X";
import { TaskWorkspace } from "./TaskWorkspace";
import { FilesWorkspace } from "./FilesWorkspace";
import { SettingsWorkspace } from "./SettingsWorkspace";
import {
  COMPANION_MOTION,
  EASE,
  getCompanionShift,
  getFlipDuration,
  PAGE_MOTION,
} from "./pageMotion";

gsap.registerPlugin(useGSAP, Flip, ScrollTrigger);

// 开场只在"本次会话第一次进入首页"时播一次。?intro=1 强制播（演示场合），
// ?intro=0 强制跳过。降低动效偏好下完全不挂幕布。
const OPENING_KEY = "yuanshu-opening-seen";
const COMPANION_ASPECT = 626 / 949;
// 实测值：点火图最亮 2% 像素的质心落在 43.6% / 55.6%，与现有 .task-form-region
// 的 transform-origin: 43% 56% 基本重合，说明素材与人物图是对位的。
const COMPANION_CORE = { x: .436, y: .556 };
// 点火闸门推进的是**阈值**，不是 brightness。两者是倒数关系（阈值 = .5 / brightness），
// 直接对 brightness 线性补间会被这层倒数狠狠前压——实测前 80ms 就点亮 46% 的脉络、
// 130ms 到 57%，传导在眼睛反应过来之前就结束了，看起来只剩「上一帧只有核心、
// 下一帧整个人已经亮完」两帧，中间那段「从零到一」根本没被看见。
// 贴图当初按到达顺序做直方图均衡，就是为了让阈值线性推进 = 脉络线性点亮，
// 补间对象必须是阈值本身。改后实测：80ms 8.6%、550ms 42%、1.8s 100%。
const GATE_T = { start: 1.05, mid: .62, end: .05 };

function shouldPlayOpening() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const intro = new URLSearchParams(window.location.search).get("intro");
  if (intro === "1") return true;
  if (intro === "0") return false;
  try {
    return sessionStorage.getItem(OPENING_KEY) !== "1";
  } catch {
    return true; // 隐私模式下读不到，宁可播一次，也不要静默吞掉
  }
}

const NAV_ITEMS = [
  { id: "home", label: "首页", icon: House },
  { id: "tasks", label: "任务", icon: Briefcase },
  { id: "files", label: "文件", icon: Folder },
  { id: "settings", label: "设置", icon: SlidersHorizontal },
];

const CAPABILITIES = [
  {
    id: "knowledge",
    title: "知识连接",
    detail: "已连接",
    icon: LinkSimple,
  },
  {
    id: "tools",
    title: "工具就绪",
    detail: "已就绪",
    icon: Briefcase,
  },
  {
    id: "security",
    title: "安全隔离",
    detail: "已隔离",
    icon: ShieldCheck,
  },
];

const PHASES = [
  { label: "感知目标", status: "正在理解目标" },
  { label: "组织上下文", status: "正在组织上下文" },
  { label: "执行工具", status: "正在调用工具" },
  { label: "交付成果", status: "正在整理成果" },
];

const SETTINGS_ANCHORS = ["行为", "权限", "隐私"];

// 没有具体引用资料、但资料库开着的时候，模拟一次检索命中的两份资料。
// 原型不接真实检索，这两条是唯一的模拟数据，且只在"资料库开启且用户没自己挑资料"时出现。
const DEFAULT_SOURCES = [
  { id: "src-weekly", title: "项目周报 · 8月26日", meta: "协作空间 / 周报" },
  { id: "src-progress", title: "研发进度清单.xlsx", meta: "私人资料库 / 项目" },
];

// 任务记录的初始几条：第一条是"当前打开的那个任务"，其余是历史。
// 它们和用户新建的任务走同一套结构，所以历史项点开之后的呈现方式完全一致。
const SEED_TASKS = [
  {
    id: "seed-weekly",
    title: "整理本周项目推进情况",
    brief: "结合本周项目周报和研发进度清单，整理一份适合周会汇报的项目推进摘要，突出已完成事项、当前风险和下周重点。",
    time: "刚刚",
    state: "done",
    sources: DEFAULT_SOURCES,
  },
  {
    id: "seed-prd",
    title: "生成产品需求文档",
    brief: "把上周评审通过的方案整理成一版可以直接交给研发的需求文档，包含目标、范围和验收标准。",
    time: "昨天",
    state: "done",
    sources: [{ id: "src-spec", title: "需求规格说明书.docx", meta: "私人资料库 / 项目" }],
  },
  {
    id: "seed-feedback",
    title: "分析用户反馈趋势",
    brief: "汇总最近一个月的用户反馈，按主题归类并指出增长最快的问题。",
    time: "8月25日",
    state: "done",
    sources: [{ id: "src-research", title: "用户研究摘要.pdf", meta: "私人资料库 / 产品知识" }],
  },
  {
    id: "seed-review",
    title: "准备月度例会汇报材料",
    brief: "按月度例会的固定结构，准备一份包含进展、风险和资源诉求的汇报材料。",
    time: "8月22日",
    state: "done",
    sources: [],
  },
];

// 任务标题取输入的第一句：换行、句号、问号都算断句，再截到 18 个字。
// 截断只发生在标题上，正文一律保留用户原话。
const makeTaskTitle = (text) => {
  const firstLine = text.trim().split(/[\n。？！?!]/).map((part) => part.trim()).find(Boolean) ?? text.trim();
  return firstLine.length > 18 ? `${firstLine.slice(0, 18)}…` : firstLine;
};

const MODES = ["auto", "quick", "deep"];
const MAX_ATTACHMENTS = 3;
// 资料库内部拖拽用自定义 MIME，和外部文件拖入（types 含 "Files"）区分开，
// 两者的落点反馈和语义都不一样：前者是引用已索引的资料，后者是本次会话的临时附件。
const LIBRARY_DRAG_TYPE = "application/x-yuanshu-library-file";

// 文件页的快捷提问：选好资料之后，多数人卡在"该问什么"，给三个最常用的起手式。
const FILE_QUICK_PROMPTS = [
  { id: "summary", label: "总结要点", build: (names) => `帮我总结${names}的关键要点` },
  { id: "todo", label: "提取待办", build: (names) => `从${names}里提取待办事项和对应负责人` },
  { id: "risk", label: "找风险", build: (names) => `指出${names}中的风险、缺口和需要确认的地方` },
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ToolButton({ active, children, onClick, ...props }) {
  return (
    <button
      className={`tool-control${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export function App() {
  // 开场是否播放在挂载时定死一次：中途重算会让幕布在动画进行中被卸载。
  const [opening] = useState(shouldPlayOpening);
  const [activeNav, setActiveNav] = useState("home");
  const [activeMode, setActiveMode] = useState("auto");
  const [prompt, setPrompt] = useState("");
  const [webEnabled, setWebEnabled] = useState(false);
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(true);
  const [phase, setPhase] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [activeTaskId, setActiveTaskId] = useState(SEED_TASKS[0].id);
  // stopped 存的是停下来时正在跑的那一步（0..3），没停止就是 null：
  // 任务页要把执行轨道停在那一格，光知道"停过"没法画。
  const [stopped, setStopped] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hint, setHint] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [libraryDragging, setLibraryDragging] = useState(false);
  const [fileSearchState, setFileSearchState] = useState({ active: false, empty: false });
  const isRunning = phase >= 0 && phase < PHASES.length;
  // 阶段推进的 effect 只依赖 [phase]，闭包里读 activeTaskId 会停在建任务那一刻的值。
  const activeTaskIdRef = useRef(activeTaskId);
  activeTaskIdRef.current = activeTaskId;
  const activeTask = tasks.find((item) => item.id === activeTaskId) ?? tasks[0];
  const appFrameRef = useRef(null);
  const homeViewRef = useRef(null);
  const taskViewRef = useRef(null);
  const taskPanelRef = useRef(null);
  const filePanelRef = useRef(null);
  const settingsPanelRef = useRef(null);
  const workPanelStateRef = useRef("tasks");
  const openingVeilRef = useRef(null);
  const openingFieldRef = useRef(null);
  const openingBrandRef = useRef(null);
  const openingCoreRef = useRef(null);
  const openingGlowRef = useRef(null);
  const igniteRef = useRef(null);
  const igniteGateRef = useRef(null);
  const igniteSparksRef = useRef(null);
  const openingMotesRef = useRef(null);
  const openingLinksRef = useRef(null);
  // 任务页输入条的收起量复位入口，由下面那条 scroll effect 挂上
  const dockCollapseApiRef = useRef(null);
  const companionEdgeRef = useRef(null);
  const navGlassRef = useRef(null);
  const navButtonRefs = useRef({});
  const navTransitionRef = useRef(null);
  const navMotionTweenRef = useRef(null);
  const navGlassTweenRef = useRef(null);
  const navGlassApiRef = useRef(null);
  const navLightApiRef = useRef(null);
  const navPreviewApiRef = useRef(null);
  const textareaRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const attachmentTrayRef = useRef(null);
  const dropLayerRef = useRef(null);
  const fileDragDepthRef = useRef(0);
  const workspaceRef = useRef(null);
  const workspaceGlowRef = useRef(null);
  // 工作区的矩形只在视口变化时才会变，但 pointermove 每次都读它就是每次强制布局。
  // 缓存一份，由下面那条 ResizeObserver 负责失效。
  const workspaceBoundsRef = useRef(null);
  const pointerFrameRef = useRef(null);
  const pointerRelaxTimerRef = useRef(null);
  const pointerKineticsRef = useRef({ x: null, y: null, time: 0 });
  const motionFieldRef = useRef(null);
  const motionFlareRef = useRef(null);
  const motionBeamRef = useRef(null);
  const motionEchoARef = useRef(null);
  const motionEchoBRef = useRef(null);
  const opticsApiRef = useRef(null);
  const companionBodyRef = useRef(null);
  const companionIntroRef = useRef(null);
  const companionSemanticRef = useRef(null);
  const companionFigureRef = useRef(null);
  const companionTaskFormRef = useRef(null);
  const companionMemoryFormRef = useRef(null);
  const companionPreviewRef = useRef(null);
  const companionFilePreviewRef = useRef(null);
  const companionHandoffRef = useRef(null);
  const companionMorphRef = useRef(null);
  const companionHaloRef = useRef(null);
  const companionCoreRef = useRef(null);
  const companionNodesRef = useRef(null);
  const settingsAnchorsRef = useRef(null);
  const settingsPulseRef = useRef(null);
  const sceneApiRef = useRef(null);
  const composerRef = useRef(null);
  const composerLightRef = useRef(null);
  const composerApiRef = useRef(null);
  const startButtonRef = useRef(null);
  const signalTransferRef = useRef(null);
  // 工具开关自己的信号点。不跟 signalTransferRef 共用：那一颗归"提交任务"和
  // "空提交"两条链路，开关途中提交会两边抢同一个元素。
  const toolSignalRef = useRef(null);
  const toolBloomTweenRef = useRef(null);
  const quickPromptTweenRef = useRef(null);
  const followupTraceRef = useRef(null);
  const companionEchoRef = useRef(null);
  const echoGateRef = useRef(null);
  const companionHaltRef = useRef(null);
  const haltGateRef = useRef(null);
  const scanRingRef = useRef(null);
  const chargeRailRef = useRef(null);
  const wordPulseRef = useRef(null);
  const chargeTweenRef = useRef(null);
  const lastPromptRef = useRef("");
  // 换任务的入场只在"用户点了另一条记录"时播；新建任务走的是路由转场 + 点火，
  // 两条一起放会在同一批元素上抢 x / autoAlpha。
  const taskSwitchRef = useRef(false);
  const taskPhaseBeamRef = useRef(null);
  const taskCompletionRef = useRef(null);
  const companionStateRef = useRef("home");
  const modeGroupRef = useRef(null);
  const modeGlassRef = useRef(null);
  const modeCausticRef = useRef(null);
  const modeApiRef = useRef(null);
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;
  const modeDragRef = useRef({
    pointerId: null,
    startX: 0,
    baseX: 0,
    x: 0,
    segmentWidth: 0,
    moved: false,
    suppressClick: false,
    lastClientX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const { contextSafe } = useGSAP({ scope: workspaceRef });

  useGSAP(() => {
    const field = motionFieldRef.current;
    const flare = motionFlareRef.current;
    const beam = motionBeamRef.current;
    const echoA = motionEchoARef.current;
    const echoB = motionEchoBRef.current;
    const companionBody = companionBodyRef.current;
    const companionHalo = companionHaloRef.current;
    const companionCore = companionCoreRef.current;
    const companionNodes = companionNodesRef.current;
    const composer = composerRef.current;
    const composerLight = composerLightRef.current;
    if (!field || !flare || !beam || !echoA || !echoB || !companionBody || !companionHalo || !companionCore || !companionNodes || !composer || !composerLight) return undefined;

    const media = gsap.matchMedia();
    media.add(
      {
        finePointer: "(pointer: fine)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { finePointer, reduceMotion } = context.conditions;
        gsap.set(field, { opacity: 0 });
        if (!finePointer || reduceMotion) return undefined;

        gsap.set([flare, beam, echoA, echoB], { x: 0, y: 0, force3D: true });
        gsap.set(beam, { rotation: 0, scaleX: .55, scaleY: 1, transformOrigin: "100% 50%" });

        const fieldOpacity = gsap.quickTo(field, "opacity", { duration: .28, ease: "power2.out" });
        const flareX = gsap.quickTo(flare, "x", { duration: .13, ease: "power3.out" });
        const flareY = gsap.quickTo(flare, "y", { duration: .13, ease: "power3.out" });
        const flareScaleX = gsap.quickTo(flare, "scaleX", { duration: .24, ease: "power3.out" });
        const flareScaleY = gsap.quickTo(flare, "scaleY", { duration: .24, ease: "power3.out" });
        const setFlareScale = (value) => {
          flareScaleX(value);
          flareScaleY(value);
        };
        const beamX = gsap.quickTo(beam, "x", { duration: .11, ease: "power3.out" });
        const beamY = gsap.quickTo(beam, "y", { duration: .11, ease: "power3.out" });
        const beamRotation = gsap.quickTo(beam, "rotation", { duration: .16, ease: "power2.out" });
        const beamScaleX = gsap.quickTo(beam, "scaleX", { duration: .2, ease: "power3.out" });
        const beamScaleY = gsap.quickTo(beam, "scaleY", { duration: .2, ease: "power3.out" });
        const echoAX = gsap.quickTo(echoA, "x", { duration: .24, ease: "power3.out" });
        const echoAY = gsap.quickTo(echoA, "y", { duration: .24, ease: "power3.out" });
        const echoBX = gsap.quickTo(echoB, "x", { duration: .38, ease: "power4.out" });
        const echoBY = gsap.quickTo(echoB, "y", { duration: .38, ease: "power4.out" });
        const bodyX = gsap.quickTo(companionBody, "x", { duration: .62, ease: "power3.out" });
        const bodyY = gsap.quickTo(companionBody, "y", { duration: .62, ease: "power3.out" });
        const haloX = gsap.quickTo(companionHalo, "x", { duration: .92, ease: "power4.out" });
        const haloY = gsap.quickTo(companionHalo, "y", { duration: .92, ease: "power4.out" });
        const nodesX = gsap.quickTo(companionNodes, "x", { duration: .44, ease: "power3.out" });
        const nodesY = gsap.quickTo(companionNodes, "y", { duration: .44, ease: "power3.out" });
        const coreX = gsap.quickTo(companionCore, "x", { duration: .28, ease: "power3.out" });
        const coreY = gsap.quickTo(companionCore, "y", { duration: .28, ease: "power3.out" });
        const composerX = gsap.quickTo(composerLight, "x", { duration: .34, ease: "power3.out" });
        const composerY = gsap.quickTo(composerLight, "y", { duration: .34, ease: "power3.out" });
        const composerOpacity = gsap.quickTo(composerLight, "opacity", { duration: .28, ease: "power2.out" });
        let dragging = false;

        opticsApiRef.current = {
          show() {
            fieldOpacity(dragging ? 1 : .5);
          },
          hide() {
            fieldOpacity(0);
          },
          move(x, y, angle, velocity) {
            flareX(x);
            flareY(y);
            beamX(x);
            beamY(y);
            beamRotation(angle);
            beamScaleX(.48 + velocity * 1.52);
            echoAX(x);
            echoAY(y);
            echoBX(x);
            echoBY(y);
          },
          settle() {
            beamScaleX(dragging ? 1.08 : .48);
            setFlareScale(dragging ? 1.24 : 1);
          },
          drag(active) {
            dragging = active;
            fieldOpacity(active ? 1 : .5);
            setFlareScale(active ? 1.24 : 1);
            beamScaleX(active ? 1.08 : .48);
            beamScaleY(active ? 1.36 : 1);
          },
        };

        sceneApiRef.current = {
          move(normalizedX, normalizedY) {
            bodyX(normalizedX * -10);
            bodyY(normalizedY * -7);
            haloX(normalizedX * 16);
            haloY(normalizedY * 11);
            nodesX(normalizedX * -5);
            nodesY(normalizedY * -4);
            coreX(normalizedX * 4.5);
            coreY(normalizedY * 3.5);
          },
          reset() {
            bodyX(0); bodyY(0);
            haloX(0); haloY(0);
            nodesX(0); nodesY(0);
            coreX(0); coreY(0);
          },
        };

        composerApiRef.current = {
          move(x, y) {
            composerX(x);
            composerY(y);
            composerOpacity(.9);
          },
          leave() {
            composerOpacity(0);
          },
          focus(active) {
            composerOpacity(active ? .72 : 0);
          },
        };

        return () => {
          opticsApiRef.current = null;
          sceneApiRef.current = null;
          composerApiRef.current = null;
        };
      },
    );

    return () => {
      opticsApiRef.current = null;
      sceneApiRef.current = null;
      composerApiRef.current = null;
      media.revert();
    };
  }, { scope: workspaceRef });

  useGSAP((context, contextSafeMode) => {
    const group = modeGroupRef.current;
    const glass = modeGlassRef.current;
    const caustic = modeCausticRef.current;
    if (!group || !glass || !caustic) return undefined;

    const getSegmentWidth = () => (group.getBoundingClientRect().width - 8) / MODES.length;
    const initialX = MODES.indexOf(activeMode) * getSegmentWidth();
    gsap.set([glass, caustic], { x: initialX, force3D: true });

    const glassX = gsap.quickTo(glass, "x", { duration: .075, ease: "power2.out" });
    const causticX = gsap.quickTo(caustic, "x", { duration: .11, ease: "power3.out" });
    const glassSkew = gsap.quickTo(glass, "skewX", { duration: .11, ease: "power2.out" });
    const causticSkew = gsap.quickTo(caustic, "skewX", { duration: .15, ease: "power3.out" });
    const glassScaleX = gsap.quickTo(glass, "scaleX", { duration: .11, ease: "power2.out" });
    const glassScaleY = gsap.quickTo(glass, "scaleY", { duration: .11, ease: "power2.out" });

    const snapToMode = contextSafeMode((index, velocity = 0, immediate = false) => {
      const targetX = index * getSegmentWidth();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.killTweensOf([glass, caustic]);
      if (reduceMotion || immediate) {
        gsap.set([glass, caustic], { x: targetX, skewX: 0, scaleX: 1, scaleY: 1 });
        return;
      }

      const overshoot = gsap.utils.clamp(-3.5, 3.5, velocity * 10);
      const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
      timeline
        .to(glass, {
          x: targetX + overshoot,
          skewX: gsap.utils.clamp(-3, 3, velocity * 6),
          scaleX: 1.018,
          scaleY: .986,
          duration: .3,
          ease: "power3.out",
        }, 0)
        .to(caustic, { x: targetX + overshoot * 1.35, skewX: 0, duration: .34, ease: "power3.out" }, 0)
        .to(glass, { x: targetX, skewX: 0, scaleX: 1, scaleY: 1, duration: .22, ease: "back.out(1.7)" }, .25)
        .to(caustic, { x: targetX, duration: .24, ease: "power2.out" }, .27);
    });

    modeApiRef.current = {
      move(x, velocity) {
        glassX(x);
        causticX(x + gsap.utils.clamp(-5, 5, velocity * 8));
        glassSkew(gsap.utils.clamp(-7, 7, velocity * 18));
        causticSkew(gsap.utils.clamp(-4, 4, velocity * 11));
        glassScaleX(1 + Math.min(.055, Math.abs(velocity) * .12));
        glassScaleY(.986);
      },
      snap: snapToMode,
    };

    const resizeObserver = new ResizeObserver(() => {
      snapToMode(MODES.indexOf(activeModeRef.current), 0, true);
    });
    resizeObserver.observe(group);

    return () => {
      resizeObserver.disconnect();
      modeApiRef.current = null;
    };
  }, { scope: workspaceRef });

  useGSAP(() => {
    const composer = composerRef.current;
    const dropLayer = dropLayerRef.current;
    if (!composer || !dropLayer) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });

    if (isFileDragging) {
      timeline
        .to(composer, {
          y: -7,
          scaleX: 1.008,
          scaleY: 1.035,
          duration: reduceMotion ? 0 : .32,
          ease: "power3.out",
        }, 0)
        .fromTo(
          dropLayer,
          { autoAlpha: 0, scale: .975 },
          { autoAlpha: 1, scale: 1, duration: reduceMotion ? 0 : .28, ease: "power3.out" },
          .03,
        );
    } else {
      timeline
        .to(dropLayer, { autoAlpha: 0, scale: .985, duration: reduceMotion ? 0 : .18, ease: "power2.in" }, 0)
        .to(composer, {
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: reduceMotion ? 0 : .34,
          ease: "back.out(1.45)",
        }, .04);
    }

    return () => timeline.kill();
  }, { dependencies: [isFileDragging], scope: workspaceRef, revertOnUpdate: true });

  useGSAP(() => {
    if (!attachments.length || !attachmentTrayRef.current) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chips = gsap.utils.toArray(".attachment-chip", attachmentTrayRef.current);
    const latest = chips[chips.length - 1];
    if (!latest) return undefined;
    const tween = gsap.fromTo(
      latest,
      { autoAlpha: 0, y: 7, scale: .94 },
      { autoAlpha: 1, y: 0, scale: 1, duration: reduceMotion ? 0 : .32, ease: "back.out(1.8)" },
    );
    return () => tween.kill();
  }, { dependencies: [attachments.length], scope: workspaceRef });

  // 按压反馈走事件委托而不是逐个绑定：新增控件自动获得同一手感，
  // 也不用担心某个按钮漏掉。压下去用 power2.out 立刻响应，抬起来用 back 回弹收尾。
  useGSAP(() => {
    const frame = appFrameRef.current;
    if (!frame) return undefined;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const PRESSABLE = [
        ".tool-control",
        ".mode-group button",
        ".capability-card",
        ".side-rail nav button",
        ".composer-suggestions button",
        ".context-chip button",
        ".task-history-list button",
        ".source-list button",
        ".answer-followup",
        ".settings-categories > button",
        ".settings-segmented button",
        ".settings-switch",
        ".settings-save",
        ".settings-reset",
      ].join(", ");
      const pressed = new Set();

      const release = () => {
        pressed.forEach((el) => gsap.to(el, { scale: 1, duration: .46, ease: EASE.settle, overwrite: "auto" }));
        pressed.clear();
      };
      const onDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const el = event.target.closest?.(PRESSABLE);
        if (!el || el.disabled || !frame.contains(el)) return;
        pressed.add(el);
        gsap.to(el, { scale: .955, duration: .14, ease: "power2.out", overwrite: "auto" });
      };

      frame.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
      return () => {
        frame.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
      };
    });

    // 能力卡的 hover 抬起：press 写 scale、hover 写 y，两条通道互不覆盖
    media.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray(".capability-card", frame);
      const enter = (event) => gsap.to(event.currentTarget, { y: -3, duration: .34, ease: EASE.glide, overwrite: "auto" });
      const leave = (event) => gsap.to(event.currentTarget, { y: 0, duration: .42, ease: EASE.settle, overwrite: "auto" });
      cards.forEach((card) => {
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
      });
      return () => cards.forEach((card) => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
      });
    });

    return () => media.revert();
  }, { scope: appFrameRef });

  useGSAP(() => {
    const frame = appFrameRef.current;
    const companionIntro = companionIntroRef.current;
    const companionFigure = companionFigureRef.current;
    if (!frame || !companionIntro || !companionFigure) return undefined;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const navItems = gsap.utils.toArray(".side-rail nav button");
      const heroItems = gsap.utils.toArray(".hero-copy > *");
      const nodes = gsap.utils.toArray(".companion-node");
      const composerEntranceItems = gsap.utils.toArray(".composer-input, .composer-toolbar");
      const capabilityCards = gsap.utils.toArray(".capability-card");
      const entranceTargets = [
        ".side-brand",
        ".workspace-brand",
        ".capability-area",
        ".capability-area .section-label",
        ...navItems,
        ...heroItems,
        // 有开场时能力节点归开场的「待命」那一拍（幕布还没升，节点被抬到幕布之上）。
        // 两条时间轴都写它们的 opacity，揭幕时会先藏起来再放一遍。
        ...(opening ? [] : nodes),
        ...capabilityCards,
        ...composerEntranceItems,
      ];

      // 界面骨架自己一条时间轴，立即播放。它不再等 752KB 的伴生体位图解码，
      // 否则导航项和输入条要到解码完成 + 1.4s 之后才落定，读起来就是卡顿。
      // 时间轴先 paused：首帧要把输入条 28px、导航玻璃 22px 等好几层 backdrop-filter
      // 第一次栅格化，实测这一帧 40ms 上下（120Hz 下等于丢 4 帧）。入场如果和这次重绘
      // 撞在一起，动画最快的那 40ms 正好卡在里面，读起来就是"框先抖一下"。
      // 让它等两帧：重绘先做完，动画再从头跑。元素在等待期间由 .from 的起始值按住，
      // 不会闪；这跟"骨架不等图片解码"是两回事——这里等的是一帧合成，不是 752KB 解码。
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(entranceTargets, { clearProps: "transform,opacity" });
        },
      });
      // 有开场时骨架不自播：它由开场在揭幕那一拍点火（见下面的 openingTimeline）。
      let startFrame = 0;
      if (!opening) {
        startFrame = requestAnimationFrame(() => {
          startFrame = requestAnimationFrame(() => timeline.play(0));
        });
      }

      timeline
        .addLabel("frame", 0)
        .from(".side-brand", { opacity: 0, x: -14, scale: .92, duration: .82, ease: EASE.reveal }, "frame+=.02")
        // 左栏是第一层信息，慢一拍逐个接通比整块同时闪现更稳。expo.out 保证每一项起步依然干脆，
        // 长尾负责"落定"的从容；四项排完约 1.0s，仍早于伴生体入场，不会拖住可交互时间。
        .from(navItems, { opacity: 0, x: -18, scale: .96, duration: .86, stagger: { each: .095, from: "start" }, ease: EASE.reveal }, "frame+=.12")
        .from(".workspace-brand", { opacity: 0, y: -7, duration: .26, ease: EASE.reveal }, "frame+=.04")
        // 标题带一丝几乎察觉不到的放大，读起来像"对上焦"而不是单纯淡入
        .from(heroItems, { opacity: 0, y: 16, scale: .988, duration: .34, stagger: .038, ease: EASE.reveal }, "frame+=.06")
        // 输入条的玻璃壳是常驻的（Flip 拥有它的几何，入场不许碰它的 opacity/transform），
        // 所以壳从第一帧就是实的。内容如果晚 100ms 才开始淡入，读起来就是"框先空着、
        // 里面的东西慢半拍冒出来"——这正是首屏刷新时那点卡顿感。把内容提到几乎与壳同时到达。
        .from(composerEntranceItems, { opacity: 0, y: 11, duration: .34, stagger: .022, ease: EASE.reveal }, "frame+=.03")
        // 容器只做位移，opacity 交给内部各元素——父子两层都淡入会相乘，读起来发闷
        .from(".capability-area", { y: 12, duration: .3, ease: EASE.reveal }, "frame+=.16")
        .from(".capability-area .section-label", { opacity: 0, duration: .26, ease: EASE.reveal }, "frame+=.17")
        // 三张能力卡从中间向两侧展开，比整块一起淡入更有秩序
        .from(capabilityCards, { opacity: 0, y: 10, scale: .97, duration: .34, stagger: { each: .05, from: "center" }, ease: EASE.reveal }, "frame+=.19");

      // 伴生体上的能力节点随机点亮，像逐个接通
      if (!opening) {
        timeline.from(nodes, { opacity: 0, scale: .62, duration: .34, stagger: { each: .045, from: "random" }, ease: EASE.settle }, "frame+=.22");
      }

      // 伴生体单独一条：只有它等解码，慢速展开不再拖住可交互时间。
      gsap.set(companionIntro, { willChange: "transform, opacity", force3D: true });
      const introTimeline = gsap.timeline({
        paused: true,
        onComplete: () => gsap.set(companionIntro, { clearProps: "willChange" }),
      });
      introTimeline
        .to(companionIntro, { autoAlpha: 1, duration: .9, ease: "power2.out" }, 0)
        .to(companionIntro, { x: 0, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }, 0);

      let cancelled = false;
      const playIntro = () => {
        if (!cancelled) introTimeline.play(0);
      };

      const companionHalo = companionHaloRef.current;
      const veil = openingVeilRef.current;
      const field = openingFieldRef.current;
      const brand = openingBrandRef.current;
      const openingCore = openingCoreRef.current;
      // 容器只负责定位，形体与对焦环各自独立补间：环要在核出现之前就先聚焦，
      // 如果它是容器 autoAlpha/scale 的子层，就会被容器一起按住或一起缩放。
      const bloom = openingCore?.querySelector(".core-bloom") ?? null;
      const flare = openingCore?.querySelector(".core-flare") ?? null;
      const ring = openingCore?.querySelector(".core-ring") ?? null;
      const lock = openingCore?.querySelector(".core-lock") ?? null;
      const moteHost = openingMotesRef.current;
      const linkHost = openingLinksRef.current;
      const glow = openingGlowRef.current;
      const ignite = igniteRef.current;
      const gate = igniteGateRef.current;
      // .companion-ignite 的 filter 被 SVG 亮度→alpha 占着，开场的亮度补间只能落在内层
      const igniteStack = ignite?.querySelector(".ignite-stack") ?? null;
      const edge = companionEdgeRef.current;
      const sparkHost = igniteSparksRef.current;
      const composerDock = composerRef.current;
      const runOpening = Boolean(
        opening && veil && field && brand && openingCore && bloom && flare && ring && lock && glow
        && ignite && igniteStack && gate && edge && sparkHost && moteHost && linkHost && companionHalo && composerDock,
      );

      // 图片是 object-fit: contain / object-position: center top，实际画面盒子比容器窄，
      // 核心的百分比必须换算到这个盒子里，否则核心特写和火花的起点会落偏。
      // 点火本身已经不需要这次测量了——闸门是贴图驱动的阈值，与版式无关。
      const measureCore = () => {
        const rect = ignite.getBoundingClientRect();
        let w = rect.width;
        let h = w / COMPANION_ASPECT;
        if (h > rect.height) {
          h = rect.height;
          w = h * COMPANION_ASPECT;
        }
        // 挂载那一刻栅格可能还没定宽（实测拿到过 0×489 的盒子，核心会落到左上角）。
        // 量不出有效盒子就退回百分比定位，绝不能把人留在黑屏里。
        if (!(w > 80)) {
          const fw = Math.max(rect.width, 280);
          const fx = fw * .44;
          const fy = Math.max(rect.height, 420) * .56;
          return { x: fx, y: fy, w: fw, vx: rect.left + fx, vy: rect.top + fy };
        }
        const x = (rect.width - w) / 2 + w * COMPANION_CORE.x;
        const y = h * COMPANION_CORE.y;
        // 光溢出层是 position: fixed，得拿视口坐标落位
        return { x, y, w, vx: rect.left + x, vy: rect.top + y };
      };

      // 火花的去向：贴着脉络主干的六个方向，不是均匀撒一圈。
      const SPARK_VECTORS = [[-.62, -.36], [.58, -.42], [-.74, .28], [.70, .24], [-.28, .64], [.36, .58]];

      // 尘埃的分布：[left%, top%, 直径px, 深度]。深度同时决定亮度、漂移幅度和入场
      // 先后——近的先亮、更亮、走得更远，远的最后才隐约浮出来。刻意避开画面正中
      // 那一块（核心和人物要在那里发生），也刻意不均匀：均匀撒点看起来像噪点图层，
      // 不像空气里的浮尘。
      // 直径给到 4–8px 而不是 2–3px：一颗 3px 的实点在 1400px 宽的画面上读起来像
      // 坏点，而这一层要的是"空气里有东西"。大而柔、亮度压到 .1–.4 才是浮尘。
      const MOTES = [
        [11, 26, 5.4, .58], [22, 71, 7.2, .84], [30, 13, 4.0, .30], [17, 47, 6.2, .70],
        [37, 84, 4.8, .46], [8, 62, 4.4, .40], [26, 36, 3.8, .26], [44, 18, 5.0, .54],
        [63, 79, 6.6, .76], [72, 24, 4.6, .48], [80, 57, 5.8, .64], [89, 33, 4.0, .32],
        [93, 68, 4.8, .50], [58, 9, 3.6, .24],
      ];

      let openingTimeline = null;
      let releaseSkip = null;
      let settled = false;

      // 层叠翻转和「整段结束」是两件事：翻转必须卡在幕布归零、输入条还没淡进来的那一格。
      const dropOpeningLayer = () => frame.classList.remove("is-opening");

      const settleOpening = () => {
        if (settled) return;
        settled = true;
        dropOpeningLayer();
        try { sessionStorage.setItem(OPENING_KEY, "1"); } catch { /* 隐私模式下记不住，下次再播一遍 */ }
        releaseSkip?.();
        // companionIntro 的 will-change 是在 effect 顶部无条件设的，本来由 introTimeline
        // 的 onComplete 回收——但走开场这条路时 introTimeline 从不播放，回收也就永远不发生，
        // 一个满屏大小的合成层提示会一直挂着（实测在已落定的页面上仍是
        // `will-change: transform, opacity`）。开场自己负责收干净。
        gsap.set([ignite, igniteStack, gate, field, flare, ring, bloom, lock, glow, edge, companionIntro], { clearProps: "willChange" });
        gsap.set(composerDock, { clearProps: "opacity,willChange" });
        gsap.set(nodes, { clearProps: "transform,opacity" });
        // 开场专用的那几层就此退场：留在文档里的话，遮罩和 screen 合成会一直挂在合成器上。
        // glow 必须在列表里——它是 132vmax 的圆，只把 autoAlpha 归零仍然是一个满屏
        // 的合成层挂在那里（漏掉它的那一版还顺带把文档撑成了 2582×2132）。
        gsap.set([veil, field, brand, openingCore, ignite, edge, sparkHost, linkHost, glow], { display: "none" });
      };

      if (runOpening) {
        frame.classList.add("is-opening");
        // 开场接管伴生体的显现：入场层直接就位，形体的 opacity 只由开场这一条驱动。
        // 父子两层同时补间 opacity 会相乘，这是这套原型踩过的老坑。
        // 形体的显现走入场层——这是文档里规定属于"伴生体首次显现"的通道。
        // 直接写 companionFigure 的 opacity 会被路由过渡 effect 挂载时的
        // gsap.set(companionFigure, { autoAlpha: 1 }) 冲掉。
        gsap.set(companionIntro, { autoAlpha: 0, x: 0, y: 0, scale: 1 });
        gsap.set(companionHalo, { opacity: 0 });
        gsap.set(ignite, { opacity: 0, willChange: "opacity, filter" });
        gsap.set(gate, { willChange: "filter" });
        gsap.set(field, { willChange: "transform, opacity" });
        gsap.set([flare, ring, bloom, lock, glow], { willChange: "transform, opacity" });
        gsap.set(edge, { willChange: "opacity" });
        // 开场期间输入条整体不可见，揭幕之后才落位——见下面幕七的交接说明。
        // 只写 opacity、不写 autoAlpha：visibility: hidden 会让 Chrome 跳过这一层的绘制，
        // 那 28px backdrop-filter 的首次栅格化就会被推到揭幕那一刻，正好撞上交棒。
        // 保留 will-change 让它在幕布后面就以合成层的身份把这次栅格化做掉。
        gsap.set(composerDock, { opacity: 0, willChange: "opacity" });

        // 编排在真正开演前才搭：挂载那一刻栅格可能还没定宽，等到 play 之前再量，
        // 量到的才是最终版式。
        const buildOpening = () => {
          const core = measureCore();
          const sparks = gsap.utils.toArray("i", sparkHost);
          const brandItems = gsap.utils.toArray(brand.children);
          const brandName = brand.querySelector("strong");

          gsap.set(openingCore, {
            left: core.x,
            top: core.y,
            width: core.w * .30,
            height: core.w * .30,
            xPercent: -50,
            yPercent: -50,
            autoAlpha: 1,
          });
          gsap.set(flare, { autoAlpha: 0, scale: .18 });
          gsap.set(ring, { autoAlpha: 0, scale: 2.6, rotate: -96 });
          gsap.set(bloom, { autoAlpha: 0, scale: 2.4 });
          gsap.set(lock, { autoAlpha: 0, scale: .5 });
          const motes = gsap.utils.toArray("i", moteHost);
          motes.forEach((el, i) => {
            const [mx, my, size] = MOTES[i];
            gsap.set(el, { left: `${mx}%`, top: `${my}%`, width: size, height: size, xPercent: -50, yPercent: -50, x: 0, y: 0, autoAlpha: 0 });
          });
          gsap.set(glow, { left: core.vx, top: core.vy, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: .12 });
          gsap.set(brand, { yPercent: -50 });

          // contrast 要跟着阈值走：推进 front 的边宽 ≈ 2t/C，C 固定的话 front 会从
          // 一团糊边一路收成硬线。夹在 [9, 24] 之间既保住软硬度，又保证未点亮处是实黑。
          const gateState = { t: GATE_T.start };
          const applyGate = () => {
            const t = gateState.t;
            const c = Math.min(24, Math.max(9, 22 * t));
            gate.style.filter = `brightness(${(.5 / t).toFixed(4)}) contrast(${c.toFixed(2)})`;
          };
          applyGate();

          // 每条线从核心量到对应节点的圆点，长度和角度都按实测算，只补间 scaleX
          // （transform-origin 在起点侧），线本身不重排。这段必须跑在时间轴构建之前：
          // 幕五那条 `.from(nodes, ...)` 的 immediateRender 会立刻把节点写成 scale .62，
          // 之后再量圆点，终点会朝节点中心偏十几个像素。
          const links = gsap.utils.toArray("i", linkHost);
          const hostRect = linkHost.getBoundingClientRect();
          const linkFromX = core.vx - hostRect.left;
          const linkFromY = core.vy - hostRect.top;
          const linkPlan = [];
          // 节点当场重查，不复用 effect 顶部那份 `nodes`：开演要等图片解码，这中间
          // React 可能已经重渲染过一轮，旧引用会脱离文档，量出来是一排 0×0 的盒子
          // ——四条线于是全部指向容器左上角（已踩过一次）。
          const liveNodes = gsap.utils.toArray(".companion-node", linkHost.parentElement);
          liveNodes.slice(0, links.length).forEach((node, i) => {
            const dot = node.querySelector("i");
            if (!dot) return;
            const r = dot.getBoundingClientRect();
            // 量到退化盒子就整条跳过：宁可少这一层，也不要一条指向画面角落的线
            if (!(r.width > 0)) return;
            const dx = r.left + r.width / 2 - hostRect.left - linkFromX;
            const dy = r.top + r.height / 2 - hostRect.top - linkFromY;
            const len = Math.hypot(dx, dy);
            // 量不到有效版式就不画线——宁可少这一层，也不要四条从左上角发散出去的线。
            if (!(len > 40)) return;
            // 只画后 42%：体内那段脉络已经讲完了，再叠一条直线只是乱；何况人物是近白的
            // 珍珠色，压在上面的线怎么调色都读不出来。从身体外缘引出去的一小段既避开了
            // 这个对比问题，也正是引线本来的样子。
            const HIDE = .58;
            gsap.set(links[i], {
              left: linkFromX + dx * HIDE,
              top: linkFromY + dy * HIDE,
              width: len * (1 - HIDE),
              rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`,
              scaleX: 0,
              autoAlpha: 0,
            });
            linkPlan.push({ el: links[i], at: 4.14 + i * .09 });
          });

          const tl = gsap.timeline({ paused: true, onComplete: settleOpening });

          tl
            // ── 幕一 · 场：把"黑屏"变成"一个有纵深的地方"。只走 transform + opacity，
            //    一次推近贯穿整段，不循环——指针这时候还没交还给页面，也不做视差跟随。
            .fromTo(field, { autoAlpha: 0, scale: 1.09 }, { autoAlpha: 1, duration: .92, ease: "power2.out" }, 0)
            .to(field, { scale: 1.015, duration: 5.4, ease: "power1.out" }, 0)

            // ── 幕二 · 核：先对焦、后点亮。对焦环从画面外收拢进来，核心在它收好之后
            //    才从虚无里凝出——「仪器先对上焦，东西才出现」比反过来更有因果。
            //    开场最初那 0.7s 原本只有底幕在淡入，注意力最集中的一拍是空的。
            .to(ring, { autoAlpha: .62, rotate: -14, scale: 1.18, duration: .86, ease: "power2.out" }, .30)
            // 对焦要真的对一次：环还在收的时候，核心先是一团没有形状的光，
            // 环锁定的同一拍它收拢、让位给晶体本体。先有光、后有形，
            // 而不是一个清晰的东西忽然出现——这是「对焦环」这个说法该兑现的东西。
            .to(bloom, { autoAlpha: .85, scale: 1.5, duration: .74, ease: "power2.out" }, .44)
            .to(flare, { autoAlpha: 1, duration: .44, ease: "power2.out" }, .72)
            .to(flare, { scale: 1, duration: .78, ease: EASE.reveal }, .72)
            .to(ring, { autoAlpha: .9, rotate: 0, scale: 1, duration: .46, ease: "power2.out" }, 1.16)
            .to(bloom, { autoAlpha: .34, scale: .8, duration: .52, ease: "power2.out" }, 1.16)
            .to(flare, { scale: .86, duration: .20, ease: "power2.inOut" }, 1.30)
            .to(flare, { scale: 1.02, duration: .18, ease: "power2.out" }, 1.50)
            // 合焦的那一下：环收到位的同一拍推出去一圈细环再散掉。没有它，
            // 幕二只是「环一直在收」，收到哪一格算收好没有交代。
            .fromTo(lock,
              { autoAlpha: .7, scale: .5 },
              { autoAlpha: 0, scale: 2.15, duration: .66, ease: "power2.out" }, 1.14)
            // 环收进核心里，正好被下一拍的放电顶开
            .to(ring, { autoAlpha: 0, scale: .34, duration: .44, ease: "power2.in" }, 1.58)

            // ── 幕三 · 传导：闸门沿测地距离推进。躯干快（.52s）、末梢慢（1.15s 长尾），
            //    像电流遇到阻抗。这两段的分界就是整段最该被看见的一拍。
            .to(ignite, { opacity: 1, duration: .28, ease: "power2.out" }, 1.58)
            .fromTo(igniteStack,
              { filter: "brightness(2.4) saturate(1.14)" },
              { filter: "brightness(1) saturate(1)", duration: 1.8, ease: "power2.out" }, 1.60)  // 与传导同起同止（1.60→3.40）
            // 躯干段：核心一炸，电流冲出胸口
            .to(gateState, { t: GATE_T.mid, duration: .55, ease: "power1.out", onUpdate: applyGate }, 1.60)
            // 末梢段：匀速爬向四肢和头顶。这一段刻意用 none——匀速推进最看得清"在走"，
            // 减速感交给末梢本身脉络稀疏，以及 igniteStack 那条同时收束的亮度补间。
            .to(gateState, { t: GATE_T.end, duration: 1.25, ease: "none", onUpdate: applyGate }, 2.15)
            .to(flare, { scale: 1.44, duration: .26, ease: "power2.out" }, 1.62)
            .to(flare, { scale: 1, duration: .52, ease: "power2.out" }, 1.88)
            // 放电的溢光：光打到舞台上再散开。没有这一层，核心亮得再狠也像贴在画面上的
            // 一张图；有了它，光才有落处。
            .to(bloom, { autoAlpha: .9, scale: 2.1, duration: .3, ease: "power2.out" }, 1.62)
            .to(bloom, { autoAlpha: .28, scale: 1.15, duration: .9, ease: "power2.out" }, 1.92)
            .to(glow, { autoAlpha: .85, scale: .42, duration: .42, ease: "power2.out" }, 1.62)
            .to(glow, { autoAlpha: .22, scale: .54, duration: 1.05, ease: "power2.out" }, 2.04)

            // ── 幕四 · 成形：亮边先把形体勾出来，实体再从描边里填出。
            //    椭圆遮罩只长高不长宽，读起来是"定形"，不是又一个圆在放大。
            //    描边必须先画完，实体才开始填：原先填充在 3.34 起步、描边要到 3.70 才收尾，
            //    等于身体在自己的轮廓还没画完时就长出来了。
            .to(edge, { autoAlpha: 1, duration: .22, ease: "power2.out" }, 2.88)
            .fromTo(edge, { "--edge-r": "0%" }, { "--edge-r": "132%", duration: .64, ease: "power2.inOut" }, 2.88)
            .to(companionIntro, { autoAlpha: 1, duration: .82, ease: "power2.out" }, 3.46)
            // 填充同时轻微收拢：实体是从描边里「压」出来的，不是一张图在原地变清楚。
            // 幅度压在 3%——再多就成了会被看出来的缩放动画，而不是体积感。
            .fromTo(companionIntro, { scale: 1.03 }, { scale: 1, duration: 1.15, ease: "power2.out" }, 3.46)
            .to(companionHalo, { opacity: 1, duration: .80, ease: "power2.out" }, 3.54)
            .to(edge, { autoAlpha: 0, duration: .48, ease: "power2.in" }, 3.60)
            .to(ignite, { opacity: .34, duration: .54, ease: "power2.out" }, 3.70)
            .to(openingCore, { autoAlpha: 0, duration: .50, ease: "power2.in" }, 3.76)

            // ── 幕五 · 待命：它醒了，在等你。一次呼吸 + 能力逐个接通。
            //    没有这一拍，成形之后直接揭幕会很仓促。
            .to(companionHalo, { scale: 1.05, duration: .44, ease: "sine.inOut" }, 4.20)
            .to(companionHalo, { scale: 1, duration: .50, ease: "sine.inOut" }, 4.64)
            .to(ignite, { opacity: .46, duration: .36, ease: "sine.inOut" }, 4.22)
            .to(ignite, { opacity: .34, duration: .52, ease: "sine.inOut" }, 4.58)
            // 顺序由 random 改成从上到下：连线要能对上是哪一个节点，「逐个接通」才读得出
            // 方向。随机顺序在没有连线的时候是「自然」，有了连线就成了乱线。
            .from(nodes, { opacity: 0, scale: .62, duration: .38, stagger: { each: .09, from: "start" }, ease: EASE.settle }, 4.20)

            // ── 幕六 · 品牌：落在人物左侧的空处，顺手把视线带到接下来要用的输入区。
            //    两条硬约束：最后一行必须先落定再谈退场（原先 .70s 时长配 .085 交错，
            //    末行 5.575s 才到位，而整块 5.56s 就开始撤——那行字从没完整出现过）；
            //    退场还必须赶在幕布透光之前走完，否则浅色字会压在正在变亮的工作台上糊成一团。
            .set(brand, { autoAlpha: 1 }, 4.50)
            .from(brandItems, { opacity: 0, y: 16, duration: .46, stagger: .06, ease: EASE.reveal }, 4.50)
            // 字标是被光擦出来的：遮罩从左往右推过去，两个字依次显形。
            // 只作用在这一行上，重绘面积跟全屏遮罩不是一个量级。
            .fromTo(brandName,
              { "--brand-wipe": "-32%" },
              { "--brand-wipe": "100%", duration: .78, ease: "power2.out" }, 4.54)
            .to(brand, { autoAlpha: 0, y: -10, duration: .36, ease: "power2.in" }, 5.20)

            // ── 幕七 · 交棒：幕布一开始淡出就交还指针。
            //    这里有一处层叠必须小心：开场把 .companion-wrap 抬到 z-39 才能盖住幕布，
            //    而输入条平时是 z-8、正常压在人物身上（实测两者重叠 361×185px）。
            //    原先 `is-opening` 要等整条时间轴跑完（6.42s）才摘，幕布 6.02s 就没了——
            //    中间 0.4s 人物是压在输入条前面的，把「开始执行」整个挡住，然后啪一下翻到后面，
            //    看起来就是「对话框先出现、再被盖到人身上」。
            //    解法是让这次层叠翻转发生在输入条还不可见的时候：幕布归零后先摘 `is-opening`，
            //    再把输入条淡进来——翻转那一帧屏幕上没有任何东西会变。
            // 揭幕不该是一块布凭空变淡：让伴生体的光在同一拍向外涨，
            // 黑暗是被这道光推开的。溢光挂在幕布外面（同为 z-38、DOM 在后），
            // 所以它能比幕布活得久一点，在工作台上留下最后一道余光再收掉。
            .to(glow, { autoAlpha: .5, scale: 1.15, duration: .66, ease: "power2.out" }, 5.34)
            .to(glow, { autoAlpha: 0, scale: 1.62, duration: .62, ease: "power2.in" }, 5.90)
            .to(veil, { autoAlpha: 0, duration: .54, ease: "power2.inOut" }, 5.40)
            .to(field, { autoAlpha: 0, duration: .46, ease: "power2.in" }, 5.44)
            .add(() => {
              veil.style.pointerEvents = "none";
              timeline.play(0);
            }, 5.50)
            .add(dropOpeningLayer, 5.96)
            .to(composerDock, { opacity: 1, duration: .40, ease: "power2.out" }, 5.96)
            .to(ignite, { opacity: 0, duration: .70, ease: "power2.out" }, 5.72);

          // 尘埃：跟着底幕一起浮上来，随后整段做一次极缓的单向漂移。不循环、不明灭——
          // 循环会把注意力拽回背景，而这段的主角在中间。深度越近的越先亮、越亮、走得越远，
          // 三档速度差就是纵深：这是幕一那句「把黑屏变成一个有纵深的地方」真正兑现的地方。
          // 幕布 5.40s 起淡出会把它们一起带走，不需要各自的退场补间。
          motes.forEach((el, i) => {
            const depth = MOTES[i][3];
            const at = .16 + (1 - depth) * .9;
            tl.to(el, { autoAlpha: .10 + depth * .30, duration: .9 + depth * .5, ease: "power2.out" }, at)
              .to(el, {
                y: -(9 + depth * 26),
                x: (i % 2 ? 1 : -1) * (3 + depth * 11),
                duration: 5.3,
                ease: "none",
              }, at);
          });

          // 接通的连线：比节点早 .06s 出发、早 .04s 到达——先接上、再亮起，顺序不能反。
          linkPlan.forEach(({ el, at }) => {
            tl.to(el, { autoAlpha: .62, duration: .12, ease: "power2.out" }, at)
              .to(el, { scaleX: 1, duration: .34, ease: "power2.out" }, at)
              // 节点亮起之后线就没有存在的理由了，且必须赶在揭幕之前撤干净
              .to(el, { autoAlpha: 0, duration: .44, ease: "power2.in" }, at + .52);
          });

          // 火花贴着脉络主干外冲：六颗，一次性，随传导的第一段出发。
          // 飞行距离压在核心宽度的 .22~.40 之间——再远就飞出躯干，读起来是飘在空处的
          // 白点而不是身体里跑动的信号。
          sparks.forEach((el, i) => {
            const [vx, vy] = SPARK_VECTORS[i];
            const dist = core.w * (.22 + (i % 3) * .09);
            const at = 1.66 + i * .07;
            gsap.set(el, { x: core.x, y: core.y, xPercent: -50, yPercent: -50, scale: .5 });
            tl.to(el, { autoAlpha: .8, duration: .16, ease: "power2.out" }, at)
              .to(el, { x: core.x + vx * dist, y: core.y + vy * dist, scale: 1, duration: .74, ease: "power2.out" }, at)
              .to(el, { autoAlpha: 0, duration: .40, ease: "power2.in" }, at + .34);
          });

          return tl;
        };

        // 核心特写是按实测像素定位的，开场期间改窗口尺寸（拖窗、转屏）就会飘离胸口。
        // 旧版开场只有 2.1s，这个窗口短到碰不上；6.4s 就够长了，得跟着版式重新落位。
        let resizeFrame = 0;
        const onResize = () => {
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(() => {
            const next = measureCore();
            gsap.set(openingCore, {
              left: next.x,
              top: next.y,
              width: next.w * .30,
              height: next.w * .30,
            });
            gsap.set(openingGlowRef.current, { left: next.vx, top: next.vy });
          });
        };
        window.addEventListener("resize", onResize);

        // 跳过：快进而不是硬切，整段编排在 ~1s 内走完，交接顺序不变
        let skipped = false;
        const skip = () => {
          skipped = true;
          if (openingTimeline && openingTimeline.timeScale() < 5) openingTimeline.timeScale(6);
        };
        window.addEventListener("pointerdown", skip);
        window.addEventListener("keydown", skip);

        // 后台标签页里 rAF 被节流，GSAP 会停在幕布还盖着的那一帧上——切回来看到的
        // 是一整屏黑，而不是工作台。隐藏就直接把编排走完（progress 的第二个参数
        // 必须是 false：默认 suppressEvents=true 会吞掉 5.5s 那次交棒回调，
        // 入场时间轴永远不会开火，界面就停在 .from 的起始值上，全是不可见的）。
        const onVisibility = () => {
          if (document.hidden) openingTimeline?.progress(1, false);
        };
        document.addEventListener("visibilitychange", onVisibility);

        releaseSkip = () => {
          window.removeEventListener("pointerdown", skip);
          window.removeEventListener("keydown", skip);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVisibility);
          cancelAnimationFrame(resizeFrame);
        };

        // 开场可以等解码（幕布是黑的，没人在等内容），但要封顶：
        // 解码异常时最多等 600ms 就开演，不能把人留在黑屏里。
        const start = () => {
          if (cancelled) return;
          openingTimeline = buildOpening();
          if (import.meta.env.DEV) window.__openingTimeline = openingTimeline;
          if (skipped) openingTimeline.timeScale(6);
          openingTimeline.play(0);
          if (document.hidden) openingTimeline.progress(1, false);
        };
        const decoded = companionFigure.complete && companionFigure.naturalWidth > 0
          ? Promise.resolve()
          : (typeof companionFigure.decode === "function"
            ? companionFigure.decode().catch(() => undefined)
            : new Promise((resolve) => {
              companionFigure.addEventListener("load", resolve, { once: true });
              companionFigure.addEventListener("error", resolve, { once: true });
            }));
        Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, 600))]).then(start);
      } else if (companionFigure.complete && companionFigure.naturalWidth > 0) {
        playIntro();
      } else if (typeof companionFigure.decode === "function") {
        companionFigure.decode().catch(() => undefined).then(playIntro);
      } else {
        companionFigure.addEventListener("load", playIntro, { once: true });
        companionFigure.addEventListener("error", playIntro, { once: true });
      }

      return () => {
        cancelled = true;
        cancelAnimationFrame(startFrame);
        releaseSkip?.();
        frame.classList.remove("is-opening");
        companionFigure.removeEventListener("load", playIntro);
        companionFigure.removeEventListener("error", playIntro);
        openingTimeline?.kill();
        introTimeline.kill();
        timeline.kill();
      };
    });

    // matchMedia 的回调是同步跑的，走到这里入场时间轴已经把起始值写成内联样式，
    // 可以安全地撤掉 CSS 的兜底隐藏。动效被禁用时回调不执行，这一句让元素直接可见。
    frame.classList.add("is-entrance-ready");

    return () => {
      media.revert();
      frame.classList.remove("is-entrance-ready");
    };
  }, { scope: appFrameRef });

  useGSAP((context, contextSafeNav) => {
    const navGlass = navGlassRef.current;
    const homeButton = navButtonRefs.current.home;
    if (!navGlass || !homeButton) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetOffset = (destination) => {
      const button = navButtonRefs.current[destination] ?? homeButton;
      return {
        x: button.offsetLeft - homeButton.offsetLeft,
        y: button.offsetTop - homeButton.offsetTop,
      };
    };

    const move = contextSafeNav((destination, duration = .54) => {
      const target = targetOffset(destination);
      navGlassTweenRef.current?.kill();
      if (reduceMotion) {
        gsap.set(navGlass, target);
        return;
      }
      navGlassTweenRef.current = gsap.to(navGlass, {
        ...target,
        scaleX: 1,
        scaleY: 1,
        duration,
        ease: "sine.inOut",
        overwrite: true,
      });
    });

    gsap.set(navGlass, targetOffset("home"));
    navGlassApiRef.current = { move };

    const observer = new ResizeObserver(() => {
      const activeButton = appFrameRef.current?.querySelector(".side-rail nav button[aria-current='page']");
      const destination = activeButton
        ? Object.entries(navButtonRefs.current).find(([, button]) => button === activeButton)?.[0]
        : "home";
      gsap.set(navGlass, targetOffset(destination ?? "home"));
    });
    observer.observe(homeButton.parentElement);

    return () => {
      observer.disconnect();
      navGlassTweenRef.current?.kill();
      navGlassApiRef.current = null;
    };
  }, { scope: appFrameRef });

  useGSAP(() => {
    const taskForm = companionTaskFormRef.current;
    const memoryForm = companionMemoryFormRef.current;
    if (!taskForm || !memoryForm) return undefined;

    const taskRegions = gsap.utils.toArray(".task-form-region", taskForm);
    const taskVisor = taskForm.querySelector(".task-form-visor");
    const taskCore = taskForm.querySelector(".task-form-core");
    const taskNeural = taskForm.querySelector(".task-form-neural");
    const memoryRegions = gsap.utils.toArray(".memory-form-region", memoryForm);
    const memoryVisor = memoryForm.querySelector(".memory-form-visor");
    const memoryCore = memoryForm.querySelector(".memory-form-core");
    const memoryNeural = memoryForm.querySelector(".memory-form-neural");
    const handoff = companionHandoffRef.current;
    const handoffCore = handoff?.querySelector(".state-handoff-core");
    const handoffAxis = handoff?.querySelector(".state-handoff-axis");
    const handoffRings = handoff ? gsap.utils.toArray(".state-handoff-ring", handoff) : [];
    const semanticLayer = companionSemanticRef.current;
    const workspace = workspaceRef.current;
    if (!taskVisor || !taskCore || !taskNeural || !memoryVisor || !memoryCore || !memoryNeural || !handoff || !handoffCore || !handoffAxis || !semanticLayer || !workspace) return undefined;

    const previous = companionStateRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    companionStateRef.current = activeNav;
    gsap.killTweensOf([semanticLayer, taskForm, memoryForm, handoff, handoffCore, handoffAxis, ...handoffRings, ...taskRegions, ...memoryRegions]);

    const taskVisible = activeNav === "tasks";
    const memoryVisible = activeNav === "files";
    const settingsVisible = activeNav === "settings";
    const memoryDimmed = memoryVisible && fileSearchState.empty;
    const settingsAnchors = settingsAnchorsRef.current;

    // 设置锚点是常驻层，不跟首页 4 个阶段节点抢同一份 DOM——切到设置时
    // 只淡入这一层，避免重挂节点 + !important 把主时间轴的隐藏态顶开造成一卡。
    if (settingsAnchors) {
      gsap.killTweensOf(settingsAnchors);
      if (reduceMotion) gsap.set(settingsAnchors, { autoAlpha: settingsVisible ? 1 : 0 });
      else if (settingsVisible) gsap.to(settingsAnchors, { autoAlpha: 1, duration: .32, ease: EASE.reveal, overwrite: "auto" });
      else if (previous === "settings") gsap.to(settingsAnchors, { autoAlpha: 0, duration: .18, ease: EASE.exit, overwrite: "auto" });
      else gsap.set(settingsAnchors, { autoAlpha: 0 });
    }

    if (reduceMotion) {
      gsap.set(taskForm, { autoAlpha: taskVisible ? 1 : 0 });
      gsap.set(taskRegions, { autoAlpha: taskVisible ? 1 : 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
      gsap.set(memoryForm, { autoAlpha: memoryVisible ? 1 : 0 });
      gsap.set(memoryRegions, { autoAlpha: memoryVisible ? (memoryDimmed ? .48 : 1) : 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
      gsap.set(handoff, { autoAlpha: 0 });
      gsap.set(semanticLayer, { x: 0, scaleX: 1, scaleY: 1 });
      workspace.classList.remove("is-companion-handoff");
      return undefined;
    }

    if (previous === activeNav && activeNav === "home") {
      gsap.set([taskForm, memoryForm, handoff, ...taskRegions, ...memoryRegions], { autoAlpha: 0 });
      return undefined;
    }

    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
    const switchingWorkForms = previous !== "home" && activeNav !== "home" && previous !== activeNav;
    const morphingWorkForms = switchingWorkForms && previous !== "settings" && activeNav !== "settings";

    if (morphingWorkForms) {
      workspace.classList.add("is-companion-handoff");
      gsap.set(handoff, { autoAlpha: 1 });
      gsap.set(handoffCore, { autoAlpha: 0, scaleX: .42, scaleY: .42 });
      gsap.set(handoffAxis, { autoAlpha: 0, scaleY: .08, transformOrigin: "50% 100%" });
      gsap.set(handoffRings, { autoAlpha: 0, scaleX: .38, scaleY: .38 });
      gsap.set(semanticLayer, { x: 0, scaleX: 1, scaleY: 1, transformOrigin: "52% 56%" });
      timeline
        .to(semanticLayer, { x: -34, scaleX: 1.024, scaleY: 1.024, duration: .2, ease: "power4.out" }, 0)
        .to(semanticLayer, { x: 0, scaleX: 1, scaleY: 1, duration: .28, ease: "power3.inOut" }, .24);
    } else {
      gsap.set(handoff, { autoAlpha: 0 });
      gsap.set(semanticLayer, { x: 0, scaleX: 1, scaleY: 1 });
      workspace.classList.remove("is-companion-handoff");
    }

    if (previous === activeNav && memoryVisible) {
      timeline
        .to(memoryVisor, { autoAlpha: memoryDimmed ? .46 : .96, scaleX: memoryDimmed ? .9 : 1, scaleY: memoryDimmed ? .9 : 1, duration: .24, ease: "power3.out" }, 0)
        .to(memoryCore, { autoAlpha: memoryDimmed ? .62 : 1, scaleX: memoryDimmed ? .84 : 1, scaleY: memoryDimmed ? .84 : 1, duration: .24, ease: "power3.out" }, 0)
        .to(memoryNeural, { autoAlpha: memoryDimmed ? .26 : .78, duration: .22, ease: "sine.inOut" }, 0);
      return () => timeline.kill();
    }

    if (activeNav === "home") {
      timeline
        .to(memoryRegions, { autoAlpha: 0, y: 7, scaleX: .94, scaleY: .94, duration: .24, stagger: { each: .018, from: "end" }, ease: "sine.in" }, 0)
        .to(taskRegions, { autoAlpha: 0, y: 5, scaleX: .96, scaleY: .96, duration: .28, stagger: { each: .015, from: "end" }, ease: "sine.in" }, 0)
        .set([taskForm, memoryForm], { autoAlpha: 0 });
    } else if (settingsVisible) {
      timeline
        .to(memoryRegions, { autoAlpha: 0, y: 4, scaleX: .92, scaleY: .92, duration: .18, stagger: { each: .01, from: "end" }, ease: "sine.in" }, 0)
        .to(taskRegions, { autoAlpha: 0, y: 4, scaleX: .92, scaleY: .92, duration: .18, stagger: { each: .01, from: "end" }, ease: "sine.in" }, 0)
        .set([taskForm, memoryForm, handoff], { autoAlpha: 0 }, .22);
    } else if (taskVisible && morphingWorkForms) {
      timeline
        .to(memoryVisor, { autoAlpha: .16, y: 3, scaleX: .36, scaleY: .9, duration: .16, ease: "power3.in" }, 0)
        .to(memoryNeural, { autoAlpha: .08, y: 7, scaleX: .5, scaleY: .76, duration: .2, ease: "power4.in" }, 0)
        .to(memoryCore, { autoAlpha: 1, scaleX: 1.14, scaleY: 1.14, duration: .13, ease: "power3.out" }, .03)
        .to(memoryCore, { autoAlpha: .18, scaleX: .38, scaleY: .38, duration: .15, ease: "power4.in" }, .15)
        .to(handoffCore, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: .16, ease: "power4.out" }, .08)
        .to(handoffRings, { autoAlpha: .72, scaleX: 1.45, scaleY: 1.45, duration: .28, stagger: .035, ease: "power3.out" }, .1)
        .to(handoffAxis, { autoAlpha: .88, scaleY: 1, duration: .2, ease: "power3.out" }, .13)
        .set(taskForm, { autoAlpha: 1 }, .17)
        .set(taskCore, { autoAlpha: .24, y: 0, scaleX: .5, scaleY: .5 }, .17)
        .set(taskVisor, { autoAlpha: .12, y: 7, scaleX: .34, scaleY: .82 }, .2)
        .set(taskNeural, { autoAlpha: 0, y: 10, scaleX: .72, scaleY: .56 }, .22)
        .to(taskCore, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: .24, ease: "expo.out" }, .18)
        .to(taskVisor, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, duration: .3, ease: "power4.out" }, .22)
        .to(taskNeural, { autoAlpha: .9, y: 0, scaleX: 1, scaleY: 1, duration: .3, ease: "power4.out" }, .26)
        .to([handoffCore, handoffAxis, ...handoffRings], { autoAlpha: 0, duration: .16, ease: "sine.out" }, .39)
        .set([memoryForm, handoff], { autoAlpha: 0 }, .54);
    } else if (memoryVisible && morphingWorkForms) {
      timeline
        .to(taskVisor, { autoAlpha: .15, y: 4, scaleX: .32, scaleY: .88, duration: .16, ease: "power3.in" }, 0)
        .to(taskNeural, { autoAlpha: .08, y: 8, scaleX: .52, scaleY: .7, duration: .2, ease: "power4.in" }, 0)
        .to(taskCore, { autoAlpha: 1, scaleX: 1.16, scaleY: 1.16, duration: .13, ease: "power3.out" }, .03)
        .to(taskCore, { autoAlpha: .18, scaleX: .36, scaleY: .36, duration: .15, ease: "power4.in" }, .15)
        .to(handoffCore, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: .16, ease: "power4.out" }, .08)
        .to(handoffRings, { autoAlpha: .78, scaleX: 1.52, scaleY: 1.52, duration: .3, stagger: .035, ease: "power3.out" }, .1)
        .to(handoffAxis, { autoAlpha: .92, scaleY: 1, duration: .21, ease: "power3.out" }, .13)
        .set(memoryForm, { autoAlpha: 1 }, .17)
        .set(memoryCore, { autoAlpha: .22, y: 0, scaleX: .46, scaleY: .46 }, .17)
        .set(memoryVisor, { autoAlpha: .12, y: 6, scaleX: .28, scaleY: .82 }, .2)
        .set(memoryNeural, { autoAlpha: 0, y: 8, scaleX: .34, scaleY: .72 }, .22)
        .to(memoryCore, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: .24, ease: "expo.out" }, .18)
        .to(memoryVisor, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, duration: .31, ease: "power4.out" }, .22)
        .to(memoryNeural, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, duration: .32, ease: "power4.out" }, .24)
        .to([handoffCore, handoffAxis, ...handoffRings], { autoAlpha: 0, duration: .16, ease: "sine.out" }, .4)
        .set([taskForm, handoff], { autoAlpha: 0 }, .54);
    } else if (taskVisible) {
      timeline
        .to(memoryRegions, { autoAlpha: 0, y: 5, scaleX: .95, scaleY: .95, duration: .16, stagger: { each: .012, from: "end" }, ease: "sine.in" }, 0)
        .set(taskForm, { autoAlpha: 1 }, .04)
        .to(taskVisor, { autoAlpha: .92, y: 0, scaleX: 1, scaleY: 1, duration: .34, ease: "power4.out" }, .05)
        .to(taskCore, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, duration: .4, ease: "expo.out" }, .1)
        .to(taskNeural, { autoAlpha: .72, y: 0, scaleX: 1, scaleY: 1, duration: .42, ease: "power3.out" }, .14)
        .set(memoryForm, { autoAlpha: 0 }, .28);
    } else if (memoryVisible) {
      timeline
        .to(taskRegions, { autoAlpha: 0, y: 5, scaleX: .96, scaleY: .96, duration: .16, stagger: { each: .012, from: "end" }, ease: "sine.in" }, 0)
        .set(memoryForm, { autoAlpha: 1 }, .04)
        .to(memoryVisor, { autoAlpha: .96, y: 0, scaleX: 1, scaleY: 1, duration: .34, ease: "power4.out" }, .05)
        .to(memoryCore, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, duration: .4, ease: "expo.out" }, .1)
        .to(memoryNeural, { autoAlpha: .78, y: 0, scaleX: 1, scaleY: 1, duration: .42, ease: "power3.out" }, .14)
        .set(taskForm, { autoAlpha: 0 }, .28);
    } else {
      timeline.set([taskForm, memoryForm, handoff], { autoAlpha: 0 });
    }

    timeline.eventCallback("onComplete", () => {
      workspace.classList.remove("is-companion-handoff");
      gsap.set(semanticLayer, { x: 0, scaleX: 1, scaleY: 1 });
    });

    return () => {
      timeline.kill();
      workspace.classList.remove("is-companion-handoff");
      gsap.set(semanticLayer, { x: 0, scaleX: 1, scaleY: 1 });
    };
  }, {
    dependencies: [activeNav, fileSearchState.empty],
    scope: appFrameRef,
  });

  // 改一条偏好，对应的语义锚点回应一次——和任务页"执行时从伴生体对应区域向当前
  // 步骤发一次有限脉冲"是同一条规则：状态驱动、有限、可中断、reduced motion 下不播。
  useGSAP((context, contextSafePulse) => {
    const nodesRoot = settingsAnchorsRef.current;
    if (!nodesRoot) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pulseAt = (anchorIndex, at, timeline) => {
      const node = nodesRoot.querySelector(`.node-${anchorIndex + 1}`);
      const dot = node?.querySelector("i");
      const label = node?.querySelector("em");
      if (!dot || !label) return;
      gsap.killTweensOf([dot, label]);
      timeline
        .to(dot, { scale: 1.42, duration: .15, ease: EASE.glide }, at)
        .to(dot, { scale: 1, duration: .46, ease: EASE.settle }, at + .15)
        .to(label, { x: 4, duration: .16, ease: EASE.glide }, at + .04)
        .to(label, { x: 0, duration: .42, ease: EASE.settle }, at + .2);
    };

    settingsPulseRef.current = {
      // 改一条偏好，对应的锚点回应一次
      pulse: contextSafePulse((anchorIndex) => {
        if (reduceMotion) return;
        pulseAt(anchorIndex, 0, gsap.timeline());
      }),
      // 保存：三个锚点按序各亮一次，最后一颗亮起的那一拍正好接上按钮的收拢环
      sweep: contextSafePulse(() => {
        if (reduceMotion) return;
        const timeline = gsap.timeline();
        SETTINGS_ANCHORS.forEach((_, index) => pulseAt(index, index * .08, timeline));
      }),
      // 恢复默认：整排锚点暗一拍再回来。只压圆点自己的 opacity，
      // 不碰容器——容器的 autoAlpha 归页面状态时间轴所有。
      dim: contextSafePulse(() => {
        if (reduceMotion) return;
        const dots = gsap.utils.toArray(".companion-node i", nodesRoot);
        if (!dots.length) return;
        gsap.killTweensOf(dots);
        gsap.timeline()
          .to(dots, { opacity: .3, duration: .12, ease: EASE.exit }, 0)
          .to(dots, { opacity: 1, duration: .42, ease: EASE.reveal }, .14);
      }),
    };

    return () => {
      settingsPulseRef.current = null;
    };
  }, { scope: appFrameRef });

  useGSAP(() => {
    const workspace = workspaceRef.current;
    const homeView = homeViewRef.current;
    const taskView = taskViewRef.current;
    const companionFigure = companionFigureRef.current;
    const companionWrap = companionFigure?.closest(".companion-wrap");
    const morphField = companionMorphRef.current;
    const homeButton = navButtonRefs.current.home;
    const composer = composerRef.current;
    const homeNodes = companionNodesRef.current;
    const ambientStatus = workspace?.querySelector(".ambient-status");
    const coreSignal = companionCoreRef.current?.querySelector(".core-signal");
    if (!workspace || !homeView || !taskView || !companionFigure || !companionWrap || !morphField || !homeButton || !composer || !homeNodes || !ambientStatus || !coreSignal) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const energyBands = gsap.utils.toArray(".morph-band", morphField);
    const beats = PAGE_MOTION.beats;

    // 纵深起点：离场的往后退、进场的往前来，切换才不是平面互换
    gsap.set(taskView, { autoAlpha: 0, scale: .994, pointerEvents: "none" });
    gsap.set(ambientStatus, { autoAlpha: 1, y: 0 });
    gsap.set(companionFigure, { autoAlpha: 1, scale: 1, x: 0, y: 0, transformOrigin: "55% 62%" });
    gsap.set(companionWrap, { x: 0, scale: 1, opacity: 1 });
    gsap.set(morphField, { autoAlpha: 0 });
    gsap.set(energyBands, { scaleY: .12, opacity: 0, transformOrigin: "50% 100%" });

    if (reduceMotion) {
      navTransitionRef.current = {
        play: () => {
          gsap.set([homeView, homeNodes, ambientStatus, coreSignal], { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(taskView, { autoAlpha: 1, pointerEvents: "auto", x: 0, y: 0, scale: 1 });
          gsap.set(companionWrap, { x: getCompanionShift(window.innerWidth), scale: .93, opacity: .5 });
        },
        reverse: () => {
          gsap.set(taskView, { autoAlpha: 0, pointerEvents: "none" });
          gsap.set([homeView, homeNodes, ambientStatus, coreSignal], { autoAlpha: 1, pointerEvents: "auto", x: 0, y: 0, scale: 1 });
          gsap.set(companionWrap, { x: 0, scale: 1, opacity: 1 });
        },
      };
      navLightApiRef.current = { run: () => gsap.set([morphField, ...energyBands], { autoAlpha: 0 }) };
      return () => {
        navTransitionRef.current = null;
        navLightApiRef.current = null;
      };
    }

    const forwardLight = gsap.timeline({ paused: true });
    forwardLight
      .set(morphField, { autoAlpha: 0 }, 0)
      .set(energyBands, { scaleY: .12, opacity: 0, y: 30 }, 0)
      .to(morphField, { autoAlpha: .68, duration: .1, ease: "sine.out" }, 0)
      .fromTo(energyBands,
        { scaleY: .12, opacity: 0, y: 30 },
        { scaleY: 1, opacity: .68, y: 0, duration: .2, stagger: .015, ease: "power3.out", immediateRender: false },
        .03,
      )
      .to(energyBands, { scaleY: .1, opacity: 0, y: -34, duration: .24, stagger: .012, ease: "sine.in" }, .22)
      .to(morphField, { autoAlpha: 0, duration: .2, ease: "sine.inOut" }, .28);

    const reverseLight = gsap.timeline({ paused: true });
    reverseLight
      .set(morphField, { autoAlpha: 0 }, 0)
      .set(energyBands, { scaleY: .42, opacity: 0, y: -8 }, 0)
      .to(morphField, { autoAlpha: .42, duration: .07, ease: "sine.out" }, 0)
      .fromTo(energyBands,
        { scaleY: .42, opacity: 0, y: -8 },
        { scaleY: .66, opacity: .4, y: 0, duration: .11, stagger: .008, ease: "power2.out", immediateRender: false },
        .01,
      )
      .to(energyBands, { scaleY: .08, opacity: 0, y: 18, duration: .16, stagger: .008, ease: "sine.in" }, .11)
      .to(morphField, { autoAlpha: 0, duration: .14, ease: "sine.inOut" }, .14);

    navLightApiRef.current = {
      run(destination) {
        forwardLight.pause(0);
        reverseLight.pause(0);
        if (destination === "home") reverseLight.restart();
        else forwardLight.restart();
      },
    };

    const timeline = gsap.timeline({ paused: true });
    timeline
      .addLabel("idle", 0)
      .to(ambientStatus, { autoAlpha: 0, y: -7, duration: .16, ease: "sine.in" }, beats.navPress)
      .to(homeView, { autoAlpha: 0, x: -20, scale: .988, pointerEvents: "none", duration: .42, ease: EASE.swap }, beats.attention)
      .to(homeNodes, { autoAlpha: 0, x: 16, duration: .3, ease: EASE.exit }, beats.attention + .02)
      .to(coreSignal, { autoAlpha: 0, scale: .72, duration: .24, ease: EASE.exit }, beats.attention + .02)
      // 工作区容器只做空间与可见性交接；人物语义和面板内容由各自时间轴接管。
      .to(taskView, { autoAlpha: 1, duration: .14, ease: "sine.out" }, beats.migration)
      .to(taskView, { scale: 1, duration: .52, ease: EASE.glide }, beats.migration)
      .set(taskView, { pointerEvents: "auto" }, beats.connect)
      .to(companionWrap, {
        x: () => getCompanionShift(window.innerWidth),
        scale: .93,
        opacity: .5,
        duration: .82,
        ease: EASE.swap,
      }, beats.release)
      .addLabel("work", beats.settled);

    navTransitionRef.current = timeline;
    return () => {
      navMotionTweenRef.current?.kill();
      forwardLight.kill();
      reverseLight.kill();
      timeline.kill();
      navTransitionRef.current = null;
      navLightApiRef.current = null;
    };
  }, { scope: appFrameRef });

  useGSAP(() => {
    const panels = { tasks: taskPanelRef.current, files: filePanelRef.current, settings: settingsPanelRef.current };
    if (Object.values(panels).some((panel) => !panel)) return undefined;

    if (activeNav === "home") return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const destination = panels[activeNav];
    const previous = workPanelStateRef.current;
    const source = panels[previous];
    const masterProgress = navTransitionRef.current?.progress?.() ?? 0;
    const enteringFromHome = masterProgress < .08;
    // 回答卡不参与整块淡入——它的段落由滚动逐条点亮，容器再淡一次就会两层相乘
    const taskRevealItems = gsap.utils.toArray(".task-thread-head, .user-brief, .execution-step, .source-rail > *, .task-history > *", panels.tasks);
    const answerCard = panels.tasks.querySelector(".answer-card");
    const executionLineFills = gsap.utils.toArray(".execution-line > i", panels.tasks);
    const taskLive = panels.tasks.querySelector(".task-live");
    const fileHeader = panels.files.querySelector(".files-head");
    const fileOrbits = gsap.utils.toArray(".memory-orbit", panels.files);
    const filePreview = panels.files.querySelector(".memory-preview");
    const sessionFiles = panels.files.querySelector(".session-files");
    const fileRevealItems = [fileHeader, ...fileOrbits, filePreview, sessionFiles].filter(Boolean);
    const settingsRevealItems = gsap.utils.toArray(".settings-reveal", panels.settings);
    const allPanels = Object.values(panels);

    workPanelStateRef.current = activeNav;
    gsap.killTweensOf([...allPanels, answerCard, ...taskRevealItems, ...executionLineFills, ...fileRevealItems, ...settingsRevealItems].filter(Boolean));

    if (reduceMotion) {
      gsap.set(allPanels.filter((panel) => panel !== destination), { autoAlpha: 0, x: 0, pointerEvents: "none" });
      gsap.set(destination, { autoAlpha: 1, x: 0, pointerEvents: "auto" });
      gsap.set(taskRevealItems, { autoAlpha: 1, x: 0, y: 0 });
      if (answerCard) gsap.set(answerCard, { x: 0, y: 0 });
      gsap.set(executionLineFills, { scaleY: 1 });
      gsap.set(fileRevealItems, { autoAlpha: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 });
      gsap.set(settingsRevealItems, { autoAlpha: 1, x: 0, y: 0 });
      if (taskLive) gsap.set(taskLive, { scaleX: 1, scaleY: 1 });
      return undefined;
    }

    if (previous === activeNav || enteringFromHome) {
      gsap.set(allPanels.filter((panel) => panel !== destination), { autoAlpha: 0, x: 0, pointerEvents: "none" });
      gsap.set(destination, { autoAlpha: 1, x: 0, pointerEvents: "auto" });
      const reveal = gsap.timeline({ delay: enteringFromHome ? .16 : 0, defaults: { ease: EASE.reveal } });
      if (activeNav === "tasks") {
        gsap.set(taskRevealItems, { autoAlpha: 0, y: 14 });
        if (answerCard) gsap.set(answerCard, { y: 14 });
        gsap.set(executionLineFills, { scaleY: 0, transformOrigin: "50% 0%" });
        if (taskLive) gsap.set(taskLive, { scaleX: .965, scaleY: .965 });
        reveal
          .to(taskRevealItems, { autoAlpha: 1, y: 0, duration: .4, stagger: .014 }, 0)
          .to(answerCard, { y: 0, duration: .44 }, .06)
          .to(executionLineFills, { scaleY: 1, duration: .24, ease: "power2.out" }, .18);
        if (taskLive) reveal.to(taskLive, { scaleX: 1, scaleY: 1, duration: .24, ease: EASE.settle }, .28);
      } else if (activeNav === "files") {
        gsap.set(fileHeader, { autoAlpha: 0, y: 8 });
        gsap.set(fileOrbits, { autoAlpha: 0, x: 28, scaleX: .94, scaleY: 1, transformOrigin: "100% 50%" });
        if (filePreview) gsap.set(filePreview, { autoAlpha: 0, x: 14, scaleX: .99, scaleY: .99 });
        if (sessionFiles) gsap.set(sessionFiles, { autoAlpha: 0, y: 10 });
        reveal
          .to(fileHeader, { autoAlpha: 1, y: 0, duration: .3 }, 0)
          .to(fileOrbits, { autoAlpha: 1, x: 0, scaleX: 1, scaleY: 1, duration: .42, stagger: .035, ease: EASE.glide }, .04);
        if (filePreview) reveal.to(filePreview, { autoAlpha: 1, x: 0, scaleX: 1, scaleY: 1, duration: .34, ease: EASE.glide }, .2);
        if (sessionFiles) reveal.to(sessionFiles, { autoAlpha: 1, y: 0, duration: .3 }, .26);
      } else {
        gsap.set(settingsRevealItems, { autoAlpha: 1, x: 0, y: 0 });
      }
      return () => reveal.kill();
    }

    const panelOrder = { tasks: 0, files: 1, settings: 2 };
    const direction = panelOrder[activeNav] > panelOrder[previous] ? 1 : -1;
    const timeline = gsap.timeline({ defaults: { ease: EASE.swap } });
    timeline
      .set(destination, { autoAlpha: 0, x: 18 * direction, scale: .995, pointerEvents: "none" }, 0)
      .to(source, { autoAlpha: 0, x: -14 * direction, scale: .995, duration: .22, pointerEvents: "none", ease: EASE.exit }, 0)
      // 可见性交接短促收尾，位移单独走长一点的曲线；父子两层 opacity 不再相乘
      .to(destination, { autoAlpha: 1, duration: .16, ease: "sine.out" }, .1)
      .to(destination, { x: 0, scale: 1, duration: .46, pointerEvents: "auto", ease: EASE.glide }, .1);

    if (activeNav === "files") {
      gsap.set(fileHeader, { autoAlpha: 0, y: 6 });
      gsap.set(fileOrbits, { autoAlpha: 0, x: 22, scaleX: .96, scaleY: 1, transformOrigin: "100% 50%" });
      if (filePreview) gsap.set(filePreview, { autoAlpha: 0, x: 12, scaleX: .992, scaleY: .992 });
      if (sessionFiles) gsap.set(sessionFiles, { autoAlpha: 0, y: 8 });
      timeline
        .to(fileHeader, { autoAlpha: 1, y: 0, duration: .24 }, .12)
        .to(fileOrbits, { autoAlpha: 1, x: 0, scaleX: 1, scaleY: 1, duration: .32, stagger: .025, ease: EASE.glide }, .12);
      if (filePreview) timeline.to(filePreview, { autoAlpha: 1, x: 0, scaleX: 1, scaleY: 1, duration: .28, ease: EASE.glide }, .2);
      if (sessionFiles) timeline.to(sessionFiles, { autoAlpha: 1, y: 0, duration: .24 }, .24);
    } else if (activeNav === "tasks") {
      gsap.set(taskRevealItems, { autoAlpha: 0, x: 12, y: 0 });
      if (answerCard) gsap.set(answerCard, { x: 12, y: 0 });
      gsap.set(executionLineFills, { scaleY: 0, transformOrigin: "50% 0%" });
      if (taskLive) gsap.set(taskLive, { scaleX: .97, scaleY: .97 });
      timeline
        .to(taskRevealItems, { autoAlpha: 1, x: 0, duration: .34, stagger: .012, ease: EASE.glide }, .14)
        .to(answerCard, { x: 0, duration: .38, ease: EASE.glide }, .16)
        .to(executionLineFills, { scaleY: 1, duration: .22, ease: "power2.out" }, .22);
      if (taskLive) timeline.to(taskLive, { scaleX: 1, scaleY: 1, duration: .2, ease: EASE.settle }, .28);
    } else {
      gsap.set(settingsRevealItems, { autoAlpha: 1, x: 0, y: 0 });
    }

    return () => timeline.kill();
  }, { dependencies: [activeNav], scope: appFrameRef });

  useGSAP((context, contextSafePreview) => {
    const taskPreview = companionPreviewRef.current;
    const filePreview = companionFilePreviewRef.current;
    if (!taskPreview || !filePreview) return undefined;

    const previewVisor = taskPreview.querySelector(".intent-preview-visor");
    const previewCore = taskPreview.querySelector(".intent-preview-core");
    const previewPaths = gsap.utils.toArray(".intent-preview-path", taskPreview);
    const filePreviewRegions = gsap.utils.toArray(".file-preview-region", filePreview);
    const filePreviewVisor = filePreview.querySelector(".file-preview-visor");
    const filePreviewCore = filePreview.querySelector(".file-preview-core");
    const filePreviewNeural = filePreview.querySelector(".file-preview-neural");
    if (!previewVisor || !previewCore || !filePreviewVisor || !filePreviewCore || !filePreviewNeural) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set([taskPreview, filePreview], { autoAlpha: 0 });
    gsap.set(previewVisor, { autoAlpha: 0, y: 8, scaleY: .88 });
    gsap.set(previewCore, { autoAlpha: 0, scaleX: .58, scaleY: .58 });
    gsap.set(previewPaths, { autoAlpha: 0, scaleY: .12, transformOrigin: "50% 100%" });
    gsap.set(filePreviewRegions, { autoAlpha: 0, y: 5, scaleX: .82, scaleY: .82 });

    if (reduceMotion) {
      navPreviewApiRef.current = {
        show: (mode) => { if (mode !== "settings") gsap.set(mode === "files" ? filePreview : taskPreview, { autoAlpha: .28 }); },
        hide: () => gsap.set([taskPreview, filePreview], { autoAlpha: 0 }),
        commit: () => gsap.set([taskPreview, filePreview], { autoAlpha: 0 }),
      };
      return () => {
        navPreviewApiRef.current = null;
      };
    }

    const taskTimeline = gsap.timeline({ paused: true });
    taskTimeline
      .addLabel("idle", 0)
      .to(taskPreview, { autoAlpha: .82, duration: .18, ease: "sine.out" }, 0)
      .to(previewVisor, { autoAlpha: .66, y: 0, scaleY: 1, duration: .34, ease: "power3.out" }, .02)
      .to(previewCore, { autoAlpha: .9, scaleX: 1, scaleY: 1, duration: .34, ease: "power4.out" }, .06)
      .to(previewPaths, {
        autoAlpha: .42,
        scaleY: 1,
        duration: .34,
        stagger: { each: .028, from: "center" },
        ease: "power3.out",
      }, .08)
      .addLabel("ready", .42);

    const fileTimeline = gsap.timeline({ paused: true });
    fileTimeline
      .addLabel("idle", 0)
      .to(filePreview, { autoAlpha: .66, duration: .14, ease: "sine.out" }, 0)
      .to(filePreviewVisor, { autoAlpha: .52, y: 0, scaleX: 1, scaleY: 1, duration: .28, ease: "power4.out" }, .02)
      .to(filePreviewCore, { autoAlpha: .72, y: 0, scaleX: 1, scaleY: 1, duration: .32, ease: "power4.out" }, .05)
      .to(filePreviewNeural, { autoAlpha: .26, y: 0, scaleX: 1, scaleY: 1, duration: .3, ease: "power3.out" }, .08)
      .addLabel("ready", .38);

    let taskPlayhead = null;
    let filePlayhead = null;
    let activePreview = null;
    const moveTimeline = (timeline, destination, duration, kind) => {
      const currentTween = kind === "files" ? filePlayhead : taskPlayhead;
      currentTween?.kill();
      const nextTween = gsap.to(timeline, {
        progress: destination,
        duration,
        ease: destination ? "power3.out" : "sine.inOut",
        overwrite: true,
      });
      if (kind === "files") filePlayhead = nextTween;
      else taskPlayhead = nextTween;
    };

    // 设置没有独立的预演层：它的语义就是那三个常驻锚点，浮到微光即可。
    const settingsAnchors = settingsAnchorsRef.current;
    const showSettingsHint = (on) => {
      if (!settingsAnchors) return;
      gsap.killTweensOf(settingsAnchors);
      gsap.to(settingsAnchors, {
        autoAlpha: on ? .34 : 0,
        duration: on ? .26 : .18,
        ease: on ? EASE.reveal : EASE.exit,
        overwrite: "auto",
      });
    };

    const hideAll = contextSafePreview((duration = COMPANION_MOTION.previewOut) => {
      moveTimeline(taskTimeline, 0, duration, "tasks");
      moveTimeline(fileTimeline, 0, duration, "files");
      showSettingsHint(false);
      activePreview = null;
    });

    navPreviewApiRef.current = {
      show: contextSafePreview((mode) => {
        if (mode !== "tasks" && mode !== "files" && mode !== "settings") return;
        activePreview = mode;
        if (mode === "settings") {
          moveTimeline(taskTimeline, 0, COMPANION_MOTION.previewOut, "tasks");
          moveTimeline(fileTimeline, 0, COMPANION_MOTION.previewOut, "files");
          showSettingsHint(true);
          return;
        }
        showSettingsHint(false);
        if (mode === "files") {
          moveTimeline(taskTimeline, 0, COMPANION_MOTION.previewOut, "tasks");
          moveTimeline(fileTimeline, 1, COMPANION_MOTION.previewIn, "files");
        } else {
          moveTimeline(fileTimeline, 0, COMPANION_MOTION.previewOut, "files");
          moveTimeline(taskTimeline, 1, COMPANION_MOTION.previewIn, "tasks");
        }
      }),
      hide: hideAll,
      commit: contextSafePreview((mode = activePreview) => {
        // 切到设置时预演层就是正式层，交接由页面状态时间轴接管，这里不能归零
        if (mode === "settings") {
          activePreview = null;
          return;
        }
        showSettingsHint(false);
        taskPlayhead?.kill();
        filePlayhead?.kill();
        const field = mode === "files" ? filePreview : taskPreview;
        const timeline = mode === "files" ? fileTimeline : taskTimeline;
        // 预演时间轴自己负责透明度；不要直接 overwrite 它的子 tween，
        // 否则第一次点击后，这个入口的 hover 预演会被永久杀掉。
        moveTimeline(timeline, 0, .2, mode);
        gsap.fromTo(field, {
          scaleX: 1.004,
          scaleY: 1.004,
        }, {
          scaleX: 1,
          scaleY: 1,
          duration: .2,
          ease: "sine.inOut",
          overwrite: "auto",
        });
        activePreview = null;
      }),
    };

    return () => {
      taskPlayhead?.kill();
      filePlayhead?.kill();
      taskTimeline.kill();
      fileTimeline.kill();
      navPreviewApiRef.current = null;
    };
  }, { scope: appFrameRef });

  useGSAP(() => {
    const workspace = workspaceRef.current;
    const taskView = taskViewRef.current;
    const taskForm = companionTaskFormRef.current;
    const beam = taskPhaseBeamRef.current;
    const completionField = taskCompletionRef.current;
    if (!workspace || !taskView || !taskForm || !beam || !completionField) return undefined;

    const origins = gsap.utils.toArray(".task-phase-origin", taskForm);
    const beamPulse = beam.querySelector("i");
    const beamHead = beam.querySelector("b");
    const completionRings = gsap.utils.toArray("i", completionField);
    const taskCore = taskForm.querySelector(".task-form-core");
    const answerCard = taskView.querySelector(".answer-card");
    const answerPieces = gsap.utils.toArray(".answer-reveal-piece", taskView);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!beamPulse || !beamHead || !taskCore || !answerCard || origins.length !== PHASES.length) return undefined;

    gsap.killTweensOf([beam, beamPulse, beamHead, completionField, ...completionRings, ...origins]);
    gsap.set(beam, { autoAlpha: 0, scaleX: 0, transformOrigin: "0 50%" });
    gsap.set([beamPulse, beamHead], { autoAlpha: 0, x: 0 });
    gsap.set(completionField, { autoAlpha: 0 });
    gsap.set(completionRings, { autoAlpha: 0, scale: .4 });
    gsap.set(origins, { autoAlpha: 0, x: 0, y: 0, scale: .7 });

    if (activeNav !== "tasks") return undefined;

    const pageProgress = navTransitionRef.current?.progress?.() ?? 1;
    const lifecycleDelay = pageProgress < .98
      ? getFlipDuration(pageProgress, 1) + .06
      : 0;

    if (reduceMotion) {
      if (finished) gsap.set(answerPieces, { autoAlpha: 1, y: 0 });
      return undefined;
    }

    if (finished) {
      const coreBounds = taskCore.getBoundingClientRect();
      const coreX = coreBounds.left + coreBounds.width * .42;
      const coreY = coreBounds.top + coreBounds.height * .57;
      const timeline = gsap.timeline({ delay: lifecycleDelay, defaults: { ease: "power3.out" } });

      timeline
        .fromTo(origins,
          { autoAlpha: 0, scale: .55 },
          { autoAlpha: .72, scale: 1, duration: .24, stagger: { each: .035, from: "edges" } },
          0,
        )
        .to(origins, {
          x: (_, origin) => {
            const bounds = origin.getBoundingClientRect();
            return coreX - (bounds.left + bounds.width / 2);
          },
          y: (_, origin) => {
            const bounds = origin.getBoundingClientRect();
            return coreY - (bounds.top + bounds.height / 2);
          },
          scale: .22,
          autoAlpha: 0,
          duration: .46,
          stagger: { each: .025, from: "edges" },
          ease: "power4.in",
        }, .24)
        .to(completionField, { autoAlpha: 1, duration: .08 }, .58)
        .fromTo(completionRings,
          { autoAlpha: .72, scale: .42 },
          { autoAlpha: 0, scale: 1.65, duration: .62, stagger: .075, ease: "power3.out", immediateRender: false },
          .58,
        )
        .fromTo(taskCore,
          { scale: .985 },
          { scale: 1.035, duration: .24, repeat: 1, yoyo: true, ease: "sine.inOut", immediateRender: false },
          .62,
        )
        .fromTo(answerCard,
          { y: 5, scale: .995 },
          { y: 0, scale: 1, duration: .42, ease: "power3.out", immediateRender: false },
          .72,
        );

      return () => timeline.kill();
    }

    if (phase < 0 || phase >= PHASES.length) return undefined;

    const origin = origins[phase];
    const target = taskView.querySelector(`[data-phase-index="${phase}"] > span`);
    if (!origin || !target) return undefined;

    const workspaceBounds = workspace.getBoundingClientRect();
    const originBounds = origin.getBoundingClientRect();
    const targetBounds = target.getBoundingClientRect();
    const startX = originBounds.left + originBounds.width / 2 - workspaceBounds.left;
    const startY = originBounds.top + originBounds.height / 2 - workspaceBounds.top;
    const targetX = targetBounds.left + targetBounds.width / 2 - workspaceBounds.left;
    const targetY = targetBounds.top + targetBounds.height / 2 - workspaceBounds.top;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const distance = Math.hypot(deltaX, deltaY);
    const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    gsap.set(beam, { x: startX, y: startY, width: distance, rotation, scaleX: 0, autoAlpha: 0 });
    const timeline = gsap.timeline({ delay: lifecycleDelay, defaults: { ease: "power3.out" } });
    timeline
      .fromTo(origin,
        { autoAlpha: 0, scale: .62 },
        { autoAlpha: 1, scale: 1, duration: .24, ease: "back.out(1.4)", immediateRender: false },
        0,
      )
      .to(beam, { autoAlpha: .76, scaleX: 1, duration: .34, ease: "power3.inOut" }, .08)
      .fromTo(beamPulse,
        { autoAlpha: 0, x: 0, scale: .5 },
        { autoAlpha: 1, x: distance, scale: 1, duration: .44, ease: "power2.inOut", immediateRender: false },
        .16,
      )
      .fromTo(beamHead,
        { autoAlpha: 0, x: 0, scale: .4 },
        { autoAlpha: .62, x: distance * .82, scale: .8, duration: .38, ease: "power1.inOut", immediateRender: false },
        .2,
      )
      .fromTo(target,
        { scale: .94 },
        { scale: 1.08, duration: .16, repeat: 1, yoyo: true, ease: "sine.inOut", immediateRender: false },
        .54,
      )
      .to([beam, beamPulse, beamHead], { autoAlpha: 0, duration: .24, ease: "sine.out" }, .65)
      .to(origin, { autoAlpha: .46, scale: .86, duration: .28, ease: "sine.out" }, .66);

    if (phase === PHASES.length - 1) {
      timeline.fromTo(answerPieces,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: .48, stagger: .065, ease: "power3.out", immediateRender: false },
        .42,
      );
    }

    return () => timeline.kill();
  }, {
    dependencies: [activeNav, phase, finished],
    scope: workspaceRef,
    revertOnUpdate: true,
  });

  useGSAP(() => {
    if (phase !== 0) return undefined;
    const composer = composerRef.current;
    const signal = signalTransferRef.current;
    const core = companionCoreRef.current;
    if (!composer || !signal || !core) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const nodes = gsap.utils.toArray(".companion-node");
    const signalBounds = signal.getBoundingClientRect();
    const coreBounds = core.getBoundingClientRect();
    const targetX = coreBounds.left + coreBounds.width * .432 - (signalBounds.left + signalBounds.width / 2);
    const targetY = coreBounds.top + coreBounds.height * .565 - (signalBounds.top + signalBounds.height / 2);
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    const shock = core.querySelector(".core-shock");
    if (shock) { gsap.killTweensOf(shock); gsap.set(shock, { autoAlpha: 0 }); }
    const echo = companionEchoRef.current;
    const echoGate = echoGateRef.current;

    timeline
      .addLabel("commit", 0)
      .to(composer, { y: 2, scaleX: .997, scaleY: .986, duration: .16, ease: "power2.in" }, "commit")
      .fromTo(
        signal,
        { x: 0, y: 0, scale: .42, opacity: 0 },
        { x: targetX * .38, y: targetY * .42, scale: 1, opacity: 1, duration: .3, ease: "power2.out" },
        "commit+=.1",
      )
      .to(signal, { x: targetX, y: targetY, scale: .18, opacity: 0, duration: .42, ease: "power4.in" }, "commit+=.4")
      .to(core, { scale: 1.18, duration: .2, ease: "power3.out", transformOrigin: "43.2% 56.5%" }, "commit+=.72")
      .to(core, { scale: 1, duration: .34, ease: "back.out(2)" }, "commit+=.86")
      .fromTo(nodes, { scale: .93 }, { scale: 1, duration: .36, stagger: .055, ease: "back.out(1.8)" }, "commit+=.7")
      .to(composer, { y: 0, scaleX: 1, scaleY: 1, duration: .42, ease: "power3.out" }, "commit+=.62");

    // 核心接住信号的同一拍推出一圈细环
    if (shock) {
      timeline.fromTo(shock,
        { autoAlpha: .7, scale: .4 },
        { autoAlpha: 0, scale: 2.4, duration: .52, ease: "power3.out", immediateRender: false },
        "commit+=.72");
    }

    // 脉络回声：复用开场的闸门技术，从核心沿测地距离场向外亮一次再退。
    // 闸门阈值和 brightness 是倒数关系，所以补间的对象必须是阈值本身——
    // 直接补 brightness 会被倒数前压成"上一帧核心、下一帧全亮"（开场踩过一次）。
    if (echo && echoGate) {
      const gate = { t: GATE_T.start };
      const applyEchoGate = () => {
        const c = Math.min(24, Math.max(9, 22 * gate.t));
        echoGate.style.filter = `brightness(${(.5 / gate.t).toFixed(4)}) contrast(${c.toFixed(2)})`;
      };
      applyEchoGate();
      // 峰值给到 .95 而不是 .62：这一拍伴生体正被路由转场压到 opacity .5，
      // 两层相乘之后 .62 只剩 .31，实测在浅色工作台上基本读不出来。
      // 推进也放慢到 .78s——传导要看得清在走，这是它跟"闪一下"的全部区别。
      timeline
        .set(echo, { display: "block", autoAlpha: 1 }, "commit+=.72")
        .fromTo(echo, { opacity: 0 }, { opacity: .95, duration: .16, ease: "power2.out" }, "commit+=.72")
        .to(gate, { t: GATE_T.end, duration: .78, ease: "power2.out", onUpdate: applyEchoGate }, "commit+=.76")
        .to(echo, { opacity: 0, duration: .34, ease: "power2.in" }, "commit+=1.46")
        .set(echo, { display: "none", autoAlpha: 0 }, "commit+=1.82")
        .add(() => { gate.t = GATE_T.start; applyEchoGate(); }, "commit+=1.82");
    }

    return () => timeline.kill();
  }, { dependencies: [phase], scope: workspaceRef, revertOnUpdate: true });

  useEffect(() => {
    if (phase < 0 || phase >= PHASES.length) return undefined;
    const timer = window.setTimeout(() => {
      if (phase === PHASES.length - 1) {
        setPhase(PHASES.length);
        setFinished(true);
        setTasks((current) => current.map((item) => (
          item.id === activeTaskIdRef.current ? { ...item, state: "done" } : item
        )));
      } else {
        setPhase((current) => current + 1);
      }
    }, phase === 0 ? 1350 : 1050);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => () => {
    window.cancelAnimationFrame(pointerFrameRef.current);
    window.clearTimeout(pointerRelaxTimerRef.current);
    quickPromptTweenRef.current?.kill();
    chargeTweenRef.current?.kill();
    toolBloomTweenRef.current?.kill();
  }, []);

  // 回声用的脉络贴图和流场图在空闲时先解码好。它们只有开场会主动加载，
  // 而开场每个会话只播一次——不预热的话，第二次进来的第一次提交会撞上解码。
  useEffect(() => {
    const warm = () => {
      ["/assets/companion-ignite-map-v1.webp", "/assets/companion-ignite-flow-v2.webp",
        "/assets/companion-halt-map-v1.webp"].forEach((src) => {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
      });
    };
    const idle = window.requestIdleCallback;
    const handle = idle ? idle(warm, { timeout: 3000 }) : window.setTimeout(warm, 1200);
    return () => {
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  // 工作区矩形的缓存失效：只有视口/外壳尺寸变了才需要重新量一次。
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return undefined;
    const invalidate = () => { workspaceBoundsRef.current = null; };
    invalidate();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(invalidate);
    observer?.observe(workspace);
    window.addEventListener("resize", invalidate);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  const runInvalidSubmitFeedback = contextSafe(() => {
    const button = startButtonRef.current;
    const input = textareaRef.current;
    const signal = signalTransferRef.current;
    if (!button || !input || !signal) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const signalBounds = signal.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();
    const inputBounds = input.getBoundingClientRect();
    const fromX = buttonBounds.left + buttonBounds.width * .34 - (signalBounds.left + signalBounds.width / 2);
    const fromY = buttonBounds.top + buttonBounds.height / 2 - (signalBounds.top + signalBounds.height / 2);
    const targetX = inputBounds.right - 46 - (signalBounds.left + signalBounds.width / 2);
    const targetY = inputBounds.top + inputBounds.height * .52 - (signalBounds.top + signalBounds.height / 2);
    const inputShell = input.parentElement;

    gsap.killTweensOf([signal, inputShell]);
    const timeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => gsap.set(signal, { clearProps: "transform,opacity" }),
    });
    timeline
      .fromTo(
        signal,
        { x: fromX, y: fromY, scale: .42, opacity: 0 },
        { x: fromX - 18, y: fromY - 6, scale: .72, opacity: .9, duration: reduceMotion ? 0 : .12, ease: "power2.out" },
        0,
      )
      .to(signal, {
        x: targetX,
        y: targetY,
        scale: .28,
        opacity: 0,
        duration: reduceMotion ? 0 : .36,
        ease: "power3.inOut",
      }, .1)
      .fromTo(
        inputShell,
        { y: 2, scaleX: .996 },
        { y: 0, scaleX: 1, duration: reduceMotion ? 0 : .3, ease: "back.out(1.65)" },
        .3,
      );
  });

  // 工具开关不是一个孤立的高亮：开启时从按钮向伴生体对应区域送一颗信号点，
  // 到达后那一处亮一次；关闭时原路收回。资料库指向头部（记忆），联网指向肩部（对外）。
  // 目标点按人物图的实测盒子换算，不写死像素——版式一变死值就会落到空处。
  const runToolSignal = contextSafe((kind, active) => {
    const signal = toolSignalRef.current;
    const figure = companionFigureRef.current;
    const workspace = workspaceRef.current;
    const button = workspace?.querySelector(`.tool-control[data-tool="${kind}"]`);
    const icon = button?.querySelector("svg");
    if (!signal || !figure || !workspace || !button) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (icon && !reduceMotion) {
      gsap.killTweensOf(icon);
      gsap.fromTo(icon, { rotationY: active ? -180 : 180 }, {
        rotationY: 0, duration: .42, ease: EASE.settle, overwrite: "auto", clearProps: "transform",
      });
    }
    if (reduceMotion) return;

    // 图片是 object-fit: contain，画面盒子比容器窄，百分比得换算进这个盒子。
    const box = figure.getBoundingClientRect();
    let w = box.width;
    let h = w / COMPANION_ASPECT;
    if (h > box.height) { h = box.height; w = h * COMPANION_ASPECT; }
    if (!(w > 80)) return;
    const left = box.left + (box.width - w) / 2;
    // 资料库落在头部（记忆），联网落在右肩（对外连接）
    const point = kind === "knowledge" ? { x: .436, y: .205 } : { x: .60, y: .40 };
    const target = { x: left + w * point.x, y: box.top + h * point.y };

    const bounds = signal.getBoundingClientRect();
    const origin = button.getBoundingClientRect();
    const from = {
      x: origin.left + origin.width * .3 - (bounds.left + bounds.width / 2),
      y: origin.top + origin.height / 2 - (bounds.top + bounds.height / 2),
    };
    const to = {
      x: target.x - (bounds.left + bounds.width / 2),
      y: target.y - (bounds.top + bounds.height / 2),
    };
    const dot = signal.querySelector(".tool-signal-dot");
    const bloom = signal.querySelector(".tool-signal-bloom");
    if (!dot || !bloom) return;

    gsap.killTweensOf([dot, bloom]);
    const start = active ? from : to;
    const end = active ? to : from;
    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
    timeline
      .fromTo(dot,
        { x: start.x, y: start.y, scale: .4, autoAlpha: 0 },
        { autoAlpha: 1, scale: 1, duration: .12, ease: "power2.out" }, 0)
      .to(dot, { x: end.x, y: end.y, duration: .38, ease: active ? "power3.inOut" : "power2.in" }, .04)
      .to(dot, { scale: .3, autoAlpha: 0, duration: .16, ease: "power2.in" }, .34);
    // 开启才在落点绽一下；关闭是收回，落点不该再亮。
    // immediateRender: false 是必须的——默认 true 会在时间轴构建那一刻就把
    // autoAlpha .85 写上去，绽放会提前 .36s 亮在落点上等着信号点飞过来。
    // 绽放不放进上面那条时间轴：时间轴的 defaults 带 overwrite: "auto"，
    // 这条 fromTo 初始化时会把同一目标上待执行的补间（包括收尾用的 set）一并杀掉，
    // 于是连打之后它会停在起始值 .85 上常亮（实测连打 12 次必现）。
    // 独立成一条自管生命周期的补间：进来先杀旧的、归零，播完再显式钉死终态。
    toolBloomTweenRef.current?.kill();
    gsap.set(bloom, { autoAlpha: 0 });
    if (active) {
      toolBloomTweenRef.current = gsap.fromTo(bloom,
        { x: to.x, y: to.y, scale: .3, autoAlpha: .85 },
        {
          scale: 1.9,
          autoAlpha: 0,
          duration: .52,
          delay: .36,
          ease: "power3.out",
          immediateRender: false,
          overwrite: true,
          onComplete: () => gsap.set(bloom, { autoAlpha: 0 }),
        });
    }
  });

  // 这一次任务实际带上的资料：用户自己挑的优先，没挑但资料库开着就算作一次检索命中，
  // 两者都没有就是空——来源栏据此显示空态，而不是凭空写两条。
  const buildTaskSources = () => {
    const picked = attachments.map((item) => ({
      id: item.id,
      title: item.name,
      meta: item.source === "library" ? item.location : "本次会话附件",
    }));
    if (picked.length) return picked;
    return knowledgeEnabled ? DEFAULT_SOURCES : [];
  };

  const startTask = ({ withPointerMotion = false } = {}) => {
    const text = prompt.trim();
    if (!text) {
      setHint(activeNav === "files" ? "选一份资料，或先告诉我你想问什么" : "先告诉我你想完成什么");
      textareaRef.current?.focus();
      if (withPointerMotion) runInvalidSubmitFeedback();
      return;
    }
    const task = {
      id: `task-${Date.now()}`,
      title: makeTaskTitle(text),
      brief: text,
      time: "刚刚",
      state: "running",
      sources: buildTaskSources(),
    };
    setHint("");
    setFinished(false);
    setShowResult(false);
    setStopped(null);
    // 新任务插到最前，历史保留 8 条——再多这一栏就要自己滚动了，而它不该抢注意力。
    setTasks((current) => [task, ...current].slice(0, 8));
    setActiveTaskId(task.id);
    // 输入框交出去就清空：留着原文的话，再按一次执行就会静默地把同一句重新提交一遍。
    setPrompt("");
    // 新任务从头读，输入条也要从收起状态回来
    dockCollapseApiRef.current?.();
    // 执行过程（轨道、回答、来源）全在任务视图里，留在首页就只剩状态卡那一行字。
    if (activeNav !== "tasks") {
      handleNavSelect("tasks");
      // 等转场把工作台交接完再点火，否则第一拍的能量脉冲会打在还在移动的轨道上。
      window.setTimeout(() => setPhase(0), 380);
      return;
    }
    setPhase(0);
  };

  // 停止：把编排退回未执行态。阶段推进的 timer 挂在 [phase] 那条 effect 上，
  // phase 一变它的 cleanup 就会 clearTimeout，不需要另外记 timer id。
  const stopTask = () => {
    if (!isRunning) return;
    setPhase(-1);
    setFinished(false);
    setShowResult(false);
    setStopped(phase);
    setTasks((current) => current.map((item) => (
      item.id === activeTaskIdRef.current ? { ...item, state: "stopped" } : item
    )));
  };

  // 重新执行：停下来的那条原样再跑一遍，不用用户把话重打一次。
  const retryTask = () => {
    if (isRunning || !activeTask) return;
    setStopped(null);
    setFinished(false);
    setShowResult(false);
    dockCollapseApiRef.current?.();
    setTasks((current) => current.map((item) => (
      item.id === activeTask.id ? { ...item, state: "running" } : item
    )));
    setPhase(0);
  };

  // 切换到另一条任务记录：执行中不允许切走，否则正在跑的那条会失去落点。
  // 换任务是一次"换页"而不是内容瞬间替换：正文先整体左退淡出，落定之后才提交
  // state，新内容再从右侧进来（入场那半在下面 [activeTaskId] 那条 effect 里）。
  const selectTask = contextSafe((taskId) => {
    if (isRunning || taskId === activeTaskId) return;
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const commit = () => {
      taskSwitchRef.current = true;
      setActiveTaskId(taskId);
      setShowResult(false);
      setStopped(null);
      setHint("");
      dockCollapseApiRef.current?.();
      if (task.state === "done") {
        setPhase(PHASES.length);
        setFinished(true);
      } else {
        setPhase(-1);
        setFinished(false);
      }
    };

    const thread = taskPanelRef.current?.querySelector(".task-thread");
    if (!thread || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }
    const groups = gsap.utils.toArray(".task-thread-head, .user-brief, .execution-trace, .answer-card", thread);
    if (!groups.length) {
      commit();
      return;
    }
    gsap.killTweensOf(groups);
    gsap.timeline({ onComplete: commit })
      .to(groups, { x: -10, autoAlpha: 0, duration: .13, stagger: .014, ease: EASE.exit }, 0);
  });

  const handlePrimaryAction = () => {
    // 执行中主按钮是唯一的出口：原先它是 disabled，一旦点了执行就只能等 4.5s 走完。
    if (isRunning) {
      stopTask();
      return;
    }
    // 输入框里有话就一定是开新任务——"查看成果"只在没话可说的时候才是主按钮的身份。
    // 顺序反过来的话，做完一件事之后打字再点执行，只会把上一条的成果卡开开合合。
    if (finished && !prompt.trim()) {
      setShowResult((value) => !value);
      return;
    }
    startTask({ withPointerMotion: true });
  };

  const readWorkspaceBounds = () => {
    const cached = workspaceBoundsRef.current;
    if (cached) return cached;
    const workspace = workspaceRef.current;
    if (!workspace) return null;
    const bounds = workspace.getBoundingClientRect();
    workspaceBoundsRef.current = bounds;
    return bounds;
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const bounds = readWorkspaceBounds();
    if (!bounds) return;
    const pointerX = Math.min(bounds.width, Math.max(0, event.clientX - bounds.left));
    const pointerY = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
    const x = pointerX / bounds.width;
    const y = pointerY / bounds.height;
    const previous = pointerKineticsRef.current;
    const elapsed = Math.max(12, event.timeStamp - previous.time);
    const deltaX = previous.x === null ? 0 : pointerX - previous.x;
    const deltaY = previous.y === null ? 0 : pointerY - previous.y;
    const velocity = Math.min(1, Math.hypot(deltaX, deltaY) / elapsed / 1.35);
    const angle = previous.x === null ? 0 : Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    pointerKineticsRef.current = { x: pointerX, y: pointerY, time: event.timeStamp };
    opticsApiRef.current?.show();
    opticsApiRef.current?.move(pointerX, pointerY, angle, velocity);
    sceneApiRef.current?.move(x - .5, y - .5);

    // 光斑坐标写在 .workspace-glow 这一个叶子节点上，不写 .workspace：
    // 自定义属性是继承的，写在工作区上会让它下面 800 多个后代整棵重算样式。
    const glow = workspaceGlowRef.current;
    if (glow) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = window.requestAnimationFrame(() => {
        glow.style.setProperty("--pointer-x", `${x * 100}%`);
        glow.style.setProperty("--pointer-y", `${y * 100}%`);
      });
    }
    window.clearTimeout(pointerRelaxTimerRef.current);
    pointerRelaxTimerRef.current = window.setTimeout(() => {
      opticsApiRef.current?.settle();
    }, 90);
  };

  const resetPointer = () => {
    const glow = workspaceGlowRef.current;
    if (glow) {
      glow.style.setProperty("--pointer-x", "68%");
      glow.style.setProperty("--pointer-y", "38%");
    }
    window.cancelAnimationFrame(pointerFrameRef.current);
    window.clearTimeout(pointerRelaxTimerRef.current);
    opticsApiRef.current?.hide();
    sceneApiRef.current?.reset();
    pointerKineticsRef.current = { x: null, y: null, time: 0 };
  };

  // 追问：把光标交给输入框就够了。不要往里预填「基于「上一条标题」，」——那串前缀会
  // 原样进到下一条任务的标题里，追问第二次就成了「基于「基于「…」，」，」（已踩过一次）。
  // 输入框在任务页的 placeholder 本来就是"继续追问或补充要求…"，引导已经在了。
  const continueTask = contextSafe((event) => {
    setShowResult(false);
    if (activeNav !== "tasks") handleNavSelect("tasks");
    const origin = event?.currentTarget?.getBoundingClientRect?.();
    window.requestAnimationFrame(() => {
      dockCollapseApiRef.current?.();
      textareaRef.current?.focus();
      if (!origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const trace = followupTraceRef.current;
      const textarea = textareaRef.current;
      const ring = composerRef.current?.querySelector(".composer-arrival-ring");
      if (!trace || !textarea) return;
      const target = textarea.getBoundingClientRect();
      const base = trace.getBoundingClientRect();
      const from = {
        x: origin.left + origin.width / 2 - (base.left + base.width / 2),
        y: origin.top + origin.height / 2 - (base.top + base.height / 2),
      };
      const to = {
        x: target.left + 18 - (base.left + base.width / 2),
        y: target.top + 14 - (base.top + base.height / 2),
      };

      gsap.killTweensOf(trace);
      if (ring) { gsap.killTweensOf(ring); gsap.set(ring, { autoAlpha: 0 }); }
      const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
      // 没装 MotionPath，弧线用"两个轴不同缓动"做出来：x 匀速、y 后段才落，
      // 合出来就是一条抛向输入框的二次曲线。
      timeline
        .fromTo(trace, { x: from.x, y: from.y, scale: .5, autoAlpha: 0 },
          { autoAlpha: 1, scale: 1, duration: .1, ease: "power2.out" }, 0)
        .to(trace, { x: to.x, duration: .26, ease: "none" }, 0)
        .to(trace, { y: to.y, duration: .26, ease: "power2.in" }, 0)
        .to(trace, { scale: .34, autoAlpha: 0, duration: .12, ease: "power2.in" }, .2);
      if (ring) {
        timeline.fromTo(ring, { autoAlpha: .8, scale: 1.04 },
          { autoAlpha: 0, scale: 1, duration: .44, ease: EASE.reveal, immediateRender: false }, .24);
      }
    });
  });

  const useLibraryFile = contextSafe((file, originRect) => {
    attachLibraryFile(file);
    setPrompt(`请基于《${file.name}》整理关键结论和待跟进事项`);
    window.requestAnimationFrame(() => textareaRef.current?.focus());

    const signal = toolSignalRef.current;
    const textarea = textareaRef.current;
    if (!signal || !textarea || !originRect
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = signal.querySelector(".tool-signal-dot");
    const bloom = signal.querySelector(".tool-signal-bloom");
    if (!dot || !bloom) return;

    const base = signal.getBoundingClientRect();
    const target = textarea.getBoundingClientRect();
    const from = {
      x: originRect.left + originRect.width / 2 - (base.left + base.width / 2),
      y: originRect.top + originRect.height / 2 - (base.top + base.height / 2),
    };
    const to = {
      x: target.left + 24 - (base.left + base.width / 2),
      y: target.top + 16 - (base.top + base.height / 2),
    };
    gsap.killTweensOf([dot, bloom]);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .fromTo(dot, { x: from.x, y: from.y, scale: .45, autoAlpha: 0 },
        { autoAlpha: 1, scale: 1, duration: .1, ease: "power2.out" }, 0)
      .to(dot, { x: to.x, duration: .34, ease: "none" }, .02)
      .to(dot, { y: to.y, duration: .34, ease: "power2.in" }, .02)
      .to(dot, { scale: .3, autoAlpha: 0, duration: .14, ease: "power2.in" }, .28)
      .fromTo(bloom, { x: to.x, y: to.y, scale: .28, autoAlpha: .7 },
        { scale: 1.5, autoAlpha: 0, duration: .46, ease: "power3.out", immediateRender: false }, .3);
  });

  // 快捷提问不是"瞬间把文本塞进去"——那一下读起来像页面刷新。
  // 先把被点那张卡片的文案克隆出来飞进输入框首行，落地的同一拍按 40ms/字打出（封顶 .6s）。
  const applyQuickPrompt = contextSafe((quick, event) => {
    const names = libraryContext.map((item) => `《${item.name}》`).join("、");
    const text = quick.build(names);
    setHint("");
    quickPromptTweenRef.current?.kill();

    const textarea = textareaRef.current;
    const button = event?.currentTarget;
    const dock = composerRef.current;
    if (!textarea || !button || !dock || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrompt(text);
      window.requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }

    const from = button.getBoundingClientRect();
    const to = textarea.getBoundingClientRect();
    const dockBox = dock.getBoundingClientRect();
    const ghost = document.createElement("span");
    ghost.className = "quick-prompt-ghost";
    ghost.textContent = quick.label;
    ghost.style.left = `${from.left - dockBox.left}px`;
    ghost.style.top = `${from.top - dockBox.top}px`;
    ghost.style.width = `${from.width}px`;
    ghost.style.height = `${from.height}px`;
    dock.appendChild(ghost);

    // 位移和淡出分成两条：合在一条里的话，power4.out 会让它在头 30% 就淡没了，
    // 观众根本没看见它飞——飞行要看得完整，淡出只发生在落点前的最后 .12s。
    const ghostTimeline = gsap.timeline({
      onComplete: () => {
        ghost.remove();
        gsap.killTweensOf(ghost);
        ghostTimeline.kill();
      },
    });
    ghostTimeline
      .to(ghost, {
        x: to.left + 14 - from.left,
        y: to.top + 12 - from.top,
        scale: .92,
        duration: .32,
        ease: EASE.glide,
      }, 0)
      .to(ghost, { autoAlpha: 0, duration: .12, ease: "power2.in" }, .2);

    // 打字：补间一个计数器再切片，而不是每个字符起一条 tween
    const typing = { index: 0 };
    setPrompt("");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
    quickPromptTweenRef.current = gsap.to(typing, {
      index: text.length,
      duration: Math.min(.6, text.length * .04),
      ease: "none",
      delay: .18,
      onUpdate: () => setPrompt(text.slice(0, Math.round(typing.index))),
      onComplete: () => setPrompt(text),
    });
  });

  // 从资料库拖进来的是「引用」：文件已在库中，不重新上传，只挂到本次对话并打开知识库检索。
  const attachLibraryFile = (file) => {
    if (!file?.id) return;
    const key = `library-${file.id}`;
    // 判断要用当前渲染的值：setState 的 updater 是延迟执行的，
    // 在里面置标志位、外面立刻读，读到的还是旧值。
    if (!attachments.some((item) => item.id === key) && attachments.length >= MAX_ATTACHMENTS) {
      setHint(`一次最多带 ${MAX_ATTACHMENTS} 份资料，先移除一份再拖`);
      return;
    }
    setAttachments((current) => {
      const unique = new Map(current.map((item) => [item.id, item]));
      unique.set(key, {
        id: key,
        name: file.name,
        size: file.size,
        source: "library",
        location: file.location,
        kind: file.kind,
      });
      return Array.from(unique.values()).slice(0, MAX_ATTACHMENTS);
    });
    setKnowledgeEnabled(true);
    setHint("");
  };

  // 上下文条和快捷提问会改变输入条的高度，工作区的底部预留必须跟着走，
  // 否则正文会被压住或者凭空空出一块。
  // 写在 .task-view 而不是 .workspace：读它的只有 .task-workspace 和 .files-workspace，
  // 两者都在 .task-view 里。自定义属性默认继承，写在工作区上等于每改一次就把
  // 工作区下面 800 多个元素整棵打脏——而路由转场里输入条正被 Flip 连续改高，
  // 实测一次「首页→任务」就要写 47 遍，也就是 47 次全树样式重算。
  // 再加一层去重：高度取整后没变就不写，光这一条就砍掉大半次数。
  useEffect(() => {
    const dock = composerRef.current;
    const taskView = taskViewRef.current;
    if (!dock || !taskView || typeof ResizeObserver === "undefined") return undefined;
    let last = null;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      const next = Math.round(height);
      if (next === last) return;
      last = next;
      taskView.style.setProperty("--composer-actual-h", `${next}px`);
    });
    observer.observe(dock);
    return () => observer.disconnect();
  }, []);

  // 文件页把资料库来源的引用提升成"上下文"，不再混在临时附件里
  const libraryContext = activeNav === "files" ? attachments.filter((item) => item.source === "library") : [];
  const trayAttachments = activeNav === "files" ? attachments.filter((item) => item.source !== "library") : attachments;

  const hasLibraryPayload = (event) => Array.from(event.dataTransfer?.types || []).includes(LIBRARY_DRAG_TYPE);

  const handleComposerDragOver = (event) => {
    if (isRunning || !hasLibraryPayload(event)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleComposerDrop = (event) => {
    if (isRunning || !hasLibraryPayload(event)) return;
    event.preventDefault();
    event.stopPropagation();
    setLibraryDragging(false);
    try {
      attachLibraryFile(JSON.parse(event.dataTransfer.getData(LIBRARY_DRAG_TYPE)));
    } catch {
      setHint("这份资料没能读出来，换一份试试");
    }
  };

  const handleModePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const group = event.currentTarget;
    const bounds = group.getBoundingClientRect();
    const segmentWidth = (bounds.width - 8) / MODES.length;
    const baseX = MODES.indexOf(activeMode) * segmentWidth;

    modeDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      baseX,
      x: baseX,
      segmentWidth,
      moved: false,
      suppressClick: false,
      lastClientX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handleModePointerMove = (event) => {
    const drag = modeDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const group = event.currentTarget;
    const elapsed = Math.max(8, event.timeStamp - drag.lastTime);
    const velocity = (event.clientX - drag.lastClientX) / elapsed;
    const rawX = drag.baseX + event.clientX - drag.startX;
    const maxX = drag.segmentWidth * (MODES.length - 1);
    const resistedX = rawX < 0
      ? Math.max(-14, rawX * .28)
      : rawX > maxX
        ? Math.min(maxX + 14, maxX + (rawX - maxX) * .28)
        : rawX;
    drag.x = resistedX;
    drag.velocity = velocity;
    const crossedDragThreshold = Math.abs(event.clientX - drag.startX) > 4;
    if (!drag.moved && crossedDragThreshold) {
      drag.moved = true;
      group.setPointerCapture(event.pointerId);
      group.dataset.dragging = "true";
      opticsApiRef.current?.drag(true);
    }
    if (!drag.moved) return;
    drag.lastClientX = event.clientX;
    drag.lastTime = event.timeStamp;
    const previewIndex = Math.round(gsap.utils.clamp(0, maxX, resistedX) / drag.segmentWidth);
    group.dataset.preview = MODES[previewIndex];
    modeApiRef.current?.move(resistedX, velocity);
  };

  const finishModeDrag = (event, cancelled = false) => {
    const drag = modeDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    const group = event.currentTarget;
    if (group.hasPointerCapture(event.pointerId)) group.releasePointerCapture(event.pointerId);

    const nextIndex = cancelled || !drag.moved
      ? MODES.indexOf(activeMode)
      : Math.round(gsap.utils.clamp(0, drag.segmentWidth * (MODES.length - 1), drag.x) / drag.segmentWidth);

    if (drag.moved) {
      modeApiRef.current?.snap(nextIndex, cancelled ? 0 : drag.velocity);
      if (!cancelled) setActiveMode(MODES[nextIndex]);
    }

    drag.suppressClick = drag.moved;
    drag.pointerId = null;
    window.requestAnimationFrame(() => {
      delete group.dataset.dragging;
      delete group.dataset.preview;
      opticsApiRef.current?.drag(false);
    });
    window.setTimeout(() => {
      modeDragRef.current.suppressClick = false;
    }, 0);
  };

  const selectMode = (mode) => {
    if (modeDragRef.current.suppressClick) return;
    modeApiRef.current?.snap(MODES.indexOf(mode), 0);
    setActiveMode(mode);
  };

  const addAttachments = (fileList) => {
    const incoming = Array.from(fileList || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      name: file.name,
      size: file.size,
    }));
    if (!incoming.length) return;
    setAttachments((current) => {
      const unique = new Map(current.map((item) => [item.id, item]));
      incoming.forEach((item) => unique.set(item.id, item));
      return Array.from(unique.values()).slice(0, MAX_ATTACHMENTS);
    });
  };

  const removeAttachment = (id) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  };

  // 移除不是"直接消失"——那读起来像丢帧。先让 chip 塌下去、收窄、散出三个光点，
  // 收完再从 state 里摘掉。光点是当场造、播完就删的有限事件，不常驻在 DOM 里。
  const dismissAttachment = contextSafe((id, event) => {
    const chip = event.currentTarget.closest(".attachment-chip, .context-chip");
    if (!chip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      removeAttachment(id);
      return;
    }
    const host = chip.parentElement;
    const chipBox = chip.getBoundingClientRect();
    const hostBox = host?.getBoundingClientRect();
    const motes = [];
    if (host && hostBox) {
      for (let i = 0; i < 3; i += 1) {
        const mote = document.createElement("i");
        mote.className = "chip-mote";
        mote.style.left = `${chipBox.left - hostBox.left + chipBox.width * (.28 + i * .22)}px`;
        mote.style.top = `${chipBox.top - hostBox.top + chipBox.height * .58}px`;
        host.appendChild(mote);
        motes.push(mote);
      }
    }
    gsap.killTweensOf(chip);
    // 光点从 DOM 里摘掉还不够：时间轴的 _targets 仍然攥着它们，节点会以"分离态"
    // 一直留在内存里（实测每次移除附件泄漏 3 个节点，强制 GC 也回收不掉）。
    // 播完必须显式 kill 掉这条时间轴并断开引用。
    const timeline = gsap.timeline({
      onComplete: () => {
        motes.forEach((mote) => mote.remove());
        gsap.killTweensOf(motes);
        motes.length = 0;
        timeline.kill();
        removeAttachment(id);
      },
    });
    timeline
      .to(chip, { y: 5, scaleX: .93, scaleY: .78, autoAlpha: 0, duration: .18, ease: EASE.exit }, 0)
      .fromTo(motes,
        { y: 0, autoAlpha: .9, scale: 1 },
        { y: 11, autoAlpha: 0, scale: .4, duration: .26, stagger: .03, ease: "power2.in" }, .02);
  });

  const hasDraggedFiles = (event) => Array.from(event.dataTransfer?.types || []).includes("Files");

  const handleWorkspaceDragEnter = (event) => {
    if (isRunning || !hasDraggedFiles(event)) return;
    event.preventDefault();
    fileDragDepthRef.current += 1;
    setIsFileDragging(true);
  };

  const handleWorkspaceDragOver = (event) => {
    if (isRunning || !hasDraggedFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleWorkspaceDragLeave = (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    fileDragDepthRef.current = Math.max(0, fileDragDepthRef.current - 1);
    if (fileDragDepthRef.current === 0) setIsFileDragging(false);
  };

  const handleWorkspaceDrop = (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    fileDragDepthRef.current = 0;
    setIsFileDragging(false);
    if (!isRunning) addAttachments(event.dataTransfer.files);
  };

  const handleCapabilityPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--cap-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--cap-y", `${event.clientY - bounds.top}px`);
  };

  const resetCapabilityLight = (event) => {
    event.currentTarget.style.setProperty("--cap-x", "50%");
    event.currentTarget.style.setProperty("--cap-y", "50%");
  };

  const handleComposerPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    composerApiRef.current?.move(event.clientX - bounds.left, event.clientY - bounds.top);
  };

  const handleComposerBlur = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    composerApiRef.current?.focus(false);
  };

  const handleStartButtonPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--button-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--button-y", `${event.clientY - bounds.top}px`);
  };

  const handleStartButtonPointerDown = contextSafe((event) => {
    const button = event.currentTarget;
    const bounds = button.getBoundingClientRect();
    button.style.setProperty("--button-x", `${event.clientX - bounds.left}px`);
    button.style.setProperty("--button-y", `${event.clientY - bounds.top}px`);
    gsap.killTweensOf(button);
    gsap.to(button, {
      y: 2,
      scaleX: .985,
      scaleY: .94,
      duration: .09,
      ease: "power2.in",
      overwrite: "auto",
    });
  });

  const releaseStartButton = contextSafe((event) => {
    const button = event.currentTarget;
    gsap.killTweensOf(button);
    gsap.to(button, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: .3,
      ease: "back.out(2)",
      overwrite: "auto",
    });
  });

  const showNavPreview = (mode) => {
    if (activeNav !== "home") return;
    if (navMotionTweenRef.current?.isActive?.()) return;
    navPreviewApiRef.current?.show(mode);
  };

  const hideNavPreview = () => {
    if (activeNav !== "home") return;
    if (navMotionTweenRef.current?.isActive?.()) return;
    navPreviewApiRef.current?.hide();
  };

  const handleNavSelect = (nextNav) => {
    if (!NAV_ITEMS.some((item) => item.id === nextNav)) return;
    if (nextNav === activeNav) return;
    const composer = composerRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const composerFlipTargets = composer && nextNav !== "settings" && activeNav !== "settings" ? [composer] : [];
    const composerState = !reduceMotion && composerFlipTargets.length
      ? Flip.getState(composerFlipTargets)
      : null;
    const destination = nextNav === "home" ? 0 : 1;
    const progress = navTransitionRef.current?.progress?.() ?? (activeNav === "home" ? 0 : 1);
    const switchingWorkPanels = activeNav !== "home" && nextNav !== "home";
    const motionDuration = switchingWorkPanels
      ? COMPANION_MOTION.workToWork
      : nextNav === "home"
        ? Math.max(.2, COMPANION_MOTION.workToHome * Math.abs(destination - progress))
        : getFlipDuration(progress, destination);
    if (composerFlipTargets.length) Flip.killFlipsOf(composerFlipTargets);
    if ((nextNav === "tasks" || nextNav === "files" || nextNav === "settings") && activeNav === "home") navPreviewApiRef.current?.commit(nextNav);
    else navPreviewApiRef.current?.hide();
    navGlassApiRef.current?.move(nextNav, motionDuration);
    flushSync(() => setActiveNav(nextNav));
    if (composer && (nextNav === "settings" || activeNav === "settings")) {
      gsap.killTweensOf(composer);
      if (reduceMotion) {
        if (nextNav === "settings") gsap.set(composer, { autoAlpha: 0 });
        else gsap.set(composer, { clearProps: "opacity,visibility" });
      } else if (nextNav === "settings") {
        gsap.to(composer, { autoAlpha: 0, duration: .22, ease: EASE.exit, overwrite: "auto" });
      } else {
        gsap.fromTo(composer, { autoAlpha: 0 }, {
          autoAlpha: 1,
          duration: .28,
          ease: EASE.reveal,
          overwrite: "auto",
          onComplete: () => gsap.set(composer, { clearProps: "opacity,visibility" }),
        });
      }
    }
    if (!switchingWorkPanels) navLightApiRef.current?.run(nextNav);
    if (composerState && composer) {
      Flip.from(composerState, {
        targets: composerFlipTargets,
        duration: motionDuration,
        ease: "sine.inOut",
        absolute: true,
        scale: false,
        simple: false,
        clearProps: "transform,width,height",
      });
    }
    if (navTransitionRef.current?.progress && Math.abs(destination - progress) > .001) {
      navMotionTweenRef.current?.kill();
      navMotionTweenRef.current = gsap.to(navTransitionRef.current, {
        progress: destination,
        duration: motionDuration,
        ease: "none",
        overwrite: true,
      });
    } else if (!navTransitionRef.current?.progress) {
      if (destination === 1) navTransitionRef.current?.play?.();
      else navTransitionRef.current?.reverse?.();
    }
  };

  // 任务页里读执行过程时把输入条让开。收起量跟着滚动距离连续走，不是到阈值才整块跳；
  // 读到底、指针贴近底部、或输入框拿到焦点，都会把它交还回来。
  useEffect(() => {
    if (activeNav !== "tasks") return undefined;
    const dock = composerRef.current;
    const workspace = workspaceRef.current;
    const thread = taskViewRef.current?.querySelector(".task-thread");
    if (!dock || !workspace || !thread) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let collapse = 0;
    let lastTop = thread.scrollTop;
    let held = false;

    const apply = () => {
      dock.style.setProperty("--dock-collapse", collapse.toFixed(3));
      dock.style.setProperty("--dock-pointer", collapse > .62 ? "none" : "auto");
    };
    const expand = () => {
      if (collapse === 0) return;
      collapse = 0;
      apply();
    };
    // 换任务、提交、追问都要把输入条交还回来：收起量是这条 effect 的闭包变量，
    // 而 effect 只依赖 activeNav——在任务页里换一条任务并不会重建它，收起量会
    // 一路带到下一条任务上。下一条如果短到不需要滚动，就再也没有 scroll 事件把它
    // 还回来，输入条就"消失"了（已踩过一次）。
    dockCollapseApiRef.current = () => {
      thread.scrollTop = 0;
      lastTop = 0;
      held = false;
      collapse = 0;
      apply();
    };

    const onScroll = () => {
      const top = thread.scrollTop;
      const delta = top - lastTop;
      lastTop = top;
      if (held || dock.contains(document.activeElement)) {
        expand();
        return;
      }
      if (top + thread.clientHeight >= thread.scrollHeight - 28) collapse = 0;
      else collapse = Math.min(1, Math.max(0, collapse + delta / 160));
      apply();
    };

    const onPointerMove = (event) => {
      const bounds = readWorkspaceBounds();
      if (!bounds) return;
      const nearBottom = event.clientY >= bounds.bottom - Math.min(280, bounds.height * .34);
      if (nearBottom) {
        held = true;
        expand();
      } else if (!dock.contains(document.activeElement)) {
        held = false;
      }
    };

    // 收起到一定程度后 dock 会让出指针事件，键盘 Tab 仍可能把焦点送进去，
    // 所以焦点在 document 上监听，而不是等它冒泡到 dock。
    // 焦点态由 CSS 的 .composer-dock:focus-within 直接接管，这里不再重复处理。
    thread.addEventListener("scroll", onScroll, { passive: true });
    workspace.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      dockCollapseApiRef.current = null;
      thread.removeEventListener("scroll", onScroll);
      workspace.removeEventListener("pointermove", onPointerMove);
      // 离开任务页时瞬时归位，别让收起的偏移混进路由 Flip
      const previous = dock.style.transition;
      dock.style.transition = "none";
      dock.style.setProperty("--dock-collapse", "0");
      dock.style.setProperty("--dock-pointer", "auto");
      void dock.offsetWidth;
      dock.style.transition = previous;
    };
  }, [activeNav]);

  // 检索环的几何：它是工作区级的覆盖层，所以要自己对齐到人物图的画面盒子上。
  // 只在搜索激活时量一次——离焦就藏起来，不需要持续跟随。
  useGSAP(() => {
    const ring = scanRingRef.current;
    const figure = companionFigureRef.current;
    const workspace = workspaceRef.current;
    if (!ring || !figure || !workspace) return undefined;
    if (!fileSearchState.active) return undefined;

    const place = () => {
      const box = figure.getBoundingClientRect();
      const host = workspace.getBoundingClientRect();
      // 图片是 object-fit: contain，实际画面盒子比容器窄
      let w = box.width;
      let h = w / COMPANION_ASPECT;
      if (h > box.height) { h = box.height; w = h * COMPANION_ASPECT; }
      if (!(w > 80)) return;
      gsap.set(ring, {
        left: box.left + (box.width - w) / 2 - host.left,
        top: box.top - host.top,
        width: w,
        height: h,
      });
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(workspace);
    return () => observer?.disconnect();
  }, { dependencies: [fileSearchState.active], scope: workspaceRef });

  // 打字蓄能：字数越多导轨越亮，核心跟着提亮；停手 1.2s 后缓落。
  // 补间的是注册过的 --charge 数值，一条连续曲线，而不是每敲一键起一条 tween。
  useGSAP(() => {
    const rail = chargeRailRef.current;
    const core = companionCoreRef.current?.querySelector(".core-signal");
    if (!rail) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 60 字封顶：再长也只是"满"，不该无限变亮
    const charge = Math.min(1, prompt.trim().length / 60);
    const previous = lastPromptRef.current;
    lastPromptRef.current = prompt;

    chargeTweenRef.current?.kill();
    if (reduceMotion) {
      rail.style.setProperty("--charge", charge.toFixed(3));
      return undefined;
    }
    chargeTweenRef.current = gsap.to(rail, {
      "--charge": charge.toFixed(3),
      duration: charge > Number(rail.style.getPropertyValue("--charge") || 0) ? .28 : .9,
      ease: "power2.out",
      overwrite: "auto",
    });
    if (core) {
      gsap.to(core, { opacity: .68 + charge * .3, duration: .34, ease: "power2.out", overwrite: "auto" });
    }

    // 落一个词（空格或标点）就在光标处推一次横向光晕
    const pulse = wordPulseRef.current;
    const textarea = textareaRef.current;
    const added = prompt.slice(previous.length);
    if (pulse && textarea && prompt.length > previous.length && /[\s,.，。、；;!?！？]$/.test(added)) {
      const box = textarea.getBoundingClientRect();
      const host = pulse.offsetParent?.getBoundingClientRect();
      if (host) {
        gsap.killTweensOf(pulse);
        gsap.fromTo(pulse,
          { x: box.left - host.left + 16, y: box.top - host.top + 14, scaleX: .3, autoAlpha: .9 },
          { scaleX: 1, autoAlpha: 0, duration: .16, ease: "power2.out", overwrite: "auto" });
      }
    }
    return undefined;
  }, { dependencies: [prompt], scope: composerRef });

  // 停摆：停止执行时冷掉的脉络先整片浮出，再把覆盖从末梢往核心收回去，
  // 读起来是残余电流耗散完。重新执行不在这里做——它把 stopped 归零、phase 置 0，
  // 由上面那条提交时间轴的脉络回声负责重新点亮，两边不重复画同一件事。
  useGSAP(() => {
    const halt = companionHaltRef.current;
    const gate = haltGateRef.current;
    const wrap = companionFigureRef.current?.closest(".companion-wrap");
    if (!halt || !gate || !wrap) return undefined;

    const state = { t: GATE_T.end };
    const apply = () => {
      const c = Math.min(24, Math.max(9, 22 * state.t));
      gate.style.filter = `brightness(${(.5 / state.t).toFixed(4)}) contrast(${c.toFixed(2)})`;
    };

    if (stopped === null) {
      wrap.classList.remove("is-halted");
      gsap.killTweensOf(halt);
      gsap.set(halt, { display: "none", autoAlpha: 0 });
      state.t = GATE_T.end;
      apply();
      return undefined;
    }

    wrap.classList.add("is-halted");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(halt, { display: "none", autoAlpha: 0 });
      return undefined;
    }

    apply();
    gsap.killTweensOf(halt);
    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
    timeline
      .set(halt, { display: "block", autoAlpha: 1 }, 0)
      .fromTo(halt, { opacity: 0 }, { opacity: .92, duration: .14, ease: "power2.out" }, 0)
      // 覆盖从末梢往核心收：阈值走回起点，最后什么都不剩
      .to(state, { t: GATE_T.start, duration: .42, ease: "power2.in", onUpdate: apply }, .16)
      .to(halt, { opacity: 0, duration: .18, ease: "power2.in" }, .5)
      .set(halt, { display: "none", autoAlpha: 0 }, .68);

    return () => {
      timeline.kill();
      wrap.classList.remove("is-halted");
    };
  }, { dependencies: [stopped], scope: workspaceRef });

  // 换任务的入场半程：新内容从右侧进来，执行轨道的填充条按新任务的进度重新长出。
  // 只在 taskSwitchRef 被 selectTask 置位时播——新建任务走的是路由转场，那条链路
  // 会在同一批元素上写 x / autoAlpha，两边一起放就会互相抢。
  useGSAP(() => {
    if (!taskSwitchRef.current) return undefined;
    taskSwitchRef.current = false;
    const thread = taskPanelRef.current?.querySelector(".task-thread");
    if (!thread || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const groups = gsap.utils.toArray(".task-thread-head, .user-brief, .execution-trace, .answer-card", thread);
    const fills = gsap.utils.toArray(".execution-line > i", thread);
    if (!groups.length) return undefined;

    gsap.killTweensOf([...groups, ...fills]);
    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
    timeline.fromTo(groups,
      { x: 10, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: .24, stagger: .018, ease: EASE.glide, clearProps: "transform" }, 0);
    if (fills.length) {
      timeline.fromTo(fills,
        { scaleY: 0 },
        { scaleY: 1, duration: .3, ease: "power2.out", transformOrigin: "50% 0%", immediateRender: false }, .06);
    }
    return () => timeline.kill();
  }, { dependencies: [activeTaskId], scope: taskPanelRef });

  // 回答正文按滚动逐条点亮。滚动容器是 .task-thread 而不是窗口，所以要显式给 scroller；
  // 首屏内的段落在 batch 创建时就已在视口里，会立刻触发，不会白等。
  useGSAP(() => {
    if (activeNav !== "tasks") return undefined;
    const thread = taskPanelRef.current?.querySelector(".task-thread");
    if (!thread) return undefined;
    const pieces = gsap.utils.toArray(".answer-reveal-piece", thread);
    if (!pieces.length) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(pieces, { autoAlpha: 1, y: 0 });
      return undefined;
    }

    // 先藏起来，等转场落定再建触发器：此刻 .task-view 还是 visibility: hidden，
    // getBoundingClientRect 全是 0，这时候建出来的触发位置是错的。
    gsap.set(pieces, { autoAlpha: 0, y: 16 });
    let batched = [];
    const build = gsap.delayedCall(.62, () => {
      // 这里原本先调一次 ScrollTrigger.refresh()。它是全局重测：把文档和所有滚动
      // 容器的尺寸重新量一遍，而此刻页面正卡在转场最忙的那 0.6 秒里，且此时一个
      // 触发器都还没建（上一次进任务页的那批在 cleanup 里已经 kill 掉了），
      // 没有任何东西需要被"刷新"。batch 创建时本来就会自己量一次。
      batched = ScrollTrigger.batch(pieces, {
        scroller: thread,
        // 进入容器可视区就点亮。收得太紧（例如 top 94%）会让首屏那条差几像素不触发，
        // 用户不滚动就只看到一张空的回答卡。
        start: "top bottom",
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: .52,
          stagger: .07,
          ease: EASE.reveal,
          overwrite: true,
        }),
      });
    });

    return () => {
      build.kill();
      batched.forEach((instance) => instance.kill());
    };
  }, { dependencies: [activeNav], scope: taskPanelRef });

  // 主按钮的身份只有两种：有话要说就是"执行"，没话可说且刚做完一件事才是"看成果"。
  const showsResultToggle = finished && !prompt.trim();

  const statusTitle = finished
    ? "任务已完成"
    : phase >= 0 && phase < PHASES.length
      ? PHASES[phase].status
      : stopped !== null
        ? "已停止"
        : "随时待命";

  return (
    <main className="prototype-stage">
      <section ref={appFrameRef} className="app-frame" aria-label="元枢共生工作台视觉样稿">
        <aside className="side-rail">
          <div className="side-brand" aria-label="元枢">
            <span className="brand-mark-shell">
              <img src="/assets/brand/yuanshu-agent-mark.png" alt="" />
            </span>
          </div>

          <nav aria-label="主要导航">
            <span ref={navGlassRef} className="nav-glass" aria-hidden="true"><i /></span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const supportsPreview = item.id === "tasks" || item.id === "files" || item.id === "settings";
              return (
                <button
                  key={item.id}
                  type="button"
                  ref={(node) => { navButtonRefs.current[item.id] = node; }}
                  className={activeNav === item.id ? "is-active" : ""}
                  onClick={() => handleNavSelect(item.id)}
                  onPointerEnter={supportsPreview ? () => showNavPreview(item.id) : undefined}
                  onPointerLeave={supportsPreview ? hideNavPreview : undefined}
                  onFocus={supportsPreview ? () => showNavPreview(item.id) : undefined}
                  onBlur={supportsPreview ? hideNavPreview : undefined}
                  aria-current={activeNav === item.id ? "page" : undefined}
                >
                  <Icon weight={activeNav === item.id ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div
          ref={workspaceRef}
          className={`workspace${activeNav !== "home" ? " is-task-view" : ""}${activeNav === "files" ? " is-file-view" : ""}${activeNav === "settings" ? " is-settings-view" : ""}${fileSearchState.active ? " is-memory-searching" : ""}${fileSearchState.empty ? " is-memory-empty" : ""}${isRunning ? " is-running" : ""}${finished ? " is-finished" : ""}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
          onDragEnter={handleWorkspaceDragEnter}
          onDragOver={handleWorkspaceDragOver}
          onDragLeave={handleWorkspaceDragLeave}
          onDrop={handleWorkspaceDrop}
        >
          <i ref={workspaceGlowRef} className="workspace-glow" aria-hidden="true" />

          <header className="workspace-brand">
            <strong>元枢</strong>
            <span>企业通用智能体</span>
          </header>

          <div ref={motionFieldRef} className="motion-light-field" aria-hidden="true">
            <span ref={motionBeamRef} className="motion-light-anchor"><i className="motion-light-beam" /></span>
            <span ref={motionEchoBRef} className="motion-light-anchor"><i className="motion-light-echo is-distant" /></span>
            <span ref={motionEchoARef} className="motion-light-anchor"><i className="motion-light-echo" /></span>
            <span ref={motionFlareRef} className="motion-light-anchor"><i className="motion-light-flare" /></span>
          </div>

          <div ref={homeViewRef} className="home-view">
          <div className={`ambient-status${isRunning ? " is-running" : ""}${finished ? " is-finished" : ""}`} aria-live="polite">
            <i />
            <span>当前状态</span>
            <strong>{statusTitle}</strong>
            <span className="status-wave" aria-hidden="true"><b /><b /><b /><b /></span>
          </div>

          <section className="hero-copy">
            <h1>一起把事情做完</h1>
            <p>从目标到成果，始终在同一段对话里。</p>
          </section>

          <section className="capability-area" aria-label="能力状态">
            <div className="section-label">
              <strong>能力状态</strong>
              <i />
            </div>
            <div className="capability-list" onPointerMove={handleCapabilityPointerMove} onPointerLeave={resetCapabilityLight}>
              {CAPABILITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="capability-card" key={item.id}>
                    <span className="capability-icon"><Icon /></span>
                    <strong>{item.title}</strong>
                    <small><i />{item.detail}</small>
                  </div>
                );
              })}
            </div>
          </section>
          </div>

          <div className={`companion-wrap${isRunning ? " is-running" : ""}${finished ? " is-finished" : ""}`} aria-hidden="true">
            <span ref={companionHaloRef} className="companion-halo" />
            <span ref={companionBodyRef} className="companion-body">
              <span ref={companionIntroRef} className="companion-intro-layer">
                <span ref={companionSemanticRef} className="companion-semantic-layer">
                <span className="companion-pose-layer">
                  <span className="companion-scan" />
                  <img ref={companionFigureRef} className="companion-figure companion-shared-figure" src="/assets/ai-companion.webp" alt="" loading="eager" decoding="async" fetchPriority="high" />
                  <span ref={companionTaskFormRef} className="companion-task-form" aria-hidden="true">
                    <i className="task-form-region task-form-neural" />
                    <i className="task-form-region task-form-visor" />
                    <i className="task-form-region task-form-core" />
                    <span className="task-phase-origins">
                      {PHASES.map((item, index) => <i className={`task-phase-origin origin-${index + 1}`} key={item.label} />)}
                    </span>
                    <span ref={taskCompletionRef} className="task-completion-field"><i /><i /><i /></span>
                  </span>
                  <span ref={companionMemoryFormRef} className="companion-memory-form" aria-hidden="true">
                    <i className="memory-form-region memory-form-neural" />
                    <i className="memory-form-region memory-form-visor" />
                    <i className="memory-form-region memory-form-core" />
                  </span>
                  <span ref={companionPreviewRef} className="companion-intent-preview" aria-hidden="true">
                    <i className="intent-preview-visor" />
                    <i className="intent-preview-core" />
                    <i className="intent-preview-path path-1" />
                    <i className="intent-preview-path path-2" />
                    <i className="intent-preview-path path-3" />
                  </span>
                  <span ref={companionFilePreviewRef} className="companion-file-preview" aria-hidden="true">
                    <i className="file-preview-region file-preview-neural" />
                    <i className="file-preview-region file-preview-visor" />
                    <i className="file-preview-region file-preview-core" />
                  </span>
                  <span ref={companionHandoffRef} className="companion-state-handoff" aria-hidden="true">
                    <i className="state-handoff-axis" />
                    <i className="state-handoff-core" />
                    <i className="state-handoff-ring ring-a" />
                    <i className="state-handoff-ring ring-b" />
                    <i className="state-handoff-ring ring-c" />
                  </span>
                  <span ref={companionMorphRef} className="companion-morph-field">
                    <i className="morph-band band-1" /><i className="morph-band band-2" /><i className="morph-band band-3" />
                    <i className="morph-band band-4" /><i className="morph-band band-5" /><i className="morph-band band-6" />
                  </span>
                  <span ref={companionCoreRef} className="core-anchor" data-mode={activeMode}>
                    <i className="core-signal" />
                    <i className="core-shock" />
                  </span>
                </span>
                </span>
              </span>
              {/* 脉络回声：结构与点火层完全一致，但它常驻——每次提交都要放一遍，
                  而点火层只在首次进入的开场里存在。 */}
              <span ref={companionEchoRef} className="companion-echo" aria-hidden="true">
                <i className="echo-stack">
                  <i className="echo-texture" />
                  <i ref={echoGateRef} className="echo-gate" />
                </i>
              </span>

              <span ref={companionHaltRef} className="companion-halt" aria-hidden="true">
                <i className="halt-stack">
                  <i className="halt-texture" />
                  <i ref={haltGateRef} className="halt-gate" />
                </i>
              </span>

              {/* 点火层是入场层的兄弟而不是子节点：入场层的 opacity 负责"形体浮出"，
                  脉络必须独立于它常亮，否则两层一起淡入就没有"先有结构、后有形体"。
                  两者同为 .companion-body 的 inset:0 子节点，几何天然对齐。 */}
              {opening ? (
                <>
                  <span ref={igniteRef} className="companion-ignite" aria-hidden="true">
                    <i className="ignite-stack">
                      <i className="ignite-texture" />
                      <i ref={igniteGateRef} className="ignite-gate" />
                    </i>
                  </span>
                  <span ref={companionEdgeRef} className="companion-edge" aria-hidden="true" />
                  <span ref={igniteSparksRef} className="ignite-sparks" aria-hidden="true">
                    <i /><i /><i /><i /><i /><i />
                  </span>
                  <span ref={openingCoreRef} className="opening-core" aria-hidden="true">
                    <i className="core-bloom" />
                    <i className="core-flare" />
                    <i className="core-ring" />
                    <i className="core-lock" />
                  </span>
                </>
              ) : null}
            </span>
          </div>

          <div ref={taskViewRef} className="task-view">
            <div ref={taskPanelRef} className="work-panel task-panel">
              <TaskWorkspace
                phase={phase}
                finished={finished}
                stopped={stopped}
                tasks={tasks}
                activeTaskId={activeTaskId}
                activeTask={activeTask}
                onSelectTask={selectTask}
                onFollowUp={continueTask}
                onRetry={retryTask}
              />
            </div>
            <div ref={filePanelRef} className="work-panel file-panel">
              <FilesWorkspace
                companionMemoryFormRef={companionMemoryFormRef}
                sessionAttachments={attachments}
                onAddSessionAttachment={() => attachmentInputRef.current?.click()}
                onUseFile={useLibraryFile}
                libraryDragType={LIBRARY_DRAG_TYPE}
                onLibraryDragStart={() => setLibraryDragging(true)}
                onLibraryDragEnd={() => setLibraryDragging(false)}
                onSearchStateChange={setFileSearchState}
              />
            </div>
            <div ref={settingsPanelRef} className="work-panel settings-panel">
              <SettingsWorkspace
                onAnchorPulse={(anchorIndex) => settingsPulseRef.current?.pulse(anchorIndex)}
                onAnchorSweep={() => settingsPulseRef.current?.sweep()}
                onAnchorDim={() => settingsPulseRef.current?.dim()}
              />
            </div>
          </div>

          <span ref={taskPhaseBeamRef} className="task-phase-beam" aria-hidden="true"><i /><b /></span>

          <div ref={companionNodesRef} className={`companion-nodes${isRunning ? " is-running" : ""}${finished ? " is-finished" : ""}`} aria-hidden="true">
            {PHASES.map((item, index) => (
              <span
                key={item.label}
                className={`companion-node node-${index + 1}${phase === index ? " is-current" : ""}${phase > index || finished ? " is-complete" : ""}`}
              >
                <i />
                <em>{item.label}</em>
              </span>
            ))}
            {opening ? (
              <span ref={openingLinksRef} className="opening-links" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
            ) : null}
          </div>
          <div ref={settingsAnchorsRef} className="companion-nodes settings-anchors" aria-hidden="true">
            {SETTINGS_ANCHORS.map((label, index) => (
              <span key={label} className={`companion-node node-${index + 1}`}>
                <i />
                <em>{label}</em>
              </span>
            ))}
          </div>

          <span ref={signalTransferRef} className="signal-transfer" aria-hidden="true" />
          <span ref={toolSignalRef} className="tool-signal" aria-hidden="true">
            <i className="tool-signal-dot" />
            <i className="tool-signal-bloom" />
          </span>
          <i ref={followupTraceRef} className="followup-trace" aria-hidden="true" />
          <span ref={scanRingRef} className="companion-scan-ring" aria-hidden="true"><i /></span>

          {finished && showResult && (
            <aside className="result-peek" aria-live="polite">
              <i className="result-facet facet-1" aria-hidden="true" />
              <i className="result-facet facet-2" aria-hidden="true" />
              <i className="result-facet facet-3" aria-hidden="true" />
              <CheckCircle weight="fill" />
              <span>
                <strong>成果已准备好</strong>
                <small>项目进展汇报提纲已生成，可以继续压缩或调整语气。</small>
              </span>
              <button type="button" onClick={continueTask}>继续追问<ArrowRight /></button>
            </aside>
          )}

          <section
            ref={composerRef}
            className={`composer-dock${activeNav !== "home" ? " is-task-compose" : ""}${activeNav === "files" ? " is-file-compose" : ""}${hint ? " has-hint" : ""}${isFileDragging ? " is-file-dragging" : ""}${libraryDragging ? " is-library-target" : ""}`}
            onDragOver={handleComposerDragOver}
            onDrop={handleComposerDrop}
            onPointerMove={handleComposerPointerMove}
            onPointerLeave={() => composerApiRef.current?.leave()}
            onFocusCapture={() => composerApiRef.current?.focus(true)}
            onBlurCapture={handleComposerBlur}
          >
            <span ref={composerLightRef} className="composer-refraction-anchor" aria-hidden="true"><i className="composer-refraction" /></span>
            <i ref={chargeRailRef} className="composer-charge-rail" aria-hidden="true" />
            <i ref={wordPulseRef} className="composer-word-pulse" aria-hidden="true" />
            <div ref={dropLayerRef} className="composer-drop-layer" aria-hidden="true">
              <span><Paperclip weight="bold" /></span>
              <strong>松开添加附件</strong>
              <small>文件只保留在当前会话</small>
            </div>
            <input
              ref={attachmentInputRef}
              hidden
              type="file"
              multiple
              tabIndex={-1}
              onChange={(event) => {
                addAttachments(event.target.files);
                event.target.value = "";
              }}
            />
            {libraryContext.length > 0 && (
              <div className="composer-context" aria-label="本次提问引用的资料">
                <span className="composer-context-label">基于</span>
                {libraryContext.map((item) => (
                  <span className="context-chip" key={item.id}>
                    <BookOpen weight="bold" />
                    <span><strong>{item.name}</strong><small>{item.location}</small></span>
                    <button type="button" onClick={(event) => dismissAttachment(item.id, event)} aria-label={`不再引用 ${item.name}`}>
                      <X weight="bold" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={`composer-input${trayAttachments.length ? " has-attachments" : ""}`}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (hint) setHint("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    startTask();
                  }
                }}
                placeholder={activeNav === "files" ? "询问元枢这份资料…" : activeNav === "tasks" ? "继续追问或补充要求…" : "描述你想完成的事情…"}
                aria-label="任务目标"
                aria-describedby={hint ? "task-input-hint" : undefined}
              />
              <i className="composer-arrival-ring" aria-hidden="true" />
              {hint && <span className="input-hint" id="task-input-hint" role="alert">{hint}</span>}
              {trayAttachments.length > 0 && (
                <div ref={attachmentTrayRef} className="attachment-tray" aria-label="已添加附件">
                  {trayAttachments.map((item) => (
                    <span className={`attachment-chip${item.source === "library" ? " is-library" : ""}`} key={item.id}>
                      {item.source === "library" ? <BookOpen weight="bold" /> : <Paperclip weight="bold" />}
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.source === "library" ? item.location : formatFileSize(item.size)}</small>
                      </span>
                      <button type="button" onClick={(event) => dismissAttachment(item.id, event)} aria-label={`移除附件 ${item.name}`}>
                        <X weight="bold" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {libraryContext.length > 0 && !prompt.trim() && (
              <div className="composer-suggestions" aria-label="快捷提问">
                {FILE_QUICK_PROMPTS.map((quick) => (
                  <button type="button" key={quick.id} onClick={(event) => applyQuickPrompt(quick, event)} disabled={isRunning}>
                    <Sparkle weight="fill" />{quick.label}
                  </button>
                ))}
              </div>
            )}

            <div className="composer-toolbar">
              <div className="tool-group">
                {activeNav !== "files" && (
                  <ToolButton
                    onClick={() => attachmentInputRef.current?.click()}
                    disabled={isRunning}
                    aria-label={attachments.length ? `添加附件，当前 ${attachments.length} 个` : "添加附件"}
                  >
                    <Paperclip />附件{attachments.length > 0 && <span className="attachment-count">{attachments.length}</span>}
                  </ToolButton>
                )}
                <ToolButton
                  data-tool="knowledge"
                  active={knowledgeEnabled}
                  onClick={() => {
                    const next = !knowledgeEnabled;
                    setKnowledgeEnabled(next);
                    runToolSignal("knowledge", next);
                  }}
                >
                  <BookOpen />{libraryContext.length > 0 ? `已选 ${libraryContext.length} 份` : "资料库"}
                </ToolButton>
                <ToolButton
                  data-tool="web"
                  active={webEnabled}
                  onClick={() => {
                    const next = !webEnabled;
                    setWebEnabled(next);
                    runToolSignal("web", next);
                  }}
                >
                  <GlobeHemisphereWest />联网搜索
                </ToolButton>
              </div>

              <div
                ref={modeGroupRef}
                className="mode-group"
                data-active={activeMode}
                aria-label="执行模式"
                role="group"
                onPointerDown={handleModePointerDown}
                onPointerMove={handleModePointerMove}
                onPointerUp={(event) => finishModeDrag(event)}
                onPointerCancel={(event) => finishModeDrag(event, true)}
              >
                <span ref={modeGlassRef} className="mode-glass" aria-hidden="true" />
                <span ref={modeCausticRef} className="mode-caustic" aria-hidden="true" />
                <button data-mode="auto" type="button" aria-pressed={activeMode === "auto"} className={activeMode === "auto" ? "is-active" : ""} onClick={() => selectMode("auto")}><Sparkle weight="fill" />自动</button>
                <button data-mode="quick" type="button" aria-pressed={activeMode === "quick"} className={activeMode === "quick" ? "is-active" : ""} onClick={() => selectMode("quick")}><Lightning weight="fill" />快速</button>
                <button data-mode="deep" type="button" aria-pressed={activeMode === "deep"} className={activeMode === "deep" ? "is-active" : ""} onClick={() => selectMode("deep")}><Brain weight="duotone" />深度</button>
              </div>

              <button
                ref={startButtonRef}
                className={`start-button${isRunning ? " is-stoppable" : ""}`}
                type="button"
                onClick={handlePrimaryAction}
                onPointerMove={handleStartButtonPointerMove}
                onPointerDown={handleStartButtonPointerDown}
                onPointerUp={releaseStartButton}
                onPointerCancel={releaseStartButton}
                onPointerLeave={releaseStartButton}
                aria-busy={isRunning}
              >
                {isRunning
                  ? <Stop weight="fill" />
                  : showsResultToggle
                    ? <CheckCircle weight="fill" />
                    : activeNav === "files" ? <Sparkle weight="fill" /> : <Play weight="fill" />}
                <span>{isRunning
                  ? "停止执行"
                  : showsResultToggle
                    ? (showResult ? "收起成果" : "查看成果")
                    : activeNav === "files" ? "发送提问" : "开始执行"}</span>
                {isRunning ? null : <ArrowRight />}
              </button>
            </div>
          </section>

        </div>
      </section>

      {/* 亮度搬进 alpha：黑（脉络之间）→ 全透明，亮（脉络本身）→ 不透明。
          等价于"在纯黑背景上做 screen"，但它是真 alpha，不受混合组隔离影响。
          colorInterpolationFilters 必须显式写 sRGB——默认的 linearRGB 会把青柠拧成另一种绿。
          滤镜区域也必须显式收到 bbox：默认是 -10%/-10%/120%/120%，会多出 44% 的像素要过滤，
          而亮度→alpha 不做任何扩散，裁到 bbox 完全等价，纯省。
          它必须常驻在开场分支之外：脉络回声每次提交都要用它，而开场每个会话只挂载一次。 */}
      <svg className="opening-defs" aria-hidden="true" focusable="false">
        <filter
          id="ignite-luma-alpha"
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    .3 .59 .11 0 0"
          />
        </filter>
      </svg>

      {opening ? (
        <>
          <div ref={openingVeilRef} className="intro-veil" aria-hidden="true">
            <i ref={openingFieldRef} className="intro-field" />
            <span ref={openingMotesRef} className="intro-motes">
              <i /><i /><i /><i /><i /><i /><i />
              <i /><i /><i /><i /><i /><i /><i />
            </span>
          </div>
          <i ref={openingGlowRef} className="intro-glow" aria-hidden="true" />
          <div ref={openingBrandRef} className="intro-brand" aria-hidden="true">
            <img src="/assets/brand/yuanshu-agent-mark.png" alt="" />
            <strong>元枢</strong>
            <span>企业通用智能体</span>
            <em>一起把事情做完</em>
          </div>
        </>
      ) : null}
    </main>
  );
}
