import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BookOpen } from "@phosphor-icons/react/dist/icons/BookOpen";
import { Check } from "@phosphor-icons/react/dist/icons/Check";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/icons/ClockCounterClockwise";
import { FileDoc } from "@phosphor-icons/react/dist/icons/FileDoc";
import { FilePdf } from "@phosphor-icons/react/dist/icons/FilePdf";
import { FilePpt } from "@phosphor-icons/react/dist/icons/FilePpt";
import { FileXls } from "@phosphor-icons/react/dist/icons/FileXls";
import { FolderSimple } from "@phosphor-icons/react/dist/icons/FolderSimple";
import { LockSimple } from "@phosphor-icons/react/dist/icons/LockSimple";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/icons/MagnifyingGlass";
import { Paperclip } from "@phosphor-icons/react/dist/icons/Paperclip";
import { Plus } from "@phosphor-icons/react/dist/icons/Plus";
import { ShieldCheck } from "@phosphor-icons/react/dist/icons/ShieldCheck";
import { Sparkle } from "@phosphor-icons/react/dist/icons/Sparkle";
import { UploadSimple } from "@phosphor-icons/react/dist/icons/UploadSimple";
import { X } from "@phosphor-icons/react/dist/icons/X";
import { EASE } from "./pageMotion";

const COLLECTIONS = [
  {
    id: "recent",
    label: "最近使用",
    icon: ClockCounterClockwise,
    files: [
      { id: "progress", name: "研发进度清单.xlsx", kind: "xls", time: "刚刚查看", size: "128 KB", location: "项目资料 / 研发管理" },
      { id: "weekly", name: "项目周报 · 8月26日", kind: "doc", time: "2小时前", size: "84 KB", location: "项目资料 / 周报" },
      { id: "review", name: "设计评审纪要.pdf", kind: "pdf", time: "昨天", size: "1.2 MB", location: "项目资料 / 设计" },
    ],
  },
  {
    id: "project",
    label: "项目资料",
    icon: FolderSimple,
    files: [
      { id: "requirements", name: "需求规格说明书.docx", kind: "doc", time: "3天前", size: "316 KB", location: "项目资料 / 产品" },
      { id: "prototype", name: "原型设计稿.fig", kind: "doc", time: "5天前", size: "8.4 MB", location: "项目资料 / 设计" },
      { id: "tech", name: "技术方案评审.pdf", kind: "pdf", time: "7天前", size: "2.1 MB", location: "项目资料 / 技术" },
    ],
  },
  {
    id: "policy",
    label: "制度文档",
    icon: ShieldCheck,
    files: [
      { id: "security", name: "信息安全管理制度.docx", kind: "doc", time: "10天前", size: "206 KB", location: "制度文档 / 安全" },
      { id: "conduct", name: "员工行为准则.pdf", kind: "pdf", time: "12天前", size: "420 KB", location: "制度文档 / 人事" },
      { id: "privacy", name: "保密协议模板.docx", kind: "doc", time: "15天前", size: "98 KB", location: "制度文档 / 合规" },
    ],
  },
  {
    id: "product",
    label: "产品知识",
    icon: BookOpen,
    files: [
      { id: "map", name: "产品路线图.pptx", kind: "ppt", time: "18天前", size: "4.8 MB", location: "产品知识 / 规划" },
      { id: "competitor", name: "竞品分析报告.xlsx", kind: "xls", time: "20天前", size: "780 KB", location: "产品知识 / 市场" },
      { id: "research", name: "用户研究摘要.pdf", kind: "pdf", time: "22天前", size: "1.6 MB", location: "产品知识 / 用研" },
    ],
  },
];

const SESSION_FALLBACK = [
  { id: "session-sheet", name: "临时数据表.xlsx", size: "32 KB", kind: "xls" },
  { id: "session-note", name: "会议纪要草稿.pdf", size: "210 KB", kind: "pdf" },
];

const ICONS = {
  xls: FileXls,
  doc: FileDoc,
  pdf: FilePdf,
  ppt: FilePpt,
};

const PREVIEW_ROWS = [
  ["需求梳理", "需求", "08-18", "08-22", "张明"],
  ["方案设计", "设计", "08-22", "08-28", "李文"],
  ["核心开发", "开发", "08-28", "09-15", "王强"],
  ["联调测试", "测试", "09-15", "09-22", "陈杰"],
  ["发布上线", "发布", "09-26", "09-26", "李文"],
];

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function inferKind(name = "") {
  const extension = name.split(".").pop()?.toLowerCase();
  if (["xls", "xlsx", "csv"].includes(extension)) return "xls";
  if (["pdf"].includes(extension)) return "pdf";
  if (["ppt", "pptx"].includes(extension)) return "ppt";
  return "doc";
}

export function FilesWorkspace({
  companionMemoryFormRef,
  sessionAttachments = [],
  onAddSessionAttachment,
  onUseFile,
  libraryDragType,
  onLibraryDragStart,
  onLibraryDragEnd,
  onSearchStateChange,
}) {
  const rootRef = useRef(null);
  const previewRef = useRef(null);
  const signalRef = useRef(null);
  const uploadInputRef = useRef(null);
  const uploadButtonRef = useRef(null);
  const uploadTweenRef = useRef(null);
  const fileTiltApiRef = useRef(new WeakMap());
  const [selectedId, setSelectedId] = useState("progress");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingFileId, setDraggingFileId] = useState(null);
  const { contextSafe } = useGSAP({ scope: rootRef });

  // "用于当前对话"不是凭空多出一个附件：详情面板先朝这份资料在轨道上的卡片收一下，
  // 同时把面板自己的矩形交给上层，由输入条那边接着飞过去落成 chip。
  const handoffFile = contextSafe((file, event) => {
    const panel = previewRef.current;
    const card = rootRef.current?.querySelector(`.memory-file[data-file-id="${file?.id}"]`);
    const rect = (event?.currentTarget ?? panel)?.getBoundingClientRect?.();
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onUseFile?.(file, rect);
      return;
    }
    const panelBox = panel.getBoundingClientRect();
    const cardBox = card?.getBoundingClientRect();
    const toward = cardBox
      ? {
        x: (cardBox.left + cardBox.width / 2 - (panelBox.left + panelBox.width / 2)) * .06,
        y: (cardBox.top + cardBox.height / 2 - (panelBox.top + panelBox.height / 2)) * .06,
      }
      : { x: -10, y: 0 };
    gsap.killTweensOf(panel);
    gsap.timeline({ defaults: { overwrite: "auto" } })
      .to(panel, { ...toward, scale: .972, autoAlpha: .52, duration: .16, ease: "power3.in" }, 0)
      .to(panel, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: .42, ease: EASE.settle, clearProps: "transform" }, .16);
    onUseFile?.(file, rect);
  });

  const collections = useMemo(() => {
    if (!uploadedFiles.length) return COLLECTIONS;
    return COLLECTIONS.map((collection) => collection.id === "recent"
      ? { ...collection, files: [...uploadedFiles, ...collection.files] }
      : collection);
  }, [uploadedFiles]);

  const allFiles = useMemo(() => collections.flatMap((collection) => collection.files), [collections]);
  const selectedFile = allFiles.find((file) => file.id === selectedId) ?? allFiles[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCollections = normalizedQuery
    ? collections.map((collection) => ({
      ...collection,
      files: collection.files.filter((file) => file.name.toLowerCase().includes(normalizedQuery)),
    })).filter((collection) => collection.files.length)
    : collections;
  const visibleSessionFiles = sessionAttachments.length
    ? sessionAttachments.slice(0, 2).map((file) => ({ ...file, kind: inferKind(file.name), size: file.sizeLabel ?? formatBytes(file.size) }))
    : SESSION_FALLBACK;

  useEffect(() => {
    onSearchStateChange?.({
      active: searchFocused || Boolean(normalizedQuery),
      empty: Boolean(normalizedQuery) && visibleCollections.length === 0,
    });
  }, [normalizedQuery, onSearchStateChange, searchFocused, visibleCollections.length]);

  useGSAP(() => {
    const fileCards = gsap.utils.toArray(".memory-file");
    fileCards.forEach((card) => {
      gsap.set(card, {
        transformPerspective: 760,
        transformOrigin: "50% 72%",
        ...fileRestState(card),
      });
    });

    return () => {
      uploadTweenRef.current?.kill();
      fileTiltApiRef.current = new WeakMap();
    };
  }, { scope: rootRef });

  // 选中不该把卡片掰歪。让它微微抬起、角度几乎回正（保留自身倾斜的三成），
  // 读起来是"这张被拿起来了"，而不是"这张歪了"。
  const fileSelectedState = (target) => {
    const rest = Number(target?.dataset.restRotation || 0);
    return { y: -4, rotation: rest * .35, rotationX: 0, rotationY: 0, scaleX: 1.012, scaleY: 1.012 };
  };

  const fileRestState = (target) => {
    if (target?.getAttribute("aria-pressed") === "true") return fileSelectedState(target);
    return {
      y: 0,
      rotation: Number(target?.dataset.restRotation || 0),
      rotationX: 0,
      rotationY: 0,
      scaleX: 1,
      scaleY: 1,
    };
  };

  const getFileTiltApi = (target) => {
    let api = fileTiltApiRef.current.get(target);
    if (api) return api;
    const options = { duration: .32, ease: "power3.out", overwrite: "auto" };
    api = {
      y: gsap.quickTo(target, "y", options),
      rotation: gsap.quickTo(target, "rotation", options),
      rotationX: gsap.quickTo(target, "rotationX", options),
      rotationY: gsap.quickTo(target, "rotationY", options),
      scaleX: gsap.quickTo(target, "scaleX", options),
      scaleY: gsap.quickTo(target, "scaleY", options),
    };
    fileTiltApiRef.current.set(target, api);
    return api;
  };

  const releasePress = contextSafe((target) => {
    if (!target) return;
    gsap.killTweensOf(target);
    const rest = target.classList.contains("memory-file")
      ? fileRestState(target)
      : { y: 0, rotation: 0, rotationX: 0, rotationY: 0, scaleX: 1, scaleY: 1 };
    gsap.to(target, { ...rest, duration: .42, ease: "back.out(1.7)", overwrite: "auto" });
  });

  const press = contextSafe((event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.currentTarget;
    gsap.killTweensOf(target);
    const selected = target.getAttribute("aria-pressed") === "true";
    gsap.to(target, {
      y: selected ? -2 : 1,
      rotation: selected ? -1.4 : Number(target.dataset.restRotation || 0) * .5,
      rotationX: 0,
      rotationY: 0,
      scaleX: selected ? 1.005 : .985,
      scaleY: selected ? .965 : .94,
      duration: .09,
      ease: "power2.in",
      overwrite: "auto",
    });
  });

  const followFilePointer = contextSafe((event) => {
    if (event.pointerType === "touch" || event.buttons) return;
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const ny = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    const selected = target.getAttribute("aria-pressed") === "true";
    const restRotation = Number(target.dataset.restRotation || 0);
    const api = getFileTiltApi(target);

    target.style.setProperty("--file-light-x", `${(nx + 1) * 50}%`);
    target.style.setProperty("--file-light-y", `${(ny + 1) * 50}%`);
    api.y(selected ? -7 + ny * 1.1 : -2.5 + ny * .55);
    api.rotation((selected ? -2.8 : restRotation) + nx * (selected ? .6 : .35));
    api.rotationX(-ny * (selected ? 4.2 : 2));
    api.rotationY(nx * (selected ? 5.2 : 2.4));
    api.scaleX(selected ? 1.03 : 1.012);
    api.scaleY(selected ? 1.03 : 1.012);
  });

  const selectFile = contextSafe((file, target, event) => {
    const root = rootRef.current;
    const preview = previewRef.current;
    if (!root || !preview || !target) return;

    const ripple = target.querySelector(".memory-chip-ripple");
    const memoryCore = companionMemoryFormRef?.current?.querySelector(".memory-form-core");
    const previousSelected = root.querySelector(".memory-file.is-selected");

    gsap.killTweensOf([target, preview, ripple, memoryCore].filter(Boolean));

    // 一次点击只讲一件事：这张卡被拿起来、详情跟着换。
    // 之前同时跑六组动画（旋转、涟漪、飞行光点、整行挤压、面板明暗、核心脉冲），
    // 视线被扯散，反而显得廉价。
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline.addLabel("press", 0);

    if (previousSelected && previousSelected !== target) {
      timeline.to(previousSelected, { ...fileRestState(previousSelected), duration: .34, ease: "power3.out" }, "press");
    }

    timeline.to(target, { ...fileSelectedState(target), duration: .42, ease: "back.out(1.4)" }, "press");

    if (ripple) {
      // 涟漪从真正被点到的地方化开，并且一直扩到能盖住离该点最远的那个角，
      // 所以点边角和点中间的观感是不一样的——这正是它显得"自然"的原因。
      const bounds = target.getBoundingClientRect();
      const hasPoint = event && (event.clientX || event.clientY);
      const originX = hasPoint ? event.clientX - bounds.left : bounds.width / 2;
      const originY = hasPoint ? event.clientY - bounds.top : bounds.height / 2;
      const reach = Math.max(
        Math.hypot(originX, originY),
        Math.hypot(bounds.width - originX, originY),
        Math.hypot(originX, bounds.height - originY),
        Math.hypot(bounds.width - originX, bounds.height - originY),
      );
      gsap.set(ripple, { left: originX, top: originY, xPercent: -50, yPercent: -50 });
      timeline.fromTo(ripple,
        { autoAlpha: .58, scale: .2 },
        { autoAlpha: 0, scale: (reach * 2) / 18, duration: .62, ease: "expo.out", immediateRender: false },
        "press",
      );
    }

    // 详情面板走一次轻交叉淡入：压到 .74 就换内容，再回到 1，
    // 比先暗到 .58 再亮起来温和得多。
    timeline
      .to(preview, { autoAlpha: .74, y: 3, duration: .12, ease: "power2.in" }, "press+=.02")
      .call(() => flushSync(() => setSelectedId(file.id)), [], "press+=.14")
      .fromTo(preview,
        { autoAlpha: .74, y: 4 },
        { autoAlpha: 1, y: 0, duration: .4, ease: "expo.out", immediateRender: false },
        "press+=.18",
      );

    if (memoryCore) {
      timeline.to(memoryCore, { scaleX: 1.03, scaleY: 1.03, duration: .18, repeat: 1, yoyo: true, ease: "sine.inOut" }, "press+=.2");
    }
  });

  const pulseUploadMemory = contextSafe(() => {
    const root = rootRef.current;
    const signal = signalRef.current;
    const trigger = uploadButtonRef.current;
    const memoryCore = companionMemoryFormRef?.current?.querySelector(".memory-form-core");
    const firstOrbit = root?.querySelector(".memory-orbit");
    if (!root || !signal || !trigger || !memoryCore || !firstOrbit) return;

    const rootBounds = root.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const coreBounds = memoryCore.getBoundingClientRect();
    const orbitBounds = firstOrbit.getBoundingClientRect();
    const startX = triggerBounds.left + triggerBounds.width / 2 - rootBounds.left;
    const startY = triggerBounds.top + triggerBounds.height / 2 - rootBounds.top;
    const coreX = coreBounds.left + coreBounds.width * .42 - rootBounds.left;
    const coreY = coreBounds.top + coreBounds.height * .57 - rootBounds.top;
    const orbitX = orbitBounds.right - rootBounds.left - 22;
    const orbitY = orbitBounds.top + orbitBounds.height / 2 - rootBounds.top;

    gsap.killTweensOf([signal, memoryCore, firstOrbit]);
    const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
    timeline
      .set(signal, { x: startX, y: startY, autoAlpha: 0, scaleX: .42, scaleY: .42 })
      .to(signal, { autoAlpha: .9, scaleX: 1, scaleY: 1, duration: .12, ease: "power3.out" })
      .to(signal, { x: coreX, y: coreY, duration: .24, ease: "power3.inOut" }, .06)
      .to(memoryCore, { scaleX: 1.06, scaleY: 1.06, duration: .14, repeat: 1, yoyo: true, ease: "sine.inOut" }, .24)
      .to(signal, { x: orbitX, y: orbitY, autoAlpha: .16, scaleX: .32, scaleY: .32, duration: .24, ease: "power3.in" }, .28)
      .to(firstOrbit, { scaleX: 1.006, scaleY: .988, duration: .12, repeat: 1, yoyo: true, ease: "sine.inOut" }, .44)
      .set(signal, { autoAlpha: 0 });
  });

  const setMemoryReceive = contextSafe((active) => {
    const memoryForm = companionMemoryFormRef?.current;
    const memoryCore = memoryForm?.querySelector(".memory-form-core");
    const memoryVisor = memoryForm?.querySelector(".memory-form-visor");
    if (!memoryCore || !memoryVisor) return;
    gsap.killTweensOf([memoryCore, memoryVisor]);
    gsap.to(memoryCore, {
      autoAlpha: active ? 1 : .96,
      scaleX: active ? 1.045 : 1,
      scaleY: active ? 1.045 : 1,
      duration: active ? .18 : .24,
      ease: active ? "power3.out" : "sine.inOut",
      overwrite: "auto",
    });
    gsap.to(memoryVisor, {
      autoAlpha: active ? 1 : .96,
      scaleX: active ? 1.018 : 1,
      scaleY: active ? 1.018 : 1,
      duration: active ? .18 : .24,
      ease: active ? "power3.out" : "sine.inOut",
      overwrite: "auto",
    });
  });

  const handleUpload = contextSafe((fileList) => {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    const progress = { value: 0 };
    const nextFile = {
      id: `uploaded-${file.name}-${file.lastModified}`,
      name: file.name,
      kind: inferKind(file.name),
      time: "刚刚上传",
      size: formatBytes(file.size),
      location: "最近使用 / 新上传",
    };

    uploadTweenRef.current?.kill();
    pulseUploadMemory();
    setUploading({ name: file.name, progress: 0 });
    uploadTweenRef.current = gsap.to(progress, {
      value: 100,
      duration: 1.25,
      ease: "power2.inOut",
      onUpdate: () => setUploading({ name: file.name, progress: Math.round(progress.value) }),
      onComplete: () => {
        setUploadedFiles((current) => [nextFile, ...current.filter((item) => item.id !== nextFile.id)]);
        setUploading(null);
        window.requestAnimationFrame(() => {
          const target = rootRef.current?.querySelector(`[data-file-id="${CSS.escape(nextFile.id)}"]`);
          if (target) selectFile(nextFile, target);
        });
      },
    });
  });

  const handleDrop = (event) => {
    if (!hasExternalFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setMemoryReceive(false);
    handleUpload(event.dataTransfer.files);
  };

  // 只有系统文件拖入才提示"松开上传"；资料库内部的卡片拖拽走另一套落点。
  const hasExternalFiles = (event) => Array.from(event.dataTransfer?.types || []).includes("Files");

  const startFileDrag = (event, file) => {
    if (!libraryDragType) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(libraryDragType, JSON.stringify({
      id: file.id,
      name: file.name,
      kind: file.kind,
      size: file.size,
      location: file.location,
    }));
    event.dataTransfer.setData("text/plain", file.name);
    releasePress(event.currentTarget);
    setDraggingFileId(file.id);
    onLibraryDragStart?.(file);
  };

  const endFileDrag = (event) => {
    releasePress(event.currentTarget);
    setDraggingFileId(null);
    onLibraryDragEnd?.();
  };

  const SelectedIcon = ICONS[selectedFile.kind] ?? FileDoc;

  return (
    <section
      ref={rootRef}
      className={`files-workspace${isDragging ? " is-dragging" : ""}${searchFocused || normalizedQuery ? " is-search-active" : ""}${normalizedQuery && !visibleCollections.length ? " is-search-empty" : ""}`}
      aria-label="私有资料库"
      onDragEnter={(event) => {
        if (!hasExternalFiles(event)) return;
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
        setMemoryReceive(true);
      }}
      onDragOver={(event) => {
        if (!hasExternalFiles(event)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!hasExternalFiles(event)) return;
        event.preventDefault();
        event.stopPropagation();
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsDragging(false);
          setMemoryReceive(false);
        }
      }}
      onDrop={handleDrop}
    >
      <span ref={signalRef} className="file-selection-signal" aria-hidden="true"><i /></span>
      <input
        ref={uploadInputRef}
        hidden
        type="file"
        tabIndex={-1}
        onChange={(event) => {
          handleUpload(event.target.files);
          event.target.value = "";
        }}
      />

      <header className="files-head file-reveal-item">
        <label className="files-search">
          <MagnifyingGlass />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="搜索资料"
            aria-label="搜索资料"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X /></button>}
        </label>
        <span className="files-privacy">仅你可见</span>
        <button
          ref={uploadButtonRef}
          className="files-upload-button"
          type="button"
          onPointerDown={press}
          onPointerUp={(event) => releasePress(event.currentTarget)}
          onPointerCancel={(event) => releasePress(event.currentTarget)}
          onPointerLeave={(event) => releasePress(event.currentTarget)}
          onClick={() => uploadInputRef.current?.click()}
        >
          <UploadSimple weight="bold" />上传资料
        </button>
      </header>

      <div className="memory-stage file-reveal-item">
        <div className="memory-orbits" aria-label="资料分组">
          {visibleCollections.length ? visibleCollections.map((collection) => {
            const CollectionIcon = collection.icon;
            return (
              <section className="memory-orbit" key={collection.id} data-collection={collection.id}>
                <header><CollectionIcon /><strong>{collection.label}</strong><i /></header>
                <div className="memory-file-row">
                  {collection.files.map((file, fileIndex) => {
                    const FileIcon = ICONS[file.kind] ?? FileDoc;
                    const selected = file.id === selectedFile.id;
                    return (
                      <button
                        className={`memory-file${selected ? " is-selected" : ""}${draggingFileId === file.id ? " is-drag-source" : ""}`}
                        type="button"
                        key={file.id}
                        data-file-id={file.id}
                        data-rest-rotation={[-.45, .7, 1.3][fileIndex % 3]}
                        aria-pressed={selected}
                        draggable
                        onDragStart={(event) => startFileDrag(event, file)}
                        onDragEnd={endFileDrag}
                        onPointerDown={press}
                        onPointerUp={(event) => releasePress(event.currentTarget)}
                        onPointerCancel={(event) => releasePress(event.currentTarget)}
                        onPointerLeave={(event) => releasePress(event.currentTarget)}
                        onPointerMove={followFilePointer}
                        onClick={(event) => selectFile(file, event.currentTarget, event)}
                      >
                        <span className={`file-kind is-${file.kind}`}><FileIcon weight="duotone" /></span>
                        <span><strong>{file.name}</strong><small>{file.time}</small></span>
                        <span className="memory-ripple-clip" aria-hidden="true"><i className="memory-chip-ripple" /></span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          }) : (
            <div className="files-empty"><MagnifyingGlass /><strong>没有找到相关资料</strong><small>试试其他关键词</small></div>
          )}
        </div>

        <aside ref={previewRef} className="memory-preview">
          <header>
            <span className={`preview-file-icon is-${selectedFile.kind}`}><SelectedIcon weight="duotone" /></span>
            <span><strong>{selectedFile.name}</strong><small><i />已索引</small></span>
          </header>
          <dl className="preview-meta">
            <div><dt>来源位置</dt><dd>{selectedFile.location}</dd></div>
            <div><dt>文件大小</dt><dd>{selectedFile.size}</dd></div>
            <div><dt>更新时间</dt><dd>2026-08-28 10:42</dd></div>
          </dl>
          <section className="preview-summary">
            <span>内容摘要</span>
            <p>本表用于跟踪研发项目的整体进度，包含需求、设计、开发、测试、发布等阶段计划与实际完成情况。</p>
          </section>
          <section className="preview-table-wrap">
            <span>预览（前 5 行）</span>
            <table>
              <thead><tr><th>任务名称</th><th>阶段</th><th>计划开始</th><th>计划完成</th><th>负责人</th></tr></thead>
              <tbody>{PREVIEW_ROWS.map((row) => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={`${row[0]}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </section>
          <footer>
            <span><Check weight="bold" />已索引 · 可用于智能问答</span>
            <button type="button" onClick={(event) => handoffFile(selectedFile, event)}><Sparkle weight="fill" />用于当前对话</button>
          </footer>
        </aside>
      </div>

      <section className="session-files file-reveal-item" aria-label="当前会话附件">
        <header><Paperclip /><strong>当前会话附件</strong><span>不会存入资料库</span></header>
        <div>
          {visibleSessionFiles.map((file) => {
            const SessionIcon = ICONS[file.kind] ?? FileDoc;
            return <span className="session-file" key={file.id}><SessionIcon weight="duotone" /><span><strong>{file.name}</strong><small>{file.size}</small></span></span>;
          })}
          <button type="button" className="session-add" onClick={onAddSessionAttachment}><Plus />添加附件</button>
        </div>
      </section>

      {uploading && (
        <aside className="file-upload-progress" aria-live="polite">
          <span><UploadSimple weight="bold" /></span>
          <div><strong>正在安全索引 {uploading.name}</strong><i><b style={{ transform: `scaleX(${uploading.progress / 100})` }} /></i><small>{uploading.progress}%</small></div>
        </aside>
      )}

      <div className="files-drag-overlay" aria-hidden="true">
        <span><UploadSimple weight="bold" /></span>
        <strong>松开上传到私有资料库</strong>
        <small>文件只属于你，不会进入当前会话附件</small>
      </div>
    </section>
  );
}
