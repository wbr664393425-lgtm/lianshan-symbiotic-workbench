# Design QA

- Source visual: `design-reference/selected-symbiotic-workbench.png`
- Implementation screenshot: `implementation-polished-final.png`
- Premium interaction screenshot: `implementation-premium-interactions.png`
- GSAP optical-motion screenshot: `implementation-gsap-optics.png`
- GSAP homepage running-state screenshot: `implementation-home-gsap-running.png`
- Running-state screenshot: `implementation-polished-running.png`
- Result-state screenshot: `implementation-polished-result.png`
- Mobile screenshot: `implementation-polished-mobile.png`
- Comparison evidence: `design-comparison-polished.png`
- Viewport: 1487 × 1058 CSS pixels
- Source dimensions: 1487 × 1058 pixels
- Implementation dimensions: 1487 × 1058 pixels
- Browser DPR normalization: 0.8 device pixel ratio; screenshot clipped to the same CSS-pixel canvas as the source
- State compared: default idle state; interaction state separately verified through task completion

## Full-view comparison

The source and implementation use the same major composition: a narrow left rail, compact product identity, left-side task promise and capability cards, a translucent synthetic companion on the right, status nodes embedded around the body, and a low floating glass composer. The implementation intentionally replaces the source placeholder brand mark with the approved shared mountain-shield mark.

## Focused-region comparison

- Hero: headline scale, two-line hierarchy, and left offset match the source closely.
- Companion: head, shoulder, chest core, and node placements preserve the source anatomy and visual priority after transparent-margin trimming.
- Composer: width, bottom offset, glass material, controls, mode selector, and primary action match the source's density and hierarchy.
- Navigation: interaction anatomy matches the source while using the product's real brand assets.

## Iteration history

1. Initial implementation placed the companion too far right and left excessive transparent padding around the generated asset.
2. Cropped the asset alpha bounds, enlarged and repositioned the companion, shifted the four status nodes, shortened capability status labels, and moved the composer upward and inward.
3. Removed the added hero kicker and prototype caption because they were not present in the selected visual source.
4. Added pointer-aware attention lighting and restrained companion parallax without React re-renders.
5. Added execution-only body scanning, phase-driven node rings, status waveform, core-state feedback, and a completed-result reveal.
6. Reworked the three capability cards into one segmented control surface, tightened the glass material, added tactile and keyboard states, and corrected small-text and CTA contrast.
7. Fixed the narrow-screen headline boundary and confirmed no horizontal or vertical document overflow at 320 × 812 CSS pixels.
8. Re-captured the idle state and confirmed the final full-view comparison at identical dimensions.
9. Replaced the execution-mode color toggle with one glass block that translates across three equal fixed segments; verified the transform reaches 0px, 78.98px, and 157.97px for automatic, quick, and deep modes.
10. Added velocity-sensitive glass deformation and a moving caustic highlight while dragging, while keeping continuous pointer values out of React state.
11. Replaced the looping CTA sheen with pointer-position lighting and a one-time press wave, added a localized capability-surface spotlight, and gave the navigation a restrained proximity response.
12. Added a single task-start signal that travels from the composer toward the companion core and hands off to the existing execution scan and phase feedback.
13. Separated click selection from drag initiation: clicks now keep the eased glass transition, while direct pointer following begins only after crossing the 4px drag threshold.
14. Delayed pointer capture until the drag threshold is crossed so ordinary mouse clicks retain native button behavior.
15. Replaced the first pointer ring with a system-cursor-preserving GSAP optical field: one fast refractive flare, one velocity-sensitive directional beam, and two delayed echoes using different damping values.
16. Added drag-only intensity and thickness changes, 90ms motion settling, `gsap.matchMedia()` reduced-motion handling, scoped `useGSAP` cleanup, and reusable `quickTo()` tweens for high-frequency pointer updates.
17. Added a one-time 1.48s homepage entrance timeline for the frame, navigation, brand, companion, hero, phase nodes, capability surface, status, and composer.
18. Split the companion into independently damped body, halo, node, and core layers so pointer movement creates depth without React renders or transform conflicts with the breathing animation.
19. Added a GSAP-driven composer refraction layer that tracks local pointer coordinates and gives focus a restrained lift and material stretch.
20. Replaced the task-start CSS flight with a geometry-calculated GSAP timeline linking button compression, composer recoil, signal travel, core pulse, and node response; the launch signal remains visible down to the mobile breakpoint.

## Primary interactions tested

- Entered a task goal.
- Enabled web search.
- Selected deep mode.
- Started execution and observed phase progression.
- Verified the terminal `任务已完成` status and `查看成果` action.
- Expanded the result preview and verified the `继续追问` handoff populates and focuses the task composer.
- Verified pointer movement updates the attention-light and companion-parallax CSS variables without React state updates.
- Verified automatic, quick, and deep mode selection semantics through `aria-pressed`.
- Verified the glass selector keeps labels stationary, moves only with transform, and inherits the reduced-motion fallback.
- Verified real click selection reaches deep mode with the correct `aria-pressed` state.
- Verified task start enters `正在理解目标`, exposes `aria-busy="true"`, and activates the finite `signal-transfer` animation.
- Verified workspace attention light and companion parallax remain outside React renders; the GSAP optical layer uses reusable tweens without continuous React state.
- Verified the GSAP optical anchors move at distinct damping rates, the beam rotates and stretches with pointer velocity, the old CSS ring is absent, and mode selection remains functional.
- Verified the entrance mid-state and settled state, including final cleanup to `transform: none` on the composer.
- Verified companion layers move in opposing directions with distinct response rates and the composer refraction reaches the pointer location.
- Verified the task launch signal is visible at 1092px, travels toward the computed core position, pulses the core, and preserves the execution phase progression.

## Console check

- Browser errors: none.
- Browser warnings: none.
- Impeccable detector findings: none.
- Desktop document overflow: none at 1487 × 1057 CSS pixels.
- Mobile document overflow: none at 320 × 812 CSS pixels.
- Reduced motion: all animations and transitions collapse under `prefers-reduced-motion: reduce`.
- Reduced transparency: glass surfaces receive opaque fallbacks under `prefers-reduced-transparency: reduce`.

## Task workspace and morph transition QA — 2026-08-27

- Task source visual: `design-reference/task-workbench-source.png`
- Final task implementation: `implementation-task-final.png`
- Side-by-side comparison: `design-comparison-task.png`
- Transition references: the approved 9-frame 0–900ms storyboard sheets in the same generated-images session.

### Visual comparison

- Preserved the approved light enterprise glass system after rejecting an intermediate dark interpretation.
- Matched the source anatomy: persistent primary rail, secondary task history, main conversation column, vertical execution trace, answer body, right reference panel, bottom follow-up composer, and right-edge translucent task-form companion.
- Kept the homepage brand, system icons, lime execution accent and blue primary action consistent instead of creating a second visual system.
- Retained the generated focused pose and four bridge images as design exploration assets only; the live experience intentionally uses the approved homepage companion as one persistent visual subject.

### Motion and performance comparison

- Implemented one reversible 1.16s GSAP timeline matching the approved sequence: navigation response, persistent companion migration, energy sweep, task content lock, and execution-line activation.
- Removed all generated body keyframes from the live DOM. Exactly one `.companion-shared-figure` remains visible in home, mid-transition, task, reverse, and rapid-interruption states.
- Kept home and task layers mounted so a rapid reverse can continue from the current timeline position instead of flashing or remounting.
- Replaced composer `left/right` interpolation with GSAP Flip transform animation.
- Removed large-image blur interpolation and task-panel backdrop blur during the transition; limited animated properties to transform and opacity on composited layers.
- Delayed task-layer visibility until the energy-migration beat and staged task content from 490ms, preventing a blank handoff while keeping the companion readable above the emerging layout.

### Interaction and runtime checks

- Home → task, task → home, and task → partial reverse → task all completed without visual state loss.
- The persistent glass navigation block slides to the task item and reverses to home; active icons and `aria-current` remain correct.
- The persistent composer retains attachment, knowledge-base, web-search, mode-click, mode-drag and primary-button interactions in both layouts.
- Browser console after normal and interrupted transitions: no warnings and no errors, including no GSAP reset warnings.
- `npm run build`: passed; Sites client/server/hosting artifacts prepared.
- `npm run test:sites`: 4/4 passed.
- Captured `qa/single-subject-audit/02-home-start.png` through `06-home-return-final.png`, repeated rapid home/task reversal, and confirmed the final DOM returns to the correct active navigation and visible view.

## Page-transition geometry regression — 2026-08-28

- Root cause: GSAP Flip previously used scale interpolation on the full composer, so its nested blue primary button was temporarily stretched during the page change.
- Before the fix, the button width measured `166px → 264px → 192px → 166px`; the visual jump was caused by transform distortion rather than missing character keyframes.
- The composer now uses a non-scaling Flip geometry transition, the timeline progress driver is linear, and the child timeline owns the easing. The companion is one persistent image and never crossfades between unrelated silhouettes.
- After the fix, the primary button stayed within `164–168px` at the home, 120ms, 300ms, 540ms, and settled checkpoints; its horizontal center moved monotonically with no teleport or reversal.
- The navigation glass response was reduced to one restrained compression and settle cycle, and the task layer now fades in before accepting pointer events.
- At the 1092px in-app preview width, the task composer now uses the available workspace width instead of squeezing its toolbar into stacked labels; the CTA remains right-aligned inside the glass dock.

final result: passed

## 设置页 Quiet Preferences — 2026-08-28

### 实现

- 以 `design-reference/settings-quiet-preferences-v1.png` 为唯一视觉源，在现有工作区内新增设置面板；保留统一侧栏、品牌和共享伴生体，没有另建壳层。
- 采用连续表面与细分隔线组织「行为／权限／隐私／外观」，左侧为紧凑分类导航，右侧人物保持次要但持续在场。
- 默认执行模式、回复详细程度、知识库、联网搜索和主题模式均可操作；修改后显示未保存状态，保存提供「正在保存／已保存／已同步」反馈，支持恢复默认。
- 设置页隐藏对话输入条；任务／文件切入设置时，旧语义纹理收回，核心有限脉冲后落到守护态，并展示「行为／权限／隐私」三个锚点。

### 视觉对照与修正

- 同屏对照图：`design-reference/settings-source-vs-implementation.png`。
- P0：无。
- P1：首轮内容列整体偏右，标题与设置项被人物压缩；已把分类列贴近侧栏、主内容列左移并收窄到参考图比例。
- P2：首轮分段控件缺少语义图标、三个人物锚点偏右；已补齐 Phosphor 图标并按参考图重新落位。

### 验证

- 本地浏览器完成设置导航、切换偏好、开关、保存状态与任务／文件返回设置的核心路径冒烟。
- `npm run build` 通过；`npm run test:sites` 4/4 通过。
- 生产包保留 `dist/client/index.html`、`dist/server/index.js`、`dist/.openai/hosting.json`。

final result: passed

## File-route companion motion system — 2026-08-28

- Motion plan: `MOTION_CHANGE_PLAN.md`; file-page visual source: `design-reference/file-memory-chamber-v1.png`.
- Generated transparent companion overlay: `public/assets/companion-memory-map-v1.png`; browser capture: `design-qa/files-motion-implementation.png`; same-input comparison: `design-qa/files-motion-side-by-side.png`.
- The route master timeline now owns only home/workspace geometry. A separate semantic companion timeline switches home, task and file forms without remounting the subject; browser checks kept exactly one `.companion-shared-figure` during normal and rapidly interrupted task/file navigation.
- Home → files uses a file-specific navigation preview, a reversible memory-form reveal and right-origin orbit expansion. Files → home collapses the memory form without replaying a mechanical full-body effect. Task ↔ files uses a short `.42s` work-panel handoff.
- File search focus emphasizes the memory network; no-result search dims the memory core and orbits while preserving the empty-state message. File selection emits one finite signal to preview and core. External drag activates only the receiving state and is cleared on drag leave/drop.
- Fixed a preview lifecycle regression found during browser QA: commit previously overwrote the preview timeline's parent-opacity tween, so later hovers could not replay. Commit now reverses the timeline and animates scale on a separate channel.
- Reduced-motion emulation showed the files workspace immediately visible, one shared companion figure, memory form at opacity `1`, and the navigation preview hidden. Browser console warnings/errors: none.

final result: passed

### Task ↔ file companion emphasis pass

- Replaced the subtle work-form crossfade with a three-beat semantic handoff: current texture contracts into the chest core, a bounded core/axis pulse confirms the state change, and the destination visor plus neural texture expands from the core.
- Increased the work-to-work duration from `.42s` to `.56s`; the content panels still hand off promptly, while the companion gets enough time to make the form change readable.
- Added `.companion-semantic-layer` as a dedicated transform owner. During the handoff the companion briefly moves `34px` toward the content and rises above translucent work panels, then returns to its original geometry and z-order.
- The shared body remains mounted once; reduced motion hides the handoff overlay and resets the semantic layer immediately.

## 文件页「记忆舱」还原与点按交互 — 2026-08-28

### 视觉源与还原范围

- 选中设计图：`design-reference/file-memory-chamber-v1.png`（1487 × 1058）。
- 实现截图：`qa/file-memory-chamber-final.png`；同图并排检查：`design-comparison-file-memory-v1.png`。
- 保留现有原型的 126px 侧栏、黑色外框、`元枢` 品牌、共享伴生体和持久输入条；按设计图还原四条空间资料轨道、三枚文件芯片、右侧资料预览、当前会话附件、搜索和上传入口。
- 并排检查后修正了品牌与页标题重叠、资料轨道过窄、预览面板贴到外框、上传按钮消失、会话附件宽度不足等问题。最终轨道左缘、预览起点和预览右缘与参考图保持同一视觉分区，差异仅来自既有宽侧栏。

### 点按与页面切换

- 文件芯片使用一条 GSAP 时间轴完成：按下压缩 → 环形涟漪 → 单个信号点由芯片飞入预览 → 预览以 `.58 → 1` 的透明度和 `y 5px → 0` 落定 → 伴生体核心轻触回应；动画约 520ms 后完全静止。
- 实测信号点从文件轨道移动到预览头部，`signalOpacity .92 → .85 → .08 → 0`；预览 `opacity .58 → .79 → .96 → 1`，最终 transform 为单位矩阵，没有残留缩放。
- 任务 → 文件时，旧面板横移 14px 并退场，新面板从 18px 内收落定；导航玻璃块同步从 104px 滑到 208px。文件 → 任务为对称反向交接。
- 首页 → 文件时，工作区父层先完成可见性交接，四组 `.file-reveal-item` 以短错峰入场；实测 40ms 时工作区 opacity `.73`、子项最低 `.21`，240ms 时子项最低 `.97`，420ms 全部为 `1`，未出现先亮后灭的闪帧。

### 功能与回归

- 搜索输入 `保密` 后只保留 `保密协议模板.docx`，清空后恢复四组资料。
- 点击「用于当前对话」后，输入框获得焦点并填入 `请基于《产品路线图.pptx》整理关键结论和待跟进事项`。
- 通过原生文件选择器上传 `qa/资料上传测试.txt`，1.25s 索引进度结束后文件进入「最近使用」并自动选中；私有资料库上传与会话附件状态相互独立。
- 修复预览表格重复 key（`09-26`）后刷新并重复导航/文件点按，新增浏览器 `error` / `warn` 为 0。
- `npm run build` 与 `npm run test:sites` 均通过，Sites 产物保持 `dist/client/index.html`、`dist/server/index.js`、`dist/.openai/hosting.json`。

final result: passed

## Composer focus, refresh performance, and route flash regression — 2026-08-28

- Reproduced the input-focus displacement in the live task view. Before focus, the dock measured `x 479.238 / y 930.781 / w 774.004 / h 181.465`; after focus it measured `x 477.690 / y 926.055 / w 777.100 / h 182.917` with `matrix(1.004, 0, 0, 1.008, 0, -4)`. The movement came from the focus handler transforming the persistent outer dock.
- Focus now changes only the inner refractive-light opacity. `.composer-dock` position and scale remain reserved for Flip page geometry and explicit drag/drop feedback.
- Removed the viewport-sized task-navigation preview mask, screen blend, and persistent promoted layers. The preview is now painted from three local neural paths, one visor, and one core, avoiding a second full-body compositing pass during image decode and navigation.
- Removed homepage entrance scaling on the full glass frame and the simultaneous `will-change` promotion of the frame plus every nested entrance item. The decoded companion intro remains the only deliberately promoted large entrance layer and releases that hint on completion.
- Navigation-preview commit now holds for `60ms` and fades over `280ms` while the official task form begins appearing. Hover/focus preview handlers cannot reset it during an active route transition.
- Task phase beams and completion convergence calculate the remaining route duration and start only after the reversible home/task timeline settles, preventing the route and task lifecycle systems from writing the same visual state in the first frames.
- Added `scripts/check-motion-ownership.mjs` to lock these ownership boundaries in source.
- Motion-ownership regression, homepage refresh trace, navigation handoff trace, and task-composer visibility trace all passed. `npm run build` passed and `npm run test:sites` passed `4/4`; the local preview responds at `http://127.0.0.1:4175/`.

final result: passed

## Task lifecycle motion system — 2026-08-28

- Added a reversible task-navigation preview using a dedicated visor, core, and three restrained neural paths. Hover/focus previews intent without changing the shared body or moving the navigation glass; click commits into the existing home-to-task transition.
- Replaced the static three-step task trace with four live phases matching the companion model: `感知目标`, `组织上下文`, `执行工具`, and `交付成果`.
- Each phase now emits one finite GSAP energy pulse from its corresponding companion region to the active execution step. The beam and destination response use transform and opacity; its measured length is assigned once per phase and is never animated as layout.
- During delivery, answer blocks materialize in a short block-level stagger instead of character-by-character typing. On completion, the four companion origins converge into the core, the completion rings expand once, and the answer surface settles.
- Reduced-motion behavior hides the preview, phase beam, origins, and completion rings while keeping all task content immediately readable.
- Browser flow verified: home → task → start task → all four phases → completed task → home. Navigation state, task labels, persistent composer, and answer content remained intact.
- Browser warnings and errors: none. `npm run build`: passed. `npm run test:sites`: 4/4 passed.

final result: passed

## Task-state companion form activation — 2026-08-28

- Source visual truth: `design-reference/companion-task-state-concept-v1.png` (`1019 × 1543` pixels), used as the approved internal-lighting and task-form direction rather than as a second body image.
- Browser implementation: `implementation-task-form-v1.png` (`2003 × 1553` pixels) at a `1602 × 1242` CSS-pixel viewport with browser DPR normalization `0.8`.
- Transition evidence: `implementation-task-form-transition-mid.png` at the same viewport and state density.
- Combined visual comparison: `design-comparison-task-form-v1.png` (`1950 × 1000` pixels), with both source and browser implementation normalized to `1000px` height.
- State: homepage → task workspace, settled task form; transition midpoint checked separately.

### Findings

- No actionable P0/P1/P2 findings remain.
- Fonts and copy are intentionally unchanged because this iteration modifies only the persistent companion; the existing task-workspace typography and business-facing content remain consistent.
- Spacing and layout rhythm remain unchanged. The companion keeps the approved right-edge crop and continues behind the task cards without moving the task grid or composer.
- Colors and tokens match the selected direction: electric cyan visor seam, restrained lime neural paths, and a small red core within the existing light glass system.
- Image quality and asset fidelity pass: the generated task-energy texture is clipped by the exact alpha contour of `ai-companion.png`. The live DOM still contains one `.companion-shared-figure`, so the outer silhouette never crossfades or remounts.
- Focused comparison of the head, chest core, and upper-torso paths confirms that the visible task form carries the concept's three defining changes without importing its checkerboard background or altered body proportions.

### Comparison history

1. The first browser pass applied screen blending inside the masked group. Because the mask isolated that blend context, the black light-map background darkened the companion into a visible grey silhouette (P1).
2. Moved screen blending to the masked task-form container. The revised browser capture preserves the original pearl-white body while only cyan, lime, and red emissive details remain visible.
3. Verified the midpoint capture: the existing body contour remains singular while the visor is already readable and the core/neural layers are still forming, producing a clear staged morph rather than a full-image replacement.

### Motion and runtime checks

- The reversible master timeline reveals visor → core → neural regions with transform and opacity only.
- Reverse sampling confirmed monotonic collapse of all three regions and monotonic return of the home view; final visible task-region count is `0`.
- Rapid task → home → task interruption settled at task opacity `1`, home opacity `0`, region opacities `[0.72, 0.92, 1]`, and one shared companion figure.
- Directional transition-light residue returned to opacity `0`; browser warnings and errors: none.
- `npm run build`: passed. `npm run test:sites`: 4/4 passed.

### Follow-up polish

- P3: the task companion remains intentionally subdued behind the workspace. If the task-form change needs stronger product emphasis, increase only the task-state parent opacity slightly; do not move the figure over the reading column or add another body asset.

final result: passed

## Navigation status and energy-band handoff regression — 2026-08-28

- Reproduced both reported symptoms with 20ms browser sampling. The homepage status card and task workspace were simultaneously visible for about `190ms` in each direction, while the reversed companion energy bands remained visible for roughly `716ms`.
- Root cause: the status card only inherited the broad home-view fade and was also controlled by the homepage entrance timeline. The energy-band reveal and exit lived inside the reversible master timeline, so returning home replayed the full effect backwards, including staggered tails.
- Removed the status card from the one-time entrance targets and gave it one short master-timeline tween that completes before task content appears; on reverse it stays hidden until the task layer is gone.
- Moved energy light into two prebuilt, direction-specific transient timelines. Home → task keeps a fuller convergence sweep; task → home uses a quieter collapse and both timelines reset each other before restart during interrupted navigation.
- `scripts/check-nav-visual-handoff.mjs` fails against `qa/nav-visual-handoff-before.json` and passes `qa/nav-visual-handoff.json`: forward overlap `0ms`, reverse overlap `0ms`, no opacity reversals, and sampled reverse-light residue reduced from `716ms` to `48ms` after the click action completes.

final result: passed

## Homepage refresh entrance regression — 2026-08-28

- Reproduced the reported refresh jump with 20ms browser sampling: the companion was already at opacity `1` in the first sample, had only one opacity state, and made a `7.5px` vertical step around the moment the page-transition setup overwrote the entrance tween.
- Root cause: the one-time entrance and the reversible home/task transition both wrote opacity/transform to `.companion-wrap`; the nested CSS breathing animation also started immediately, so the initial frame had no isolated motion owner.
- Added `.companion-intro-layer` between the pointer-parallax body and the breathing pose. CSS keeps this layer hidden before GSAP initialization, while the page-transition timeline continues to own `.companion-wrap` exclusively.
- The high-priority `ai-companion.png` is decoded before the paused entrance timeline begins. The figure now fades for `0.9s` and settles its transform over `1.2s`, using only compositor-friendly opacity and transform properties.
- `scripts/check-home-refresh-entrance.mjs` fails against `qa/home-refresh-entrance-before.json` and passes `qa/home-refresh-entrance.json`: first opacity `0`, 42 sampled opacity steps, full opacity at `747ms`, maximum opacity step `0.068`, maximum vertical step `1.8px`, and one decoded companion image.
- Fresh-browser visual inspection at the mid and settled states showed no flash, no duplicate body, and no console warnings or errors.

final result: passed

## Single-subject transition regression — 2026-08-28

- Captured the reported task → home failure in `qa/single-subject-audit/01-home-return-broken.png`. The DOM contained 6 companion images; the home image plus bridge frames 2–4 were simultaneously visible near full opacity, which explains the stacked bodies in the screenshot.
- Replaced endpoint/keyframe swapping with one persistent `ai-companion.png`. The generated task/bridge assets remain on disk as references but are no longer mounted.
- Removed overlapping navigation-glass tweens. The glass now has one reversible `sine.inOut` position tween; after normal and rapid reverse, its center and dimensions exactly match the active home button (`0px` delta).
- `scripts/check-single-subject-transition.mjs` is red-capable against the captured broken state (`6` DOM images / `4` visible) and passes the new six-state trace with `1` DOM image / `1` visible in every state.
- Fresh-browser home → task → home verification returned home opacity `1`, task opacity `0`, one visible companion, and no warnings or errors.

final result: passed

## Task composer visibility regression — 2026-08-28

- Reproduced the report in the live task view: `.composer-dock` remained mounted, correctly positioned inside the viewport, and `visibility: visible`, but its computed opacity was stranded at `0`.
- Root cause: the homepage entrance timeline animated opacity and transform directly on the same persistent dock that GSAP Flip owns during home/task geometry changes. An early or interrupted route change could preserve the entrance tween's hidden state.
- Kept the dock continuously visible and moved the entrance reveal to its nested `.composer-input` and `.composer-toolbar`. Flip remains the only owner of dock geometry, while the input and controls retain their polished entrance.
- `scripts/check-task-composer-visibility.mjs` fails against `qa/task-composer-visibility-before.json` and passes `qa/task-composer-visibility-after.json`.
- Browser evidence: `qa/task-composer-visible-after.png`; settled task state measured dock/input/toolbar opacity `1`, the dock fully intersected the viewport, and the live companion still contained exactly one `.companion-shared-figure`.
- Browser warnings and errors: none. `npm run build`: passed. `npm run test:sites`: 4/4 passed.

final result: passed

## 任务页内容闪烁与首页入场迟滞 — 2026-08-28

用户报告两处：首页切任务页时中间内容区会闪几下；刷新时左侧导航项与底部输入条出现过慢，像卡顿。

### 根因

- **闪烁**：路由时间轴用 `fromTo(taskRevealItems, { autoAlpha: 0, y: 14 }, …, beats.structure)` + `immediateRender: false` 承担首次隐藏。`.task-view` 容器从 `beats.migration`(.26)就开始淡入，而子内容直到 `.42` 才被打回 `autoAlpha: 0`——中间这 0.16s 内容以残留值完全可见，随后瞬间消失再淡入。`.execution-line > i` 同理（进度条先满格再归零）。叠加两处放大效果：`.task-view` 的 0.46s 淡入与子元素 0.4s 淡入区间重叠，父子 opacity 相乘产生非线性起伏；`.task-live` 的 `repeat: 1, yoyo: true` opacity 脉冲又嵌在同样在淡入的 `.task-thread-head` 内。
- **迟滞**：整条入场时间轴挂在 `companionFigure.decode()` 回调上，752KB 的 `ai-companion.png` 解码完才 `play(0)`；导航项在 `frame+=.16`（stagger .055）、输入区在 `frame+=.76`（duration .62），末项落定在解码时间 + 1.42s。

### 处理

- 任务内容、执行进度条、`.task-live` 的初始态移进路由时间轴的 `gsap.set` 块，时间轴内部改用 `to` 推进；`reduceMotion` 分支的 `play`/`reverse` 同步维护这批值。
- `.task-view` 的 `autoAlpha` 从 0.46s 收到 0.14s，在 `beats.structure` 之前结束，消除父子相乘。
- `.task-live` 改为一次 `back.out(2.2)` 的 scale 弹入，不再动 opacity。
- 入场拆成两条时间轴：界面骨架立即播放，`.companion-intro-layer` 单独一条且只有它等解码。骨架各段整体前移并收紧（导航 `frame+=.05` / duration .32 / stagger .034，输入区 `frame+=.16` / duration .42 / stagger .03）。

### 证据

- 用 `timeline.progress()` 逐点扫描（57 个采样点）计算内容的有效 opacity（`.task-view` × 子元素，`visibility: hidden` 记 0）：`.task-thread-head`、`.answer-card`、`.execution-step`、`.task-live` 四个通道正向 `maxDrop` 均为 `0`，轨迹 `0 → .168 → .675 → .905 → .984 → 1` 全程单调不降。
- 反向扫描单调不升、二次正向仍单调，`maxViolation` 均为 `0`；正向到 `.45` 立即反向到 `0` 再正向到 `1` 的中断路径落定于任务内容 `1`、首页 `0`、DOM 内 `.companion-shared-figure` 计数 `1`。
- 入场：ticker 启动后 320ms 采样，导航末项 / 标题 / `.composer-input` / `.composer-toolbar` 全部 `opacity: 1`，伴生体此时 `0.11` 仍在展开。
- 伴生体入场 trace `qa/home-refresh-entrance-split.json`：首帧 `0`、42 个 opacity 台阶、`fullOpacityAtMs 720`、最大 opacity 步 `0.0652`、最大垂直步 `0.78px`、终值 `1`，通过 `scripts/check-home-refresh-entrance.mjs`。
- 任务态输入条 trace `qa/task-composer-visibility-split-entrance.json`：`opacity 1`、`visibility visible`、input/toolbar 均 `1`、可见面积 `99550`，通过 `scripts/check-task-composer-visibility.mjs`。
- 六个校验脚本全绿：motion-ownership、single-subject-transition、transition-continuity、nav-visual-handoff、task-composer-visibility、home-refresh-entrance。`npm run build` 通过。

### 未覆盖

- 浏览器标签在后台运行，`requestAnimationFrame` 与 `setInterval` 均被节流（定时器降到约 1s/次），**没有采集真实帧率**，单调性结论来自时间轴 seek 采样而非实时播放。前台环境应补一次 DevTools Performance 实采。
- 本轮只动动效时序，未处理已知布局缺陷：能力状态卡在视口高 < 946px 时被输入条遮挡；任务页输入条在视口宽 < 1503px 时工具按钮换行；任务态 `.composer-dock` 落定后仍有 `matrix(1.004, 0, 0, 1.008, 0, −4)` 的 Flip 残留缩放。

final result: passed

## 布局地基：固定像素改为内容驱动 — 2026-08-28

承接上一条动效修复。原型的垂直与水平布局都锚死在 1488 × 1058 的设计稿尺寸上，容器一旦变小就重叠或挤压。

### 根因

- `.capability-area` 用 `top: 470px`、`.composer-dock` 用 `bottom: 85px; min-height: 180px`，两者从相反的边硬编码。输入条顶边 = 框内高 − 265，能力卡底边恒为 645，因此**视口高度低于 946px 就必然重叠**——13″ 笔记本全屏浏览器只有 870–890px 可视高。
- `.composer-dock.is-task-compose` 用 `left: 286px; right: 282px`，可用宽 = `min(1488, 视口宽 − 16) − 714`，上限 774px；工具栏单行实测需要 771px，**余量仅 3px**，1280px 视口下只剩 550px，按钮被压成「附/件」逐字竖排。
- 移动端 `.home-view` 同样是绝对定位，能力卡与输入条重叠 263px。

### 处理

- `.workspace` 上定义 `--composer-bottom` / `--composer-min-h` / `--composer-reserve`，输入条的落位与占高只声明一次。
- `.home-view` 改为一列 flex（`justify-content: center`，`gap: clamp(24px, 7vh, 76px)`，`padding-bottom: calc(var(--composer-reserve) + 30px)`），`.hero-copy` 与 `.capability-area` 改为 `position: relative` 参与流布局，移动端断点里对应的 `left`/`top` 一并清除。
- 任务态输入条改为 `left/right: clamp(64px, (100% - 792px) / 2, 286px)`：优先保证 792px 的工具栏单行宽度（比需求多 21px 余量，原设计只有 3px），空间富余时回到设计稿缩进。
- `.tool-group` / `.mode-group` / `.start-button` 设 `flex: none`，按钮加 `white-space: nowrap`，`.composer-toolbar` 改 `min-height: 72px` + `flex-wrap: wrap`——宽度不够时折行，永不逐字竖排。
- 新增两档断点：`@media (max-width: 1080px)` 把工具按钮降级为纯图标（与移动端同一套语言），保证输入条高度稳定在 185px；`@media (max-height: 800px)` 与 `(max-height: 860px)` 分别收紧首页上边距/段间距与能力卡高度。

### 证据

首页八档实测（`getBoundingClientRect`，能力卡底边 vs 输入条顶边）：

| 视口 | 输入条高 | 工具栏高 | 重叠 | 余隙 |
| --- | --- | --- | --- | --- |
| 840 × 720 | 185 | 76 | 0 | 42 |
| 860 × 700 | 185 | 76 | 0 | 43 |
| 900 × 760 | 185 | 76 | 0 | 51 |
| 1024 × 768 | 185 | 76 | 0 | 54 |
| 1100 × 740 | 185 | 76 | 0 | 42 |
| 1280 × 800 | 185 | 76 | 0 | 66 |
| 1440 × 900 | 185 | 76 | 0 | 70 |
| 1512 × 950 | 185 | 76 | 0 | 88 |

- 修改前同样的量法：1280 × 800 重叠 146px，1440 × 900 重叠 46px，900 × 760 重叠 32px。
- 移动端 375 × 812：标题顶边回到设计稿的 118px，能力卡底边 367 / 输入条顶边 540（余隙 173），输入条底边 726 < 底栏顶边 740，**四项底部导航完整可见**；修改前能力卡与输入条重叠 263px。
- 任务态 1280 × 800：输入条宽 792，工具栏单行 76px，按钮宽度 78 / 91 / 104 / 77 / 77 / 77 / 166，无竖排；1024 × 800 输入条宽 726、单行；375 × 812 输入条宽 347、单行、底栏未被覆盖。
- 转场无回归：路由时间轴逐点扫描，四个内容通道正向 / 反向 / 二次正向 `maxDrop` 均为 `0`，中断路径落定于任务内容 `1`、首页 `0`、DOM 内 `.companion-shared-figure` 计数 `1`。
- `qa/task-composer-visibility-fluid-layout.json` 通过 `check-task-composer-visibility.mjs`；五个既有校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 更正

上一轮规划里把任务态 `.composer-dock` 落定后的 `matrix(1.004, 0, 0, 1.008, 0, −4)` 记为「Flip 残留缩放」，**不成立**：`Flip.from` 已配置 `scale: false` 与 `clearProps: "transform,width,height"`，那是用 `progress(1)` 强制跳转时观察到的转场中间态。清除内联样式后复测，落定几何与 CSS 计算值一致。

### 未覆盖

- 仍是后台标签环境，定时器被节流，**没有采集真实帧率**；布局结论来自 `getBoundingClientRect` 实测，转场结论来自时间轴 seek 采样。
- 视口宽度低于 820px 且高度低于 700px 的极端组合未逐一枚举；`.app-frame` 的 `min-height: 720px` 在此时会溢出视口并被 `.prototype-stage` 裁剪，属既有行为。
- `composerLift` / `composerScaleX` / `composerScaleY` 三个 `gsap.quickTo` 在 `App.jsx` 中定义后从未被调用，本轮未清理。

final result: passed

## 伴生体遮挡阅读区、入场闪现、阅读时让开输入条 — 2026-08-28

### 一、任务页伴生体压住正文

- 根因：浅色态下四个卡片容器的背景是 `linear-gradient(145deg, rgba(255,255,255,.78), rgba(247,250,249,.6))` 且 `backdrop-filter: none`——右下角只有 60% 不透明，而 145deg 的渐变恰好把最透明的一角对着伴生体，人形轮廓毫无柔化地透到正文上。
- 处理：卡片背景提到 `.97 / .93`，`.user-brief` 提到 `.92`，`.task-live` 改为接近实色的浅绿渐变；再用 `.companion-wrap::after` 的横向渐变把阅读列一侧收掉，避免伴生体被卡片切成断续的条。遮罩走 `opacity` 过渡（`mask-image` 的渐变无法插值，切换会跳）。
- 证据：正向 / 反向切换中遮罩层 opacity 单调（`fwdMaxDrop 0` / `revMaxRise 0`）；首页态遮罩 `0`、伴生体 `1`，任务态遮罩 `1`、伴生体 `.5`；伴生体层级本就在 `.task-view` 之下（`z-index` 2 vs 4），本次未改动层级。

### 二、刷新首页时"卡顿一下才出现"

- 根因：入场只靠 `.from()` 承担首次隐藏。实测 `DOMContentLoaded` 在 753ms，而 875ms 时 `.side-rail nav button` 与 `.composer-toolbar` 的内联 opacity 仍为空、计算值为 **1**——GSAP 尚未接管，元素正以完全可见的状态显示，随后被瞬间打回 0 再淡入。
- 处理：`.app-frame:not(.is-entrance-ready)` 在 CSS 里兜底隐藏全部入场目标，GSAP 就位后加 `is-entrance-ready` 放行；`reduced motion` 下同样加 class，元素直接可见。
- 证据：同样的量法，动画开始前 nav / toolbar / input 均为 **0**（修复前为 1），入场完成后全部 `1`。

### 三、阅读执行流程时让开输入条

- 收起量 `--dock-collapse` 注册为 `@property <number>`，由浏览器原生插值；随滚动距离连续累加（每 30px 约 0.19），实测轨迹 `0 → .188 → .375 → .563 → .750 → .938 → 1`，反向同样连续。
- 收起视觉：`opacity 1 → .18`、`translate 0 → 38px`、`scale 1 → .985`，越过 .62 后让出指针事件。
- 交还条件三条：读到底部（`atBottom → 0`）、指针进入工作区底部约 280px（`pointerNearBottom → 0`）、焦点进入输入条。
- `translate` / `scale` 必须带 `!important`：GSAP 接管 transform 时会写内联 `translate: none; scale: none`（实测内联为 `transform: translate(0px, 0px); translate: none; rotate: none; scale: none;`），否则这两条通道会被清空，只剩 opacity 变化。
- 焦点态改用 `.composer-dock:focus-within` 的 `!important` 覆盖内联值——实测 `focusin` 无论注册在 dock 还是 document 上都收不到回调（临时注册的同名监听却能收到，原因未查明），CSS 路径可靠且自带过渡。实测聚焦时内联仍为 `0.938` 而计算值被覆盖为 `0`。
- 离开任务页时禁用 transition 后瞬时归零：点击返回首页的瞬间内联即为 `0`、opacity `1`、translate `0px`，不会把偏移带进路由 Flip。

### 回归

六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过；首页落定态 opacity `1`、translate `0px`、pointer-events `auto`。

### 未覆盖

- 页面在后台标签运行，本轮改用 Web Worker 的 `setInterval` 驱动 GSAP ticker（Worker 定时器不受后台节流），动画得以按接近真实的速度播放；据此测得每帧 ticker 处理耗时 p50 `0ms` / p95 `0.1ms` / max `0.2ms`。但这只是主线程的计算开销，**不含浏览器合成与绘制，仍然不是真实帧率**。
- 触摸设备上的收起手感（惯性滚动、橡皮筋回弹）未验证。
- `focusin` 在该页面收不到回调的根本原因未查明，已用 CSS 路径绕开。

final result: passed

## 文件卡片选中悬浮态精确还原 — 2026-08-28

### 对照证据

- 视觉源：`design-reference/file-memory-chamber-v1.png`，源局部：`qa/file-selected-source.png`。
- 修改前浏览器截图：`qa/file-selected-before.png`；修改后：`qa/file-selected-final-screen.png`。
- 同状态局部并排图：`qa/file-selected-comparison-final.png`（左为设计稿，右为实现）。源局部与实现局部均归一到 760 × 210；浏览器 CSS 视口 1602 × 1242，截图密度 1.25。
- 状态：文件页、`研发进度清单.xlsx` 已选中、鼠标离开后的常驻悬浮态。

### P2 发现与修复

- 修改前选中卡片 `transform` 为单位矩阵、高 50px、`overflow: hidden`，只有绿色描边，缺少设计图中明显的左倾、抬升、卡片厚度和底部折射光，属于可感知的选中态设计漂移。
- 修复后静止几何为 `y -6px / rotation -2.8deg / scaleX 1.02 / scaleY 1.02 / perspective 760px`，实测包围盒约 175 × 63px；边缘改为单层青绿色折射边，底部使用低透明度青绿双光和短软阴影。
- 未选中卡片保留 `.45° / .7° / 1.3°` 的轻微自然角度，与设计图相邻卡片的空间排列一致。
- 鼠标进入时使用 scoped GSAP `quickTo` 跟随局部位置：最大 `rotationX 4.2° / rotationY 5.2°`、`scale 1.03`，离开 420ms 内回到常驻悬浮态，不产生跳变。
- 选中另一文件时，旧卡片回到自身静止角度，新卡片进入统一悬浮几何；实测选中计数始终为 1，右侧预览同步更新。
- 将卡片复位中的 `scale` 拆成 `scaleX` / `scaleY` 后，连续两次文件切换新增浏览器 `error` / `warn` 为 0，未再出现 `scale not eligible for reset`。

### 其余保真面

- 字体、文案、图标、轨道间距、页面颜色、伴生体素材与上轮验收一致，本轮未改动。
- 键盘焦点在未选中卡片上仍保留青色焦点环；选中卡片自身的悬浮边缘已足够表达状态，移除额外实线焦点框，避免与设计稿不符的双描边。

final result: passed

## 任务页输入条紧凑化，正文让出更多高度 — 2026-08-28

参照 Claude / Codex 的对话框密度：对话中的输入条是一根紧凑条，不是首页那种主体输入区。

### 处理

- 任务态输入行 94px → 48px（单行起步，字号 17px → 14px），工具控件 42px → 32px，主按钮 52px → 38px，模式组 240px → 186px；`min-height` 由 166px 改为 0，让内容决定高度。
- `.task-workspace` 底部 inset 222px → 154px，`.files-workspace` 196px → 154px；移动端两者 264px → 220px。
- 首页输入条完全不变，仍是 185px 的主体输入区。

### 结果

| 视口 | 输入条高 | 工具栏 | 正文可视高 |
| --- | --- | --- | --- |
| 1280 × 800 首页 | 185 | 76 | — |
| 1280 × 800 任务页 | 122 | 63 单行 | 440 → **508** |
| 1024 × 800 任务页 | 122 | 63 单行 | 508 |
| 375 × 812 任务页 | 122 | 63 单行 | 510 |

- 文件页复用同一套紧凑规格：输入条 122px、与工作区间隙 14px、布局无重叠。
- 移动端底栏未被覆盖，工具栏保持单行图标（按钮 38 / 38 / 38 / 38 / 38 / 38 / 52）。

### 两次特异性踩坑

1. `.composer-dock.is-task-compose .tool-control { padding-inline; font-size }`（0,3,0）盖过了 820 / 1080 断点里 `.tool-control`（0,1,0）的 `font-size: 0`，移动端工具按钮恢复显示文字并把工具栏撑成两行、反过来与正文重叠 34px。
2. 改用变量后仍然错：`--tool-font` 声明在 `.composer-dock.is-task-compose`（0,2,0），媒体查询里写在 `.composer-dock`（0,1,0）上的覆盖同样输掉——**自定义属性的层叠一样吃特异性**。最终断点改回直接设 `.tool-control` 的属性，与基础规则同级且在后面，稳定胜出。
- 375px 宽下工具栏单行只有约 323px 可用，模式组需收到 112px 才留得出余量（3×38 图标 + 4px 间距 + 112 + 52 + 24 = 314）。

### 回归

六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过；首页输入条仍为 185 × 969，任务态 122 × 792。

### 未覆盖

- 输入多行时的自增长行为未验证（当前 48px 是固定高度，不是 auto-grow）。若要贴近 Claude / Codex，后续应让 textarea 随内容增高并设上限。
- 仍是后台标签环境，未采集真实帧率。

final result: passed

## 资料库文件拖进会话 — 2026-08-28

### 实现

- 文件卡加 `draggable`，`dragstart` 时把 `{id, name, kind, size, location}` 写进自定义 MIME `application/x-yuanshu-library-file`（另写 `text/plain` 兜底），并调用既有的 `releasePress` 结束按压／倾斜态，避免和卡片的指针动效打架。
- 输入条接收 `dragover` / `drop`：只认自定义 MIME，执行中（`isRunning`）不接收。落进来的是**引用**而非上传——不重新走上传流程，自动打开知识库检索，chip 用书本图标并显示来源位置（临时附件仍是回形针 + 文件大小）。
- 落点反馈 `.composer-dock.is-library-target`：强制展开收起的输入条、边缘转能力色、内缘一道 `library-drop-halo` 呼吸柔光；拖拽源卡片 `opacity: .42` + 虚线边框留作占位。
- 文件页根节点的上传遮罩加 `types` 含 `"Files"` 的前置判断，内部拖拽不再误亮"松开上传"。

### 证据

- 合成 `DragEvent` + `DataTransfer` 全链路：`dragstart` 后源卡片得到 `is-drag-source`、输入条得到 `is-library-target`、payload 正确；`drop` 后生成 `attachment-chip is-library`（"研发进度清单.xlsx / 项目资料 · 研发管理"），知识库开关自动置为开；`dragend` 后两个 class 都清除。
- 落点样式实测：边框 `rgba(124,205,46,.6)`、`--dock-collapse` 被强制解析为 `0`、`::after` 的 `library-drop-halo` 动画在跑（opacity .98）、源卡片 `opacity .42` + `border-style: dashed`。
- **真实鼠标拖拽**（非合成事件）：把「设计评审纪要.pdf」从卡片拖到输入条，附件计数变为 2，两个 chip 正确，拖拽态已清理。
- 上限：第 1／2／3 份正常累加，第 4 份被拒并提示"一次最多带 3 份资料，先移除一份再拖"，移除一份后可再拖入。
- 遮罩区分：内部拖拽 `files-workspace.is-dragging` 为 `false`，外部文件拖入仍为 `true`。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 一处返工

上限提示最初写成在 `setAttachments` 的 updater 里置 `rejected` 标志、函数末尾读它——实测提示始终不出现，因为 updater 是延迟执行的。改为用当前渲染的 `attachments` 判断后正常。

### 未覆盖

- 触摸设备上的拖拽（HTML5 拖放在移动端浏览器普遍不触发），移动端仍需走"用于当前对话"按钮。
- 拖拽过程中的自定义拖影（当前用浏览器默认的元素快照）。
- 仍是后台标签环境，未采集真实帧率。

final result: passed

## 文件页进场闪烁、两处几何、转场提速 — 2026-08-28

### 一、切到文件页时内容闪几下

- 根因与首页入场、任务内容进场完全同源：`.file-reveal-item` 用 `fromTo` + `immediateRender: false` 承担首次隐藏，而面板容器在 `.1` 就开始淡入、子内容直到 `.16` 才被打回 `autoAlpha: 0`，中间这段以残留值可见，随后瞬间归零再淡入。容器 `.46s` 的淡入还与子内容 `.36s` 的淡入相乘。
- 处理：隐藏态移进时间轴开头的 `set`，内部改用 `to`；容器 `autoAlpha` 收到 `.16s` 并在子内容进场（`.28`）前结束，位移单独走 `.46s` 的曲线。
- 证据：任务→文件切换过程中对三个 `.file-reveal-item` 采样有效 opacity（面板 × 自身），`maxDrop` 均为 `0`，首帧 `[0,0,0]`、末帧 `[1,1,1]`。

### 二、模式滑块下方留白

- 根因：紧凑态把 `.mode-glass` 的 `height` 写死成 32px，而模式组实际高 48px（内容撑开，非 32+8），滑块顶 5px、底 11px 不对称。
- 处理：改为 `top: 4px; bottom: 4px; height: auto`，跟随模式组实际高度。
- 证据：上下间隙均为 `5px`，滑块高 38px。

### 三、资料卡戳出行背景

- 根因：`.memory-orbit` 用椭圆圆角 `50% / 48%`。行高 83px、宽 708px 时，椭圆在卡片上下边缘（距中心 ±29px）处的水平边界只到 x≈774，而最右侧卡片的右边缘在 866——**超出约 92px**，所以那张卡的角戳出轮廓。
- 处理：改为胶囊 `border-radius: 999px`，两端是等高半圆。
- 证据：胶囊在卡片上下边缘处的边界为 872，卡片右边缘 866，**留 6px 余量**，`cardFitsInsideCapsule: true`。

### 四、切换菜单时输入条滑得慢

- 播放速度由 `motionDuration` 驱动（时间轴内部 beats 的 1.16s 是时间轴时间，不是观感时长）：`PAGE_MOTION.flipDuration` 1.1s → **.68s**，任务↔文件面板切换 .56s → **.4s**。Flip 与路由时间轴共用这个值，两者同步提速。
- 实测（到输入条位置稳定为止）：首页→任务 **655ms**（原约 1100ms），任务→文件 **394ms**（原约 560ms）。

### 回归

六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 未覆盖

- 文件→首页方向的耗时测量失败（返回 37ms，是稳定判定在动画启动前就触发的误判），该方向的实际时长未取得可信数值。
- 仍是后台标签环境，未采集真实帧率。

final result: passed

## 首屏等待过长的真因：不是动画，是模块与图片 — 2026-08-28

用户反馈首屏导航与输入条的等待仍然偏长。此前几轮一直在压缩入场动画，这次先分清两段时间：**JS 就绪之前的空白**，和**动画本身的时长**。

### 定位

对比同一份代码在两个环境下的导航时序：

| | dev（5173） | 生产预览（4173） |
| --- | --- | --- |
| 资源请求数 | 4579 模块 | 7 |
| `domContentLoaded` | **753ms** | **22ms** |

结论：瓶颈不在动画编排，而在 dev 的模块解析。进一步看资源明细，两处元凶：

1. `@phosphor-icons/react` 整包导入。加 `optimizeDeps.include` 预打包后请求数降到 26，但产出 **6068KB 单块**，解析它反而更慢（`domContentLoaded` 866ms）。
2. 图片总量 **2.4MB**：`companion-task-energy-map-v1.png` 1371KB、`ai-companion.png` 735KB、`companion-memory-map-v1.png` 288KB，且在 815ms 才开始请求。

### 处理

- 40 处图标改为按需子路径导入（App 17 / FilesWorkspace 17 / TaskWorkspace 6），并把 phosphor 移出 `optimizeDeps.include`（保留 react / gsap）。
- 三张实际使用的图转 WebP（`cwebp -m 6`，保留 alpha）：735KB→**43KB**（-94%）、1371KB→**109KB**（-91%）、288KB→**112KB**（-60%），合计 2394KB→**264KB**。原 PNG 作为源文件保留，代码不再引用。
- 入场时间轴同步压缩：导航末项 `.47s → .35s`，输入区末项 `.61s → .42s`。

### 结果

| 指标 | 处理前 | 处理后 |
| --- | --- | --- |
| dev `domContentLoaded` | 866ms | **38ms** |
| dev 最后一个资源 | 897ms | **85ms** |
| dev 总传输 | 8612KB | **2349KB** |
| 输入区落定（动画） | .61s | **.42s** |
| 感知总时长（dev） | 约 1.5s | 约 **0.46s** |

- 生产构建视觉复核：伴生体 WebP 的透明边缘、神经线、红色核心均无损。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 未处理（需要你确认）

`public/assets/` 下仍有 **7.4MB** 不被任何代码引用的资源：`ai-companion-task.png`（2.2MB）、`ai-companion-task-source.png`（1.8MB）、`ai-companion-task.webp`、`companion-frames/`（8 个文件）。按 AGENTS.md 它们只是设计探索参考，但仍会被完整复制进 `dist/client`。删除属于不可逆操作，未擅自执行。

### 未覆盖

- 后台标签环境，未采集真实帧率。
- WebP 的视觉复核基于生产预览的整屏截图，未做逐像素比对。

final result: passed

## 文件页输入条：从"换个位置的任务输入条"改成带语境的提问入口 — 2026-08-28

原先文件页复用任务页的输入条，只是换了位置，没有体现"用户正在看某一份资料、想问的是关于这份资料的问题"这个语境；"附件"按钮在这一页也是多余的。

### 形态

- `.composer-context`：输入框上方一条「基于 · 〈资料名〉· 来源位置 ×」，逐个可移除。资料从两条路径进入——把卡片拖进输入条，或详情面板的「用于当前对话」，两者都走 `attachLibraryFile`。
- `.composer-suggestions`：输入框为空且已有上下文时给三个起手式（总结要点／提取待办／找风险），点击填充并聚焦，开始打字即收起。
- 工具栏：文件页隐藏「附件」，「资料库」按钮改为显示「已选 N 份」。
- 资料库引用与临时附件在文件页分流：前者进上下文条，后者留在附件托盘；任务页与首页不受影响。

### 高度联动

输入条会在三种状态间变高，工作区底部预留用 `ResizeObserver` 写入的 `--composer-actual-h` 跟随：

| 状态 | 输入条高 | 工作区底边 | 间隙 |
| --- | --- | --- | --- |
| 有上下文 + 快捷提问 | 207 | 537 | **14** |
| 已输入（快捷提问收起） | 173 | 571 | **14** |
| 无上下文 | 122 | 622 | **14** |

移动端（375 × 812）：输入条 207、间隙 **12**、底部导航未被覆盖，上下文条与快捷提问均单行显示。

### 回归

六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过；生产预览下三页切换 console 无任何输出。

### 一处测量陷阱

`ResizeObserver` 的回调是异步的，drop 之后立刻读 `--composer-actual-h` 会读到空值、算出负的间隙。等一帧之后复测即为正常值（桌面 14px、移动端 12px）。这不是布局缺陷，但写验证脚本时要留出这一帧。

### 未覆盖

- 上下文超过 3 份时的换行表现未测（`MAX_ATTACHMENTS` 上限为 3，实际到不了多行）。
- 快捷提问的文案是三个通用起手式，未按资料类型（表格／文档／PDF）分化。
- 仍是后台标签环境，未采集真实帧率。

final result: passed

## 文件页标题区与其他页面统一 — 2026-08-28

文件页顶部同时存在两个标题块：全局的 `.workspace-brand`（元枢 25px）和页面级的「文件 / 我的资料库」（30px），并排挤在一起，页面标题反而比品牌更大。首页与任务页的顶栏都只有品牌一块。

### 处理

- 移除文件页的页面级标题，页面名交给左栏导航的高亮承担（与任务页一致——它的页面标题在工作区内部的 `.task-thread-head`，不在顶栏）。
- `.files-head` 从「标题 + 搜索 + 上传」的三列 grid 改成纯工具条 flex：搜索框 `flex: 0 1 420px`、隐私标签「仅你可见」`margin-left: auto`、上传按钮。
- 工具条的垂直中心对齐品牌块的「元枢」那一行（`.files-workspace` 顶部 inset 24px → 29px）。
- 顶部行高 76px → 52px，省下的高度还给资料区。
- 移动端：隐私标签隐藏，搜索框自适应，工具条整体落在品牌块下方。

### 证据

- 品牌块在首页／任务页／文件页的位置与尺寸完全一致（`brandSameAcrossPages: true`，`left 190 / top 56 / 98 × 57`）。
- 工具条不再与品牌块重叠（`headOverlapsBrand: false`），旧标题节点已不存在（`oldTitleGone: true`）。
- 对齐结果：搜索框、隐私标签、上传按钮的垂直中心均为 `73`，品牌「元枢」行中心 `74`，**相差 1px**。
- 资料区上移：`.memory-stage` 顶边 106（原先被 76px 标题行推低）。
- 移动端 375 × 812：工具条落在品牌块下方（`headBelowBrand: true`），隐私标签 `display: none`，搜索框 242 宽 + 上传按钮 95 宽同行。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

final result: passed

## 动效语气与页面切换纵深 — 2026-08-28

### 诊断

统计全部 GSAP 调用后，"够用但不高级"的两个成因很清楚：

- **缓动单一**：`power3.out` 独占 55 处，`sine.*` 31 处。这类曲线安全但没有性格，起步不够锐利、尾部不够从容。
- **stagger 全线性**：19 处 stagger 无一使用 `from` 参数，群组进场只是"依次出现"，没有编排。

### 处理

1. **缓动语气分层**：新增 `EASE` 常量（`reveal` / `glide` / `exit` / `swap` / `settle`），把入场与转场的主干共 21 处换到对应语气。核心是 `expo.out` 承担"显现"——它在前 20% 的时间里走完 80% 的距离，**在不加长时长的前提下**让感知变快、尾部更从容。`quickTo` 的指针跟随与滑块拖拽保留 `power3.out`，跟随类需要平滑而非锐利。
2. **群组编排**：能力卡改为逐张进场并用 `{ each: .05, from: "center" }` 从中间向两侧展开；伴生体节点用 `{ each: .045, from: "random" }` 配 `back.out(1.6)`，像逐个接通；阅读序内容保持 `from: "start"`。
3. **切换纵深**：离场层退后、进场层推进，替代原先的平面互换。首页离场 `scale: .988`，工作区从 `.994` 推进到 `1`；任务／文件面板互换用 `.995`。纵深起点写在初始 `gsap.set` 里，与隐藏态预置同一套规则。
4. **顺带修掉一处父子叠乘**：`.capability-area` 原先与卡片同时淡入（父 .16–.46、子 .19–.53），两层 opacity 相乘。改为容器只做位移，opacity 由 `.section-label` 与卡片各自承担；入场兜底隐藏同时覆盖容器和卡片。

### 证据

- **入场单调性**：逐点 seek 采样 49 帧，三张能力卡的有效 opacity（容器 × 自身）`maxDrop` 均为 `0`，四个节点同样为 `0`，落定全 `1`——父子叠乘已消除。
- **编排生效**：`cardReachOrder: [34, 27, 34]`——中间那张在第 27 帧先到 1，两侧第 34 帧，`from: "center"` 的展开可量化。
- **切换纵深**：起点 `home 1.0 / task .994`，终点 `home .988 / task 1.0`，反向后完全复位为 `home 1.0 / task .994`；正向 opacity 与 scale 的 `maxDrop` 均为 `0`；DOM 内 `.companion-shared-figure` 仍为 `1`。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过；首页与任务页落定视觉完整。

### 未覆盖

- 微交互（按钮按压、卡片 hover）仍走 CSS `transition`，未改用 GSAP 的物理回弹。
- 未引入滚动驱动（ScrollTrigger 属于插件，不在本轮 core 范围）。
- 仍是后台标签环境，未采集真实帧率；单调性结论来自时间轴 seek 采样。

final result: passed

## 微交互物理感与滚动点亮 — 2026-08-28

### 一、按压反馈

- 事件委托挂在 `.app-frame` 上，覆盖工具按钮、模式按钮、导航、能力卡、快捷提问、上下文 chip 移除键、任务记录条、来源卡、继续展开共九类控件：压下 `scale .955 / power2.out`，抬起 `scale 1 / back.out(1.6)`。已有按压管线的 `.memory-file` / `.start-button` / `.files-upload-button` 排除在外。
- 能力卡另加 hover 抬起（`y: -3`）。press 写 `scale`、hover 写 `y`，两条通道互不覆盖。
- **过程中发现的真问题**：这些控件的 CSS 里都挂着 `transition: transform`，会和 GSAP 抢同一通道——GSAP 每帧写 transform，CSS 又要把它渐变过去，手感发软。已从 6 处 transition 中移除 transform，只保留 color / background / border-color。
- 证据：五类控件在 `pointerdown` 后均正确创建按压 tween（`scale: 0.955`、`ease: power2.out`），非目标元素（`.task-thread-head h1`）不被误伤。

### 二、回答正文滚动点亮

- `ScrollTrigger.batch` 作用于 `.answer-reveal-piece`，`scroller` 指向 `.task-thread`（滚动容器不是窗口），`once: true`，进入时 `stagger: .07` 逐条点亮。
- `.answer-card` 从任务内容的整块淡入里拆出来，只做位移；段落 opacity 归 ScrollTrigger，避免容器与内容两层相乘。
- 证据：落定时第 1 条已点亮、其余 5 条待滚动；滚到中段与底部全部点亮；`progressive: true` 确认是渐进而非一次性全亮。

### 两处踩坑

1. **触发器不能在转场中创建**：最初在 `activeNav` 变化时立即建 batch，此刻 `.task-view` 仍是 `visibility: hidden`，`getBoundingClientRect` 全为 0，算出的触发位置全错，首屏那条始终不亮。改为延迟 .62s（转场落定后）再建。
2. **触发线收太紧会留下空卡片**：`start: "top 94%"` 时首屏那条的顶边在 468、触发线在 472，**差 4px 不触发**——用户不滚动就只看到一张空的回答卡。改为 `start: "top bottom"`，进入容器可视区即点亮。

### 回归

六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。产物 JS 从 446KB 增至 **522KB**（+76KB，ScrollTrigger 插件）。

### 未覆盖

- 后台标签下 GSAP ticker 调度不稳，**按压动画的播放过程（最低点、回弹过冲）没能采到可信时序**；验证的是 tween 是否正确创建及其参数。前台环境应手动确认手感。
- 触摸设备上的按压反馈未验证。
- 文件页没有独立滚动容器（内容适配容器高度），未接入滚动点亮。

final result: passed

## 资料卡点击动效重做 — 2026-08-28

用户反馈点击文件的动效"不好看"，截图里相邻卡片上有一块突兀的白色方块。

### 诊断

一次点击同时铺开六组动画：卡片转到 `-2.8°`、涟漪扩散到 `3.15` 倍、详情面板暗到 `.58` 再亮回、一颗飞行光点从卡片射向面板、整行 `.memory-orbit` 挤压、伴生体核心脉冲。两个具体问题：

- 截图里的白块就是 `.file-selection-signal`——10px 亮白圆点带 90px 拖尾，在浅色背景上非常突兀，飞行途中会盖住相邻卡片，看着像渲染残留。
- 选中态把卡片硬转到 `-2.8°`。卡片自身的 rest 倾斜只有 `-0.45 / 0.7 / 1.3` 度，硬转过去在这个尺寸上读起来是"歪了"，不是"被选中"。

### 处理

- 选中态改为 `y: -4`、`rotation` 取自身 rest 的 35%、`scale 1.012`；三处定义（初始化、`fileRestState`、`selectFile`）统一抽成 `fileSelectedState`。
- 选中不再使用飞行光点。该元素保留给上传场景——"资料存进资料库、信号飞向伴生体"的语义是成立的。
- 去掉整行挤压；涟漪从 `3.15` 倍收到 `2.2` 倍、起始透明度 `.82` → `.5`；详情面板从"暗到 .58 再亮"改为压到 `.74` 的轻交叉淡入；伴生体核心脉冲从 `1.055` 收到 `1.03`。

### 证据

- 点击后的按压 tween：`y: -4`、`rotation: 0.455`（= rest `1.3` × `.35`）、`scaleX: 1.012`、`ease: back.out(1.4)`、`duration: .42`，与设计值一致。
- 点击时 `.file-selection-signal` 的 tween 数为 **0**，飞行光点确认不再参与。
- 详情面板为两段交叉淡入（`autoAlpha .74` → `1`），不再有大幅明暗跳变。
- 视觉复核：选中的「设计评审纪要.pdf」无可见歪斜，相邻卡片上无白块。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 未覆盖

- 后台标签下 GSAP ticker 调度不稳，落定后的 `transform` 采样为 identity，**动画播放过程未取得可信时序**；验证的是 tween 参数与目标值。
- 连续快速点击多张卡的打断表现未测。

final result: passed

## 涟漪跟随点击位置 — 2026-08-28

原先 `.memory-chip-ripple` 固定在 `right: 7px; top: 50%`（卡片右侧垂直居中），无论点哪里都从同一个点化开。

### 处理

- `selectFile` 增加第三个参数接收原始事件，按 `clientX/clientY` 减去卡片边界算出落点，用 `left`/`top` + `xPercent: -50, yPercent: -50` 定位涟漪。
- 扩散半径按落点到四角的最大距离计算（`Math.hypot` 取最大值），保证从任意位置点击都能盖满整张卡。
- 涟漪外观从 1px 描边圆环改为柔和径向渐变——放大近 20 倍时描边会被一起缩放成粗线，渐变则始终是一圈化开的水波。
- `.memory-file` 从 `overflow: visible` 改为 `hidden`，否则涟漪会溢出去盖住相邻卡片。
- 键盘触发（Enter/Space 无坐标）落回卡片中心。

### 证据

| 点击位置 | 涟漪原点 | 扩散倍数 |
| --- | --- | --- |
| 左边缘（8%） | `left 13px / top 27px` | 17.7 |
| 正中间（50%） | `left 85px / top 27px` | 10.0 |
| 右下角（95%, 90%） | `left 162px / top 52px` | 18.9 |

点中间只需 10 倍即可盖满，点边角需要 17–19 倍——扩散幅度随落点变化，符合预期。

- 中间态实测：`transform: matrix(13.04, …)`、`opacity: .17`，涟漪正在放大并淡出；`.memory-file` 的 `overflow` 为 `hidden`，视觉复核确认光晕被卡片裁住、未溢出到相邻卡。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 未覆盖

- `overflow: visible` 改为 `hidden` 后，卡片上是否还有依赖溢出的装饰未逐一排查；当前视觉复核未见异常。
- 触摸设备上的落点（`touch` 事件的坐标来源）未验证。

final result: passed

## 涟漪裁切方式修正 + 触摸与键盘落点补验 — 2026-08-28

承接上一条。上一轮为了裁住涟漪给 `.memory-file` 加了 `overflow: hidden`，当时把"是否有依赖溢出的装饰"列为未排查项。这一轮排查后确认**确实裁错了东西**。

### 裁错了什么

`.memory-file::before` 是卡片下方的柔光——`left/right: -11px`、`bottom: -12px`、`filter: blur(7px)` 的绿青双径向渐变，选中与 hover 时亮到 `opacity: .68`。它整个在卡片边界之外，被 `overflow: hidden` 完全裁掉。

### 处理

- `.memory-file` 恢复 `overflow: visible`。
- 涟漪改由独立的裁切层承担：`.memory-file > .memory-ripple-clip`，`inset: 0` + `overflow: hidden` + `border-radius: inherit`。
- **选择器必须带父级**：初版写成 `.memory-ripple-clip`（特异性 0,1,0），被同文件里的 `.memory-file > span`（0,1,1）盖掉了 `position: absolute`，裁切层退化成 grid item——实测尺寸比卡片小 `140 × 55`，等于完全没起作用。改为 `.memory-file > .memory-ripple-clip`（0,2,0）后正常。

### 证据

- 裁切层：`position: absolute`、与卡片尺寸差 `2 × 2`（正好是 1px 边框的两倍）、`border-radius: 13px` 与卡片一致；卡片自身 `overflow: visible`。
- 柔光恢复：选中卡 `::before` 的 `opacity` 为 **0.68**，未选中为 **0**。
- 涟漪仍被裁：点右下角时涟漪盒子超出裁切层边界，但由 `overflow` 裁掉，视觉复核未溢出到相邻卡。
- **触摸落点**：以 `pointerType: touch` 的坐标点击，涟漪原点为 `left 20px / top 12px`，与传入坐标完全一致。
- **键盘兜底**：`clientX/clientY` 为 0 时落回卡片中心 `85px / 29px`（卡片 170 × 58 的正中）。
- 六个校验脚本全绿；`npm run build` 与 `npm run test:sites`（4/4）通过。

### 更正

上一条记录里"`.memory-file` 必须 `overflow: hidden`"的说法有误，已在 AGENTS.md 中更正为由独立裁切层承担。

final result: passed
