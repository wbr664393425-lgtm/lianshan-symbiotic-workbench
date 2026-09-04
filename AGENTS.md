# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Prototype decision

- This folder is an isolated visual preview and must not replace or modify the existing product page.
- `design-reference/selected-symbiotic-workbench.png` is the visual source of truth: narrow dark navigation, large translucent synthetic companion, lime status nodes, restrained capability cards, and a bottom glass task composer.
- Keep the existing official mountain-shield assets untouched as references. This isolated prototype displays the generated transparent `public/assets/brand/yuanshu-agent-mark.png`, a pearl-glass folded mark with a restrained lime core.
- The intelligent agent name shown in this isolated prototype is `元枢`. It means an intelligent central pivot and matches the companion core and task-convergence visual language; this does not rename the formal product outside this folder.
- Advanced polish should come from purposeful micro-motion and material detail: pointer-aware attention light, restrained companion parallax, execution-only body scanning, state-driven node feedback, tactile controls, and refined glass edges. Avoid decorative particle fields, rainbow effects, or motion on every component.
- The `自动 / 快速 / 深度` mode selector uses one translucent glass block that slides between fixed segments. Labels and icons stay still while the material moves beneath them.
- The mode-selector glass block is draggable with mouse or touch. It follows the pointer continuously while held, then snaps to the nearest fixed segment on release; click and keyboard selection remain available.
- A simple click on an execution mode must use the glass block's eased slide transition. Do not enter direct pointer-follow mode until movement crosses the drag threshold, otherwise clicks appear to flash or jump.
- Premium interaction feedback should behave like a physical system: the mode glass deforms slightly with drag velocity, pointer position controls local caustic light, the primary CTA uses one GSAP press/release pipeline, and starting a valid task sends one visible signal into the companion core. Empty submission redirects that signal into the task input instead of launching it. Keep these effects restrained, state-driven, and reduced-motion safe.
- Keep the operating-system cursor. Do not ship a replacement cursor. Pointer light uses scoped GSAP `quickTo` transforms with one primary flare, one directional beam, and two delayed echoes. It intensifies only during a confirmed drag, settles when movement stops, honors reduced motion, and cleans up through `useGSAP`.
- Homepage motion is organized as a system: a one-time GSAP entrance timeline establishes hierarchy; the companion body, halo, nodes, and core use distinct parallax damping; the composer owns a localized refractive layer and focus lift; task launch uses one coordinated timeline from button commit to core activation. Do not replace these with unrelated looping effects.
- Homepage refresh must reveal the companion through one isolated `.companion-intro-layer`. Keep it hidden in CSS until the high-priority companion image is decoded, then use a transform/opacity-only GSAP entrance. Do not animate `.companion-wrap` for initial entry because the reversible page-transition timeline owns that layer; the breathing loop stays nested inside the intro layer so the two motions never compete for the same transform.
- Mode dragging uses edge resistance, velocity deformation, semantic preview, and a short spring snap. Click and keyboard selection keep the same sliding glass material without direct pointer following.
- The attachment control must open the native file chooser and accept file drag-and-drop. Dropped files become removable local-session chips and must not enter the private knowledge base automatically.
- Home and task navigation share one persistent companion scene. The selected task-page mock at `design-reference/task-workbench-source.png` is the task-view source of truth and must remain in the same restrained light glass system as the homepage; do not reinterpret it as a dark dashboard.
- The home-to-task transition is a reversible single-subject GSAP timeline whose internal beats span 1.16 s of timeline time; playback speed is driven by `motionDuration` (`PAGE_MOTION.flipDuration`, currently .68 s for home↔work and .4 s between the task and file panels), so adjust the tempo there rather than by rewriting the beats. One shared companion image remains mounted and visible across both pages; navigation, scene translation, scale, opacity, energy light, task content and composer geometry change around it. Do not crossfade different generated bodies. Keep both views mounted for interruption-safe reversal, use GSAP Flip for composer geometry, animate transforms/opacity instead of layout or large-image blur, and honor reduced motion.
- The homepage status card owns a short early exit/late return tween so it never overlaps the task workspace. Companion energy bands are directional transient timelines rather than children of the reversible page timeline: home → task may use the fuller convergence sweep, while task → home must use a restrained collapse that settles within roughly 340ms and is killed/restarted safely on interrupted navigation.
- Composer page transitions must keep nested controls at their real size: capture and Flip only `.composer-dock`, use `scale: false`, and isolate its geometry animation with `contain: layout paint`. The outer timeline progress driver stays linear so the child tweens own the easing, while companion keyframes crossfade with opacity only.
- Generated transition assets in `public/assets/companion-frames/` and `ai-companion-task.webp` are retained only as design exploration references. They must not be mounted in the live transition, because their silhouette differences create jumps and reverse-play ghosting.
- The companion breathing loop belongs only to `.companion-pose-layer`; the live scene contains exactly one `.companion-shared-figure`. Active navigation buttons must not move on hover, and the navigation glass must use one non-overlapping position tween so reverse playback returns to the true button geometry.
- The task-state companion changes form through one generated black-background emissive texture, clipped to the persistent homepage figure and split into visor, core, and neural regions. These regions stay mounted and are revealed by the same reversible page timeline using transform and opacity only; never replace this with a second full-body crossfade.
- The persistent `.composer-dock` is owned only by Flip geometry and interaction motion. Homepage entrance may animate `.composer-input` and `.composer-toolbar`, but must never set the dock's opacity or entrance transform, otherwise early home/task switching can strand the shared composer at opacity `0`.
- Task-lifecycle motion is one coherent state system rather than decorative looping light: hovering or focusing the task navigation previews intent on a dedicated companion overlay, execution sends one finite energy pulse from the matching companion region to the active task step, and completion converges those regions into the core before the answer settles. Keep this layer separate from the reversible page timeline, keep the shared body mounted, and disable it under reduced motion.
- Composer focus feedback belongs to the inner refractive light only. Never translate or scale `.composer-dock` on focus, because Flip owns the persistent dock's outer geometry.
- Keep task-navigation intent preview local to visor, core, and path shapes. Do not reintroduce a full-body mask, `mix-blend-mode`, or persistent `will-change` on the viewport-sized preview layer.
- Route transition owns the handoff between home and task. Navigation-preview commit may overlap briefly as a crossfade, while task lifecycle beams and completion motion must wait until the reversible route timeline has settled.
- Homepage refresh must not scale the full glass application frame or promote the full frame and every child entrance target simultaneously. Reserve temporary compositing for the decoded companion intro layer and clear it when entrance completes.
- **输入条的收起量是闭包状态，换任务必须复位**。那条 scroll effect 只依赖 `activeNav`，在任务页内换任务、提交、追问都不会重建它——收起量会带到下一条任务上，而下一条如果短到不需要滚动就再也没有 scroll 事件把它还回来，输入条就永远消失了（已踩过一次）。effect 要挂一个复位入口，同时归零收起量、`lastTop` 和 `thread.scrollTop`，所有换内容的动作各调一次。
- **收起是「让开」，不是「消失」**：不透明度最低只到 `.45`。压到 `.18` 时这块浅色玻璃在浅色工作台上就真的看不见了，配上 `pointer-events: none`，用户会以为输入条没了，而唯一的找回方式是把指针挪到画面底部——没人会猜到。
- **追问不许往输入框预填「基于「上一条标题」」这类前缀**：前缀会原样进到下一条任务的标题里，追问两次就套成「基于「基于「…」，」，」（已踩过一次）。追问把光标交给输入框就够了，placeholder 已经写着「继续追问或补充要求…」。
- **铺满容器的输入控件，焦点环画在外壳上**。`textarea` 铺满 `.composer-input`、自己没有圆角，全局那条 `textarea:focus-visible { outline-offset: 3px }` 会在 12px 圆角的壳外面画一个直角框，四个角全错开。焦点环归 `.composer-input:focus-within`，`outline` 自动跟随容器圆角；用 `:focus-within` 而不是 `:has(:focus-visible)`——文本框点进去和 Tab 进去都该有可见指示。
- **任务是有身份的对象，任务页不许再写死内容**：`tasks` / `activeTaskId` 是唯一的事实来源，标题、用户原话、参考来源、答案署名全部从 `activeTask` 读。首页提交要建一条新任务并自动切到任务视图——执行过程（轨道、回答、来源）全在那儿，留在首页就只剩状态卡一行字。切页与点火之间留 380ms，等工作台交接完再 `setPhase(0)`。
- **主按钮只有三种身份，优先级不许换序**：执行中＝停止执行；输入框有内容＝开始执行；没内容且刚做完＝查看／收起成果。把「查看成果」排在「有内容」前面的话，做完一件事之后打字再点执行，只会把上一条的成果卡开开合合（已踩过一次）。
- **执行中主按钮是唯一的出口，不许再设成 `disabled`**。停止状态存的是停在第几步（`0..3`，没停就是 `null`），不是布尔值——任务页要把执行轨道停在那一格，光知道「停过」画不出来。阶段推进的 timer 挂在 `[phase]` 那条 effect 上，靠它的 cleanup 清理，不要另起一个 timer ref。
- **不留只有外观没有行为的控件**。看起来能点却点不动的东西比没有更糟：读数就用展示块（`.capability-card`、`.source-item` 是这么改的，保留材质和容器级指针光，去掉悬停抬起、按压缩放和指针手势），带 `›` 箭头就必须真的有下一层，否则改成只读值行。新增控件之前先想清楚它接什么逻辑，接不上就不要画出可点的样子。
- 首页开场（核心点火）是**首次进入才播一次**的前奏，不是第二套动效系统：七幕共 6.52s，在 5.5s 调用 `timeline.play(0)` 交棒给既有入场时间轴，最后 1s 只是脉络与余光退场的尾巴。幕序固定为 场→核→传导→成形→待命→品牌→交棒，其中「待命」那 0.8s 不许砍——成形之后直接揭幕会很仓促，它是整段的落点。要加内容就加在可跳过的前缀里，不要再拉长主编排：`sessionStorage` 只保证一会话一次，但演示场合会反复播，6.5s 是第二遍还不烦的上限——补内容只能补在既有幕内（尘埃、合焦环、体积收拢、能力引线都是这么加进去的），补完必须回头核对总时长没被最晚那条补间顶出去。`?intro=1` 强制播（演示场合），`?intro=0` 强制跳过，`sessionStorage` 的 `yuanshu-opening-seen` 记住本次会话已播，`prefers-reduced-motion: reduce` 下连幕布都不挂载。任何时候点击或按键都会把编排 `timeScale(6)` 快进而不是硬切——交接顺序保持不变。
- 开场素材 `companion-ignite-map-v1.webp` 与 `ai-companion.webp` 严格同轮廓（1252×1898，即 2x 的 626:949）。外轮廓仍用人物图自身的 alpha 当遮罩。实测核心落在 43.6% / 55.6%，与既有 `.task-form-region` 的 `transform-origin: 43% 56%` 吻合。
- **开场的叠层一律靠真 alpha，不许靠 `mix-blend-mode: screen`**。`.companion-wrap` 带 transform、`.companion-body` 带 `will-change: transform`，两者各自是独立混合组，screen 永远够不到幕布，只会在组内跟透明背景相混——黑底会实打实画成一个黑方块。旧版看着没事只是因为当时幕布是一整片纯黑，加了底幕就藏不住（已踩过一次）。位图素材把亮度烘进 alpha 通道；点火层走 SVG `feColorMatrix` 的亮度→alpha（`#ignite-luma-alpha`），滤镜必须显式写 `color-interpolation-filters="sRGB"`，默认的 linearRGB 会把青柠拧成另一种绿。
- - **闸门补间的对象是阈值，不是 `brightness`**。两者是倒数关系（阈值 = `.5 / brightness`），对 brightness 线性补间会被倒数前压成一条几乎瞬间完成的曲线——实测 80ms 就点亮 46%、130ms 到 57%，1.7s 的传导只剩「上一帧核心、下一帧全亮」两帧，贴图的直方图均衡等于白做。阈值线性推进才等于脉络线性点亮，这是这张贴图存在的全部理由。`contrast` 必须跟着阈值走（`clamp(22t, 9, 24)`），推进 front 的边宽 ≈ `2t/C`，C 固定的话 front 会从糊边一路收成硬线。
- 点火的推进是**沿通路**的，不是同心圆：`companion-ignite-flow-v2.webp` 是从点火图自身脉络亮度算出的测地距离场（亮=先到），`.ignite-gate` 用 `filter: brightness()` 抬阈值、`contrast(12)` 定边缘软硬，在 `isolation: isolate` 的 `.ignite-stack` 里跟纹理相乘。`isolation` 那一句不能省——少了它 multiply 会穿透到工作台上。贴图已按到达顺序做过直方图均衡，节奏一律在 GSAP 缓动里调，不要去改贴图。
- `.companion-ignite` 的 `filter` 归 SVG 亮度→alpha 占用，开场的亮度/饱和补间只能落在内层 `.ignite-stack` 上。
- **点火层必须是 `.companion-intro-layer` 的兄弟，不能是它的子节点**。入场层的 opacity 负责"形体浮出"，脉络要独立于它常亮，否则两层一起淡入就没有"先有结构、后有形体"。两者同为 `.companion-body` 的 `inset: 0` 子节点，几何天然对齐。
- 开场辅助素材原图统一放在 `design-reference/source/`：`opening-field-v1.png` 是 2560×1440 的低亮度空间底幕（峰值不得超过 `#1b2422`，汇聚点偏右）；`opening-core-v1.png` 与 `opening-ring-hud-v1.png` 分别是 512／1024 方图；`companion-ignite-flow-v1.png` 与 `companion-edge-v1.png` 是 1252×1898 的人物对位层。原图一律是不带 alpha 的纯黑底 RGB；转 WebP 时，核心／对焦环／轮廓边这三张要把亮度烘进 alpha 通道（见上面的叠层规则），点火纹理与闸门图保持 RGB 不透明（`multiply` 需要不透明背景）。距离场必须保持纯灰度且亮度沿脉络路程衰减、不能退化成核心同心圆；轮廓边只允许从 `ai-companion.png` 的 alpha 抽外轮廓，不用 AI 重画。实际发布的距离场是脚本算出的 `companion-ignite-flow-v2`，AI 生成的 `companion-ignite-flow-v1.png` 只作为对照留档，不要接进代码。
- 开场的四条因果顺序不许打乱：**先对焦、后点亮**（对焦环收拢完成，核心才凝出——反过来就成了「东西先出现、仪器再去对它」；辉散层在环锁定的同一拍收拢让位给晶体本体，先有光、后有形）；**描边先画完、实体才填**（否则身体在自己轮廓还没画完时就长出来）；**引线先到、节点才亮**（反过来节点只是自己「出现」，「接通」这件事就没有方向；节点的 stagger 因此必须是 `from: "start"`，随机顺序配上引线就是乱线）；**字标先落定、再谈退场**（`.from` 的 `duration + stagger×(n-1)` 必须早于退场的起点，否则最后一行从没完整出现过）。
- **品牌层和能力引线都必须在幕布透光之前退场干净**。品牌是浅色字，引线是亮绿线，幕布一旦淡到能透出浅色工作台，两者都会跟界面糊在一起。现有余量：品牌退场 5.20–5.56s、最后一条引线 5.37s 收完，幕布 5.40s 起淡出，品牌退场结束时幕布仍有 0.93 不透明度。调整任何一端都要重新核对这个余量。
- **开场层的公共样式不许用位置选择器，也不许用 `background` 简写**（同一个坑踩过两次）：`.opening-core > i` 这类选择器权重（0,1,1）高过下面按类名给图的规则（0,1,0），而 `background:` 简写会把 `background-image` 一并重置成 `none`——核心特写、对焦环、辉散层因此变成三个看不见的空盒子，幕二整幕只剩底幕在淡入；`.intro-veil > i` 同理，把后来加进幕布的尘埃层连 `opacity: 0` 带底幕图一起套住。公共落位一律写 `background-position`／`background-size`／`background-repeat` 长写，幕布里的每一层各自按类名选中（底幕是 `.intro-field`）。症状好认：`background-size` 是对的（`contain`）而 `background-image` 是 `none`。
- **按实测落位的层，测量必须跑在时间轴构建之前，节点要当场重查**：幕五那条 `.from(nodes, ...)` 的 `immediateRender` 会在 `tl` 构建的同时把节点写成 `scale: .62`，之后再量就偏了；`nodes` 那份引用是 effect 顶部取的，而开演要等图片解码，这中间 React 可能已重渲染过一轮，旧引用脱离文档后量出来是一排 0×0 的盒子（引线会全部指向容器左上角，已踩过一次）。量到退化盒子就整条跳过——窄屏下 `.companion-nodes` 本就是 `display: none`，不画比画错好。
- 压在人物身上的线条一律读不出来：伴生体是近白的珍珠色，浅色线在上面直接消失，纯亮色又和自己的辉光糊成一团。能力引线的做法是**只画后 42%**（体内那段由脉络负责）＋饱和中绿＋暗边（管亮处）加辉光（管暗处）。要在同一条线上跨越「近白人物」和「纯黑幕布」两种底，单一颜色做不到。
- `.opening-core` 只负责定位（`left`／`top`／尺寸／`xPercent`／`yPercent`），四个子层（`.core-bloom` 辉散、`.core-flare` 形体、`.core-ring` 对焦环、`.core-lock` 合焦确认）各自补间。环要在核出现之前先聚焦，如果它跟着容器的 `autoAlpha`／`scale` 走，就会被一起按住或一起缩放。四层的静息态都写死在 CSS 里，不要让可见性依赖「CSS 兜底」和「JS 预置」两处状态的先后顺序。
- **开场结束时的层叠翻转必须发生在输入条不可见的那一格**。开场把 `.companion-wrap` 抬到 `z-index: 39` 盖住幕布，而 `.composer-dock` 平时 `z-index: 8` 压在人物身上（重叠 361×185px，主按钮整个在重叠区里）。摘 `is-opening` 就是把人物从 39 摔回 2，这是一次瞬时的前后对调，只要那一刻输入条是可见的就必然看见「啪」的一下。顺序固定为：幕布归零 → 摘 `is-opening` → 输入条淡入，三者不许换序，也不许把摘 class 拖到时间轴结束（原先拖到整段结束，比幕布消失晚了 0.4s，已踩过一次）。
- 开场期间让输入条隐身只准用 `opacity: 0`，**不要用 `autoAlpha`**：`visibility: hidden` 会让 Chrome 跳过这一层的绘制，28px `backdrop-filter` 的首次栅格化（实测 40ms 量级）就会被推到揭幕那一刻，正好撞上交棒。配 `will-change: opacity` 让它在幕布后面就以合成层身份把这次栅格化做掉——这跟「工作台在幕布后面照常渲染」是同一条道理。
- **开场必须自己回收 `.companion-intro-layer` 的 `will-change`**：这个提示在 effect 顶部无条件设置，原本靠 `introTimeline` 的 `onComplete` 回收，但走开场这条路时 `introTimeline` 从不播放（形体的显现由开场接管），回收永远不发生，一个满屏大小的合成层提示会一直挂着（已踩过一次）。开场新增的动画层同理，一律在 `settleOpening` 里统一清理。
- CSS `filter: url(#...)` 的 SVG 滤镜要显式写 `x/y/width/height`。默认滤镜区域是 `-10% -10% 120% 120%`，比 bbox 多 44% 的像素；亮度→alpha 这类不做扩散的滤镜裁到 bbox 完全等价，是白拿的。
- **开场不许直接写 `.companion-shared-figure` 的 opacity**：路由过渡那条 effect 在挂载时就 `gsap.set(companionFigure, { autoAlpha: 1 })`，会把开场设的值冲掉（已踩过一次）。伴生体的首次显现只走 `.companion-intro-layer` 这一条通道。
- 核心特写与火花的落位必须在**开演前**测量，不能在挂载时算：实测挂载那一刻拿到过 `0×489` 的退化盒子（面板宽度尚未定），会落到左上角。量不到有效画面宽度（`< 80px`）时退回百分比定位；开场期间 `resize` 要重新测量落位（6.4s 足够长，拖窗和转屏都碰得上）。点火本身不再依赖这次测量——它是贴图驱动的阈值，与版式无关。
- 开场必须扛得住页面被切到后台：rAF 一被节流 GSAP 就停在幕布还盖着的那一帧，切回来是一整屏黑。`visibilitychange` 里直接把编排走完，且 `progress(1, false)` 的第二个参数必须显式传 `false`——默认的 `suppressEvents: true` 会吞掉交棒回调，界面会永远停在入场 `.from` 的起始值上，全是不可见的。
- 能力节点的显现在有开场时归开场的「待命」那一拍（`.app-frame.is-opening` 把节点抬到幕布之上），入场时间轴此时不许再碰它们；`?intro=0` 和降低动效偏好下仍归入场时间轴。两条时间轴写同一批元素的 opacity，会在揭幕时先藏起来再放一遍。
- 圆角走 5 级令牌 `--r-xs`(8) / `--r-sm`(12) / `--r-md`(16) / `--r-lg`(20) / `--r-xl`(24)，4px 一档。原先有 18 种像素值在做 5 件事，相邻组件差 1px 的圆角只会被读成"没对齐"。三类例外保持原值：胶囊 `999px`、3px 细条上的 `2px`、以及形状本身是设计语言的（血滴形 `48% 52% 46% 54%`、`38px` 大圆）。
- 描边走 4 个令牌：`--line`／`--line-strong`（中性发丝线，与阴影共用 `--shade` 色相）、`--glass-line`／`--glass-line-soft`（玻璃白边）。语义色描边（青柠能力、青色执行、红色警示）继续手写。
- 隐藏滚动条的阅读列必须自己交代边界：`.task-thread` 上下各一段 `mask-image` 渐隐，内容溶进容器边缘而不是被硬切。**底部有 `position: sticky` 元素的容器只能做顶部渐隐**——`.settings-content` 的保存条就在底部，加底部渐隐会把它一起吃掉。遮罩必须是静态的，绝不参与补间（渐变遮罩无法插值，一补间就跳）。
- **首页入场时间轴必须 `paused` 创建、等两帧 rAF 再 `play(0)`**。首帧要把输入条 28px、导航玻璃 22px 等好几层 backdrop-filter 第一次栅格化，实测这一帧 40-43ms（120Hz 下等于丢 4 帧）。入场若和这次重绘撞在一起，动画最快的那 40ms 正好卡在里面，读起来就是输入框"抖一下"。等两帧后实测：动画开始之后 >24ms 的帧为 0。注意这跟"骨架不等图片解码"是两回事——这里等的是一帧合成，不是 752KB 位图解码。
- 颗粒层不要用 `mix-blend-mode`。混合模式会把整页拉进一个混合组重新合成，而首屏本来就有好几层 backdrop-filter 在排队。噪点自带 alpha（`feColorMatrix` 把湍流的红通道映射成透明度）即可，实测有无颗粒层对首屏帧率无差异。
- 材质只走令牌，不再手写：高度用 `--e1`／`--e2`／`--e3`（浅色面）、`--e-dark`（深色面）、`--e-accent`／`--e-accent-hover`（蓝色主按钮），边缘高光用 `--edge`／`--edge-strong`。每一档都是"接触阴影 + 环境阴影"两层，共用 `--shade` 一个色相。原先 100 多条 box-shadow 各写各的色相和衰减（同一屏里并排出现 `rgba(54,65,69,.035)`、`rgba(45,59,62,.035)`、`rgba(72,103,56,.075)` 这种彼此差一点的值），眼睛读到的是杂音而不是层级。新组件一律从这套里选；只有语义光（青柠能力光、青色执行光）才继续手写发光阴影。
- 文字色只有五档：`--ink`（正文/标题）、`--ink-muted`（次级正文）、`--ink-soft`（≥11px 或未声明字号的次级标签）、`--ink-faint`（8-10px 元信息）、`--leaf-text`（承载文字的青柠）。改动前有 20 个几乎一样的灰和 7 个几乎一样的绿在做同样几件事。新增文字一律从这五档里选，不要再手写第六个灰。
- **通透感优先于对比度，这是已确认的取舍，不要"顺手修复"**：`--ink-faint` 实测约 2.6:1、`--leaf-text` 约 3.1:1，都低于 WCAG AA 的 4.5:1。曾经把它们压到 4.7:1 试过，视觉稿那种轻透的层次会明显变实，用户明确选择了保留通透。如果哪天这套语言要落到正式产品页面并过无障碍验收，正确做法是另立一套字色令牌覆盖这两档，而不是就地改深——改深等于换掉视觉稿的调性。
- 焦点环统一 `--focus`（就是品牌蓝 `--blue`）。原先四个组件用了四种焦点色：青柠内描边、两种偏紫的蓝、一种青色，键盘走一圈像换了四个产品。左栏导航因为在窄轨里，用 `outline-offset: -6px` 画在内侧，颜色仍是同一个。
- 细颗粒层固定在 `.prototype-stage::after`：3.6% 的静态噪点 + `mix-blend-mode: overlay`，用来打散大面积柔和渐变在真实屏幕上的色带，顺带给玻璃一点胶片质感。它必须保持 `position: fixed` + `pointer-events: none` + 不参与任何动画（只合成一次）；不要再加第二层噪点，也不要把它挂到会滚动的容器上。
- 交互态改 box-shadow 的组件必须自己声明 `transition: box-shadow`。阴影硬跳会让玻璃看起来是贴图而不是实体。
- 首页首次进入时左栏菜单走慢拍：品牌与四个导航项逐个接通、约 `0.9s` 才全部落定，导航高亮玻璃块最后显影，不要为了"更快"把它压回 `0.3s` 以内——这是明确的观感取舍，不是遗漏。高亮玻璃块的 opacity 归 CSS keyframes（`nav-glass-reveal`，延迟 `.42s` 后 `.72s` 显影），transform 仍归 `move` 的 GSAP 通道；两者不能互换，`move` 带 `overwrite: true`，opacity 交给 GSAP 会在入场期间被一次导航点击整条清掉。用 keyframes 而不是 CSS 过渡，是因为 `is-entrance-ready` 在 layout effect 里同步添加，首帧之前的 class 切换不保证触发过渡。
- 首页入场分成两条互不等待的时间轴：界面骨架（品牌、导航、标题、输入区、能力区、节点）立即播放，伴生体的 `.companion-intro-layer` 单独一条并且只有它等待 `ai-companion.png` 解码。不要把骨架挂回解码回调，否则 752KB 位图会成为可交互时间的前置依赖，导航项和输入条要到解码完成 + 1.4s 之后才落定。
- 任务内容（`.task-thread-head`、`.user-brief`、`.execution-step`、`.answer-card`、来源栏、任务记录）的隐藏态必须写在路由时间轴的初始 `gsap.set` 里，时间轴内部只用 `to` 推进。不要用 `fromTo` + `immediateRender: false` 承担首次隐藏：时间轴指针跨过起点前这些元素以残留值可见，跨过时被瞬间打回 0，看起来就是内容闪一下。`reduceMotion` 分支的 `play`/`reverse` 要同步维护这批初始值。
- `.task-view` 容器的 `autoAlpha` 只做短促的可见性交接，必须在内容开始进场（`beats.structure`）之前结束。父子两层 opacity 同时补间会相乘，产生忽明忽暗的起伏。
- 任务就绪的确认信号用形变而不是明暗：`.task-live` 走一次 `back.out` 的 scale 弹入，不要用 `repeat: 1, yoyo: true` 的 opacity 脉冲——它嵌在同样在做淡入的 `.task-thread-head` 里，叠加后就是第二次闪烁。
- 首页正文（标题、能力区）不再用绝对定位的固定 `top`。`.home-view` 是一列 flex，输入条的落位与占高由 `.workspace` 上的 `--composer-bottom` / `--composer-min-h` / `--composer-reserve` 定义一次，`.home-view` 的 `padding-bottom` 据此预留。任何时候都不要让正文和输入条各自从相反的边硬编码像素——容器一变矮就会重叠，而设计稿的 1058px 高度在真实笔记本屏上几乎从不成立。
- 任务态输入条的两侧缩进按内容驱动：`left`/`right` 用 `clamp(64px, (100% - 792px) / 2, 286px)`，优先保证工具栏 792px 的单行宽度（实测单行需要 771px），空间够时回到设计稿的缩进。不要写死 `left: 286px; right: 282px`——那在最大尺寸下只剩 3px 余量，任何字号或文案微调都会让按钮换行。
- 工具栏永远不允许把按钮压成竖排单字：`.tool-group` / `.mode-group` / `.start-button` 都是 `flex: none`，按钮 `white-space: nowrap`，`.composer-toolbar` 用 `flex-wrap: wrap` + `min-height` 兜底。宽度不够时的正确降级顺序是「收缩两侧缩进 → 按钮转纯图标（≤1080px）→ 整行折行」，绝不是逐字断行。
- 输入条的高度必须保持稳定（桌面 185px / 移动 186px），因为首页的空间预留是按它算的。工具栏一旦换行把输入条撑到 241px，就会反过来压住上方的能力区——这是 `@media (max-width: 1080px)` 把工具按钮降级成纯图标的原因，不是纯粹的视觉取舍。
- 任务页的阅读列必须能挡住伴生体。四个容器（`.task-history` / `.source-rail` / `.answer-card` / `.execution-trace`）以及 `.user-brief`、`.task-live` 在浅色态下走接近实色的背景；伴生体只在卡片之间的缝隙和卡片之外继续在场。注意浅色态关掉了 `backdrop-filter`，半透明背景没有任何柔化，人形轮廓会直接压在正文上。
- 伴生体在任务态由 `.companion-wrap::after` 的横向渐变收掉阅读列一侧，避免被卡片切成断续的条。这层走 `opacity` 过渡而不是 `mask-image`——`mask-image` 的渐变无法插值，class 一切换就会跳。
- 入场目标的隐藏态必须由 CSS 兜底（`.app-frame:not(.is-entrance-ready)`），GSAP 就位后再加 `is-entrance-ready` 放行。只靠 `.from()` 的话，DOM 解析完到 GSAP 初始化之间元素是完全可见的，随后被瞬间打回 0——实测这段真空有数百毫秒，读起来就是"闪一下、卡一下才出现"。这条对首页和任何后续新增的入场元素都适用。
- 任务页阅读时输入条会渐进让开：收起量是随滚动距离连续累加的 `--dock-collapse`（注册为 `@property <number>` 才能被浏览器插值），不是到阈值才整块跳。读到底、指针进入工作区底部区域、或焦点进入输入条都会把它交还。
- 输入条的收起走 `translate` / `scale` 独立属性而不是 `transform`——`transform` 归 Flip 所有。GSAP 接管 transform 时会写内联 `translate: none; scale: none`，所以这两条必须带 `!important` 才能保住通道。焦点态用 `.composer-dock:focus-within` 的 `!important` 覆盖内联收起量，不要靠 `focusin` 事件。
- 离开任务页时必须瞬时（禁用 transition 后）把 `--dock-collapse` 归零，否则收起的偏移会混进路由 Flip 的几何计算。
- 文件页采用已选中的「记忆舱」设计，视觉源固定为 `design-reference/file-memory-chamber-v1.png`。保留现有宽侧栏、品牌、共享伴生体和持久输入条，只还原其四条空间资料轨道、右侧预览、会话附件与上传入口，不另建第二套壳。
- 首页、任务页、文件页共享同一个工作区与伴生体。首页和工作区仍由原可逆主时间轴交接；任务/文件只在工作区内部用短促的 transform + opacity 交叉过渡，导航玻璃块独立滑到真实按钮几何，不能用 display 切换制造闪帧。
- 三个页面的路由动效分两层管理：主时间轴只负责首页/工作区的共享几何，人物的任务形态与文件记忆形态由独立语义时间轴互斥切换。文件态使用 `public/assets/companion-memory-map-v1.webp` 作为透明记忆网络叠层，始终复用同一个 `.companion-shared-figure`，不得增加第二个人物或把文件内容移动到人物体内。
- 任务 ↔ 文件的人物切换必须有清晰的“旧形态收回核心 → 核心脉冲确认 → 新形态从核心与头部展开”三拍语义，不能退化为两张能量纹理的普通透明度交叉淡化。该三拍总时长约 `560ms`；切换期间人物可短暂前置并由独立 `.companion-semantic-layer` 向内容侧靠近，结束后必须回到原层级与几何。共享身体和主路由几何仍保持不动。
- 首页导航的任务/文件入口都有轻量 hover 与键盘 focus 预演；预演时间轴自己拥有透明度，点击提交只能回卷该时间轴，不能用 `overwrite` 直接杀掉其子 tween，否则第二次悬停将失效。`prefers-reduced-motion: reduce` 下只保留瞬时语义态，不显示预演。
- 文件页内部反馈遵循边界：搜索只改变记忆网络的专注/无结果状态，文件点按只触发核心轻触，外部文件拖入才让人物进入接收态；资料库内部拖到会话输入条不改变人物形态。所有反馈必须有限、可中断并在结束后归零。
- 文件点按是一次有限的物理反馈：芯片先下压形变，局部环形涟漪扩散，单个信号点沿轨道飞向预览，预览内容在低透明度换页后落定，同时伴生体核心轻触回应。禁止增加持续循环粒子、全屏扫光或会抢夺 `transform` 所有权的第二套动画。
- 文件选中态不能只换边框：它是设计图里的常驻悬浮层，静止时上浮约 6px、左倾约 2.8°、厚度约 1.02 倍，并带克制的青绿折射光和软阴影；鼠标进入时只增加约 4–5° 的轻透视跟随，离开后必须回到这组悬浮几何而不是回到平面。GSAP 复位使用 `scaleX` / `scaleY`，不要对该交互重新使用 `scale`，否则会触发 `scale not eligible for reset`。
- 私有资料库上传与当前会话附件是两个明确边界：上传按钮和拖放进入私有资料库并显示索引进度；会话附件只服务当前对话，不得自动写入资料库。文件搜索、选择、引用到当前对话以及上传入口必须可用。
- 输入条有两种形态，不要混同：首页是主体输入区（约 185px，17px 字号，94px 输入行），任务页与文件页是对话里的紧凑条（约 122px，14px 字号，48px 单行起步，控件收到 32px），后者对齐 Claude / Codex 的对话框密度。紧凑规格挂在 `.composer-dock.is-task-compose` 上，`.task-workspace` / `.files-workspace` 的底部 inset 按它的实际占位预留，省下的高度全部还给正文。
- 工具控件的高度、内边距、字号走 `--tool-h` / `--tool-pad` / `--tool-font` 变量，模式组与主按钮走 `--mode-w` / `--start-w`。**自定义属性的层叠同样吃特异性**：`.composer-dock.is-task-compose` 上的变量声明（0,2,0）会盖过媒体查询里 `.composer-dock`（0,1,0）的声明，所以断点里要图标化必须写成同级或更高特异性的选择器，或者直接改 `.tool-control` 的属性本身——后者与基础规则同级且在后面，最省心。这个坑踩过两次，改窄屏样式前先确认特异性。
- 资料库的文件卡可以直接拖进输入条。内部拖拽用自定义 MIME `application/x-yuanshu-library-file` 承载 `{id, name, kind, size, location}`，与外部文件拖入（`dataTransfer.types` 含 `"Files"`）严格区分：前者是**引用**已索引的资料，落进会话时自动打开知识库检索，chip 上显示来源位置；后者是本次会话的临时附件，显示文件大小，且按既有约定不进入资料库。文件页根节点的"松开上传"遮罩必须先判断 `types` 含 `"Files"`，否则内部拖拽也会误亮。
- 输入条的落点反馈用 `.composer-dock.is-library-target`：强制 `--dock-collapse: 0` 先把收起的输入条交还，边缘转能力色，内缘一道呼吸的柔光圈出落点；拖拽源卡片降到 `opacity: .42` 并转虚线边框，留在原位当占位。
- 附件超出 `MAX_ATTACHMENTS` 时必须给出可见提示，不要静默丢弃。判断要用当前渲染的 `attachments` 值——`setState` 的 updater 是延迟执行的，在里面置标志位、函数末尾立刻读，读到的还是旧值。
- 任务／文件面板切换里，`.file-reveal-item` 的隐藏态同样必须写在时间轴开头的 `set` 里，面板容器的 `autoAlpha` 只做短促交接（位移单独走长曲线），子内容之后再进场。用 `fromTo` + `immediateRender: false` 承担首次隐藏，指针跨过起点前内容会以残留值显示、跨过时瞬间归零——这就是切到文件页时闪的那几下。这条和首页入场、任务内容进场是同一个规则，新增任何分组进场都照此办理。
- `.memory-orbit` 用胶囊圆角（`999px`）而不是椭圆（`50% / 48%`）。椭圆在两端收得太快，而里面的资料卡是矩形，最右侧那张的上下角会戳出轮廓（实测超出约 92px）。
- 模式滑块（`.mode-glass` / `.mode-caustic`）在紧凑态不要写死 `height`，用 `top: 4px; bottom: 4px; height: auto` 跟随模式组的实际高度，否则上下留白不对称。
- 图标从 `@phosphor-icons/react` 按需子路径导入（`@phosphor-icons/react/dist/icons/<Name>`），不要整包 `import { A, B } from "@phosphor-icons/react"`。整包在 dev 下要么裂成约 4600 个模块请求，要么被 `optimizeDeps` 预打包成 6MB 单块——两种都会把 `domContentLoaded` 拖到 800ms 上下。按需导入后实测 38ms。
- 伴生体与两张能量／记忆贴图一律用 WebP（`ai-companion.webp` 43KB、`companion-task-energy-map-v1.webp` 109KB、`companion-memory-map-v1.webp` 112KB）。对应的 PNG 原图合计 2.4MB，只作为源文件保留，不要在代码里引用。CSS `mask` 和 `background` 都能正常使用 WebP。
- 文件页的输入条不是任务页那条换个位置，它要体现"针对选中资料提问"的语境：输入框上方一条 `.composer-context` 说明这次基于哪几份资料（可逐个移除），输入框为空时给三个快捷提问（总结要点／提取待办／找风险），一开始打字就收起；工具栏去掉"附件"（这一页本身全是资料），"资料库"按钮改为显示已选份数。资料从拖拽或详情面板的"用于当前对话"进入，两条路径都走 `attachLibraryFile`。
- 资料库来源的引用（`source: "library"`）在文件页从临时附件托盘里分出来，进 `.composer-context`；两者语义不同——引用指向已索引的资料，临时附件只存在于本次会话。任务页与首页不受影响，仍旧走托盘。
- `.task-workspace` / `.files-workspace` 的底部预留不要写死。输入条会因上下文条和快捷提问变高（实测 122 / 173 / 207 三档），用 `ResizeObserver` 把它的实际高度写进 `.workspace` 上的 `--composer-actual-h`，工作区 `inset` 用 `calc(var(--composer-actual-h, …) + 落位 + 间隙)`，正文与输入条之间才能保持恒定间距。
- 顶栏只允许有一个标题：全局的 `.workspace-brand`（元枢／企业通用智能体），三个页面完全一致。页面名由左栏导航的高亮承担，不要在顶栏再放一个页面级大标题——文件页原先的「文件 / 我的资料库」是 30px，比品牌的 25px 还大，两块并排会互相抢。任务页的页面标题在工作区内部（`.task-thread-head`），文件页同理不需要顶栏标题。
- `.files-head` 是纯工具条：搜索框（`flex: 0 1 420px`）、隐私标签（`margin-left: auto`）、上传按钮。它的垂直中心对齐品牌块的「元枢」那一行；窄屏下隐私标签隐藏，搜索框自适应宽度。
- 动效有明确的语气分层，写在 `App.jsx` 顶部的 `EASE` 常量里，新增动画从里面选，不要再随手写 `power3.out`：`reveal`（`expo.out`，显现——前 20% 时间走完 80% 距离，同样时长下感知更快、尾部更从容）、`glide`（`power4.out`，位移滑行）、`exit`（`power2.in`，退场要干脆）、`swap`（`power2.inOut`，双向交接）、`settle`（`back.out(1.6)`，落定确认）。例外：`gsap.quickTo` 的指针跟随与滑块拖拽保持 `power3.out`——跟随类需要的是平滑而不是锐利。
- 群组进场要有编排，不要一律线性 stagger：能力卡用 `{ from: "center" }` 从中间向两侧展开，伴生体节点用 `{ from: "random" }` 像逐个接通，阅读序内容（任务正文、资料行）保持 `from: "start"`。
- 页面切换要有纵深，不是平面互换：离场层 `scale` 退到 .988（首页）／.995（面板互换），进场层从 .994／.995 推进到 1。工作区的纵深起点写在初始 `gsap.set` 里，和隐藏态预置同一套规则；`taskView` 的 `scale` 通道归路由时间轴所有。
- 容器与其子元素不要同时淡入——两层 opacity 会相乘，读起来发闷。`.capability-area` 只做位移，opacity 交给 `.section-label` 和卡片各自承担；入场兜底隐藏（`.app-frame:not(.is-entrance-ready)`）要同时覆盖容器和卡片。
- 设置页采用已确认的 `Quiet Preferences` 方向，视觉源固定为 `design-reference/settings-quiet-preferences-v1.png`：连续浅色表面、细分隔线、左侧紧凑分类、右侧共享伴生体守护态，以及「行为／权限／隐私」三处语义锚点。设置页不显示持久输入条，不得改成后台式大卡片或另起一套壳；任务、文件、设置三页仍复用同一工作区和同一个 `.companion-shared-figure`。
- 设置页偏好控件必须具备真实交互和保存状态反馈；默认知识库与联网搜索保持关闭，用户显式修改后才进入未保存态。人物进入设置页时收起任务／记忆语义纹理，只保留共享身体与一次有限的核心交接脉冲。
- 设置页不自造控件语汇，一律复用其他页面已有的那一套：三段选择器用输入条 `.mode-glass` 的滑动玻璃（等宽三段，只补间 x，标签不动），段落标题用首页的 `.section-label`（15px + 青柠点），分类高亮用与左栏 `.nav-glass` 同材质的滑动玻璃块，主按钮对齐 `.start-button` 的纯色 `var(--blue)`、`0 6px 8px` 阴影与真实 hover。
- 颜色语义在整个应用里是分工的：**蓝色代表"选择／模式／主操作"**（输入条的自动/快速/深度、开始执行、设置页三个分段选择器），**青柠代表"能力与状态"**（伴生体节点、能力卡、知识库/联网开关的开启态）。设计稿里设置页分段选中态画成青柠，实现上按全局语义改蓝——同一个控件在两个页面不该有两种含义。
- 设置页左栏分类是正文锚点，不是纯高亮：点击平滑滚到对应段落（`prefers-reduced-motion` 下瞬时），滚动时用 IntersectionObserver 反向回读当前段落，程序化滚动期间要短暂锁住回读（约 720ms），否则途经段落会把高亮拽回去。五个分类必须各自有对应段落，不允许出现点了不动的死分类。
- 设置页正文列可滚动，保存/恢复默认改为 `position: sticky; bottom: 0` 的操作条，背景要在 18% 处就转为实色 `#fbfcfb` 并带一条上缘发丝线——半透明会让底下的行透上来，读起来像浮着的两个按钮。
- 设置页的伴生体锚点必须落在正文列右缘之外（1512 宽下正文列右缘 1020，锚点从 1130 起）。`.settings-workspace` 的第三列不是留白而是伴生体的地盘，任何断点都要保留：设置页正文是连续浅色表面、没有卡片背景，浅色态又关掉了 `backdrop-filter`，正文一旦铺到人物身上，人形轮廓会毫无柔化地透上来。这与任务页「阅读列必须能挡住伴生体」是同一条规则的两种实现。
- 改一条偏好，对应语义锚点（行为／权限／隐私）回应一次有限脉冲；进入设置页时三个锚点按 `{ from: "random" }` 逐个接通；保存成功用一次 `back.out` 的 scale 落定确认，不用明暗闪烁。锚点脉冲写在 `App.jsx` 的 `settingsPulseRef`（`contextSafe` 包装），由 `SettingsWorkspace` 通过 `onAnchorPulse` 触发——节点归 App 所有，设置页不直接操作它。
- `.workspace` 用 `overflow: clip` 而不是 `hidden`。伴生体向右溢出约 178px，`hidden` 仍然是可滚动容器：浏览器为某个控件做 `scrollIntoView`（键盘聚焦、触控板横向惯性）时会把整个工作区推走 178px 且不会自己回来，整页看起来就是突然左移。`clip` 不建立滚动容器，裁切效果完全一样。
- 动效语气分层常量 `EASE` 已从 `App.jsx` 移到 `pageMotion.js`，三个工作台共用；新增动画一律从里面选。
- 按压反馈走事件委托，挂在 `.app-frame` 上按选择器匹配（工具按钮、模式按钮、导航、能力卡、快捷提问、上下文 chip 的移除键、任务记录条、来源卡、继续展开）：压下 `scale .955 / power2.out`，抬起 `scale 1 / back.out(1.6)`。新增控件只要命中选择器就自动获得同一手感，不要逐个绑 handler。设置页的分类项、分段选择器按钮、开关、保存与恢复默认同样走委托，不要在组件里再写一套 `pointerdown/pointerup`（曾经写成 `scale .97 / back.out(2)`，和全局的 `scale .955 / EASE.settle` 手感明显不同）。已经自带按压管线的 `.memory-file`、`.start-button`、`.files-upload-button` 不在委托范围内，避免两套动画抢同一元素；`.settings-link` 也不在范围内——648px 宽的整行做 .955 缩放位移太大，它的反馈是背景与箭头。
- **交给 GSAP 的通道，CSS 就不要再挂同名 `transition`**。transform 如此，opacity 同样如此——`.side-rail nav button` 原先挂着 `transition: opacity .25s`，入场时间轴每帧写 opacity、CSS 又把它渐变一遍，导航项读起来是慢慢浮出而不是按曲线落定。两者会抢：GSAP 每帧写 transform，CSS 又要把它渐变过去，按压手感会明显发软。`.side-rail nav button`、`.capability-list button`、`.mode-group button`、`.task-history-list button`、`.source-list button`、`.composer-suggestions button` 的 transition 已只保留 color / background / border-color。
- 回答正文（`.answer-reveal-piece`）由 ScrollTrigger 按滚动逐条点亮，滚动容器是 `.task-thread` 而不是窗口，必须显式传 `scroller`。触发线用 `start: "top bottom"`（进入容器可视区即点亮）——收得更紧会让首屏那条差几像素不触发，用户不滚动就只看到一张空的回答卡。触发器要等转场落定后再建（延迟 .62s）：此刻 `.task-view` 还是 `visibility: hidden`，`getBoundingClientRect` 全是 0，这时候建出来的位置是错的。
- 因此 `.answer-card` 不参与任务内容的整块淡入，只做位移；它的段落 opacity 归 ScrollTrigger 所有。容器和内容都淡入会两层相乘。
- 点击资料卡只讲一件事：这张被拿起来、详情跟着换。选中态是 `y: -4`、`rotation` 取卡片自身 rest 倾斜的 35%、`scale 1.012`——不要把它硬转到某个固定角度（原先是 -2.8°），在这么小的卡片上那读起来是"歪了"而不是"被选中"。三处定义（初始化、`fileRestState`、`selectFile`）共用 `fileSelectedState`，不要各写一份。
- `.file-selection-signal` 那颗飞行光点只用于上传（资料存进资料库，信号飞向伴生体的语义成立），**不要用在选中文件上**：它是浅色背景上的亮白块，会盖住相邻卡片，看着像渲染残留。选中的反馈由卡片自身和详情面板的交叉淡入承担。
- 一次交互不要同时铺开六组动画。原先点击资料卡会一起触发卡片旋转、涟漪扩散 3.15 倍、面板暗到 .58 再亮、飞行光点、整行挤压、伴生体核心脉冲——视线被扯散反而显得廉价。现在只保留：卡片抬起、克制的涟漪（2.2 倍）、面板轻交叉淡入（压到 .74）、伴生体核心轻脉冲。
- 资料卡的涟漪从**真正被点到的位置**化开，不是固定原点：`selectFile` 接收原始事件，按 `clientX/clientY` 减去卡片边界得到落点，用 `left`/`top` 加 `xPercent: -50, yPercent: -50` 定位，再扩散到能盖住离该点最远那个角的半径（`Math.hypot` 取四角最大值）。点中间和点边角的扩散幅度本来就该不同，这是它显得自然的原因。键盘触发（Enter/Space）没有坐标，落回卡片中心。
- 涟漪用柔和的径向渐变，不要描边圆环——放大近 20 倍时边框会被一起缩放成粗线。裁切由 `.memory-file > .memory-ripple-clip`（`inset: 0` + `overflow: hidden` + `border-radius: inherit`）承担，**不要给 `.memory-file` 自己加 `overflow: hidden`**：它的 `::before` 是向外扩 11px 的柔光（选中／hover 时亮到 .68），会被一起裁掉。裁切层的选择器必须带父级（`.memory-file > .memory-ripple-clip`），否则同文件里 `.memory-file > span` 的特异性更高，会把 `position: absolute` 盖掉、让裁切层退化成 grid item。

### 动效性能（都是实测踩出来的，别再犯一遍）

- **高频改写的自定义属性必须落在叶子节点上。** 自定义属性默认继承，写在 `.workspace` 这种上层节点上，等于每写一次就把它下面 800 多个后代整棵打脏。指针光斑因此从 `.workspace::before` 改成真实元素 `.workspace-glow`（伪元素只能从宿主继承，不换成元素就没法把属性下放）；`--composer-actual-h` 因此写在 `.task-view` 而不是 `.workspace`。只被自己读的（`--dock-pointer`）一律用 `@property { inherits: false }` 注册。**新增任何跟随指针/滚动/尺寸的 CSS 变量之前，先问它要被谁读，然后写在能覆盖这些读者的最小那个节点上。**
- **常驻动画只许动 transform 和 opacity。** 补间 `box-shadow` 就是每帧一次重绘：执行步骤的心跳原先这么写，一条执行链路的绘制从 254 次涨到 1277 次。要发光环就做一层静态阴影的 `::after`，动它的 `opacity` 和 `scale`。
- **藏起来的层要显式停掉动画。** `visibility: hidden` 只是不绘制，关键帧照样每帧驱动样式重算。离开首页/设置页时，用 `.workspace.is-task-view` / `.is-settings-view` 给对应的常驻动画加 `animation-play-state: paused`。
- **`animation` 简写会重置 `animation-play-state`。** 一条特异性更高的规则用简写写了 `animation:`，就会把别处设的 `paused` 冲掉。`.settings-anchors` 同时带 `.companion-nodes` 类，被首页节点那条规则连坐过一次——共用类名时记得给通用规则加 `:not()`。
- **`will-change` 不写进常驻样式。** GSAP 补间期间浏览器自己会提升、补间结束会释放，这正是它该有的生命周期。写死在 CSS 里的 `will-change` / `backface-visibility` 会把满屏大小的层长期钉在合成器上（撤掉四处之后任务页从 37 层／360MB 降到 28 层／287MB）。同理，起始值别用 `translate3d`——它会让元素在动画结束后仍被 `Trivial3DTransform` 提升。
- **绝对定位的开场层要么 `fixed`、要么保证祖先是定位元素。** `.prototype-stage` 是 `static`，它的 `overflow: hidden` 关不住 `position: absolute` 的子节点：`.intro-glow`（132vmax）就这么把文档撑成 2582×2132，根滚动层因此要分配两块 84MB 纹理，外壳还多了横竖滚动条。开场层用完必须 `display: none`，只归零 `autoAlpha` 是不够的。
- **不要在转场进行中调 `ScrollTrigger.refresh()`。** 它是全局重测，而 `ScrollTrigger.batch` 创建时本来就会自己量一次。
- **改完动效要用数据验收，不要只看录屏。** 手法固定：Playwright 起浏览器 → `Emulation.setCPUThrottlingRate`（1x 看真机、4x 代表中端机）→ rAF 记帧长 + `Tracing` 抓 `UpdateLayoutTree` / `Layout` / `Paint` / `RasterTask` → `LayerTree` 看合成层和纹理占用 → `disabled-by-default-devtools.timeline.invalidationTracking` 定位是谁把样式打脏的。验收线：1x 下全部环节无 >50ms 的帧；`UpdateLayoutTree` 单次重算元素数不该接近文档总元素数（那说明有人在改高层节点的类或继承属性）。

### 动效语汇（第一批落地后定下的）

- **五种能量语态是唯一的分类**：蓄（末梢→核心，用户在输入）、放（核心→落点，系统开始干）、导（沿脉络推进，正在干）、结（落点收束，交付了）、停摆（唯一的反向语态，只给停止执行和恢复默认）。新增动效必须能说出自己属于哪一种，说不出来的就是装饰，不做。完整清单见 `MOTION_SHOWCASE_PLAN.md`。
- **`fromTo` 放在时间轴的非零位置时，必须显式写 `immediateRender: false`**。默认的 true 会在时间轴构建那一刻就把起始值写上去——工具开关的落点绽放因此提前 .36s 亮在落点等着信号点飞过来（已踩过一次）。收拢环、轨道填充、脉络回声同理。
- **"退场后再换内容"用 `onComplete` 提交 state，不要靠 setTimeout 估时间**。切换任务记录、移除附件 chip 都是这个模式：先播退场，`onComplete` 里才 `setState`，React 一渲染新内容就接着播入场。
- **入场半程要有闸门标记**（如 `taskSwitchRef`），只在对应的用户动作触发时播。换任务和新建任务都会改 `activeTaskId`，但新建走的是路由转场，两条链路会在同一批元素上写 x／autoAlpha。
- **脉络回声层 `.companion-echo` 与开场点火层同构但生命周期不同**：开场每个会话只播一次，回声每次提交都要放，所以它常驻挂载、静息时 `visibility: hidden`。`#ignite-luma-alpha` 滤镜因此也必须留在 `opening` 分支之外，两张脉络贴图要在 `requestIdleCallback` 里预热，否则第二次进入会话的第一次提交会撞上解码。
- **叠在伴生体上的效果要按"两层相乘之后"的不透明度调**。任务页的伴生体被路由转场压到 opacity .5，回声写 .62 实际只剩 .31，在浅色工作台上读不出来——峰值定在 .95 才够。
- **一次交互只讲一件事这条规则说的是"同时"，不是"总共"**。提交那条时间轴有 6 层参与，但任一时刻在动的不超过 3 层（信号 → 核心+冲击环 → 回声），这是允许的；6 层一起起跳才是不允许的。

### 素材与叠层（第二批落地后定下的）

- **生图一律要"纯黑底 + 自发光"的 PNG**，抠图交给脚本，不要让模型直出透明通道。与人物对位的必须拿 `design-reference/source/ai-companion.png` 当参考图，画布 1252×1898。验收看四件事：四角亮度为 0、发光像素落在人物轮廓内 ≥90%、峰值亮度符合语义（停摆态要 <60%）、色相方向对（停摆蓝>绿）。
- **人物叠层用 RGB + 运行时 `#ignite-luma-alpha` 滤镜，UI 小件才烘 alpha**（`scripts/bake-luma-alpha.py`）。烘 alpha 要去预乘，而去预乘会把近透明处的编码噪点放大成彩色麻点，压缩不动——停摆图烘完 499KB，RGB 直存只要 115KB。
- **`visibility: hidden` 挡不住 Overlap 提升**。静息的满屏叠层要用 `display: none`，由时间轴在两端显式切换（`gsap.set(el, { display: "block" / "none" })`）。`.companion-echo` 用 visibility 时实测仍占着 1800×1632 / 11.2MB 的合成层。
- **要被看见的叠层不能挂在 `.companion-wrap` 里**。伴生体在任务页/文件页是 z-2、压到 opacity .5、整个躲在内容面板后面的：实测头部落点 (1210,183) 被详情面板完全盖住。这类效果要做成工作区级的覆盖层（z-6，面板之上、输入条之下），几何用 JS 按实测的人物画面盒子（`object-fit: contain` 要换算）落位。
- **旋转一张"环在头部"的全画布贴图时，转的是内层不是外层**。环心不在元素中心上，整层 `rotate` 会让它绕着画布中心画大圈。
- **叠在伴生体上的效果要按"两层相乘之后"的不透明度调**：任务页伴生体被压到 opacity .5，叠层写 .62 实际只剩 .31，在浅色工作台上读不出来。

### 复查时踩到的两条（第三轮）

- **一次性闪光不要放进带 `overwrite: "auto"` 的时间轴。** 那条 `fromTo` 初始化时会把同一目标上待执行的补间——包括你专门加在末尾用来收尾的 `set`——一并杀掉。再加上反方向（关闭／退出）往往根本不建这条补间，就没有任何人负责把它收回去，连打之后它会停在起始值上常亮。这类闪光要拆成自管生命周期的独立补间：进来先 `kill` 旧的并归零，播完在 `onComplete` 里显式钉死终态。凡是"非零位置 + `immediateRender: false`"的 `fromTo` 都要按这条自查。
- **判断内存泄漏不要看 `Performance.getMetrics` 的 `Nodes` / `JSEventListeners`。** 它们把等待 Blink Oilpan 回收的节点也算进去，而 `HeapProfiler.collectGarbage` 只作用于 V8 堆、逼不动 Oilpan，于是会呈现"线性上涨且回收不掉"的假象（附件增删这条路径就是，实测 30 轮 +450 节点，其实一个都没漏）。以三件事为准：在档 `document.querySelectorAll("*").length` 是否封顶、堆快照里 `Detached HTMLElement` 是否为 0、施加 `Memory.simulatePressureNotification` 之后监听器是否回落。
