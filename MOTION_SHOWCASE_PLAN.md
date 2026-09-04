# 元枢 · 全交互动效构思

## 0. 一句话

界面上的每一次操作，都是能量在「你的手 → 元枢的核心 → 结果的落点」之间走一趟。
**炫酷来自这条链路被看见，不来自更多的粒子。**

现在的问题不是动效不够多，而是**语汇不统一**：开场是一套（点火/传导），任务页是一套（光束/波纹），
文件页是一套（涟漪/信号），设置页几乎没有。同一个系统里的能量应该长得一样。

## 1. 四种能量语态

所有动效只归入这四类，新增动效必须能说出自己属于哪一类，否则就是装饰，不做。

| 语态 | 方向 | 含义 | 时长档 |
| --- | --- | --- | --- |
| **蓄 Charge** | 末梢 → 核心 | 用户在给系统输入 | 慢，可累积，可打断 |
| **放 Discharge** | 核心 → 落点 | 系统开始工作 | 快，一次性，不可逆 |
| **导 Conduct** | 沿脉络推进 | 系统正在工作 | 匀速，可停 |
| **结 Crystallize** | 落点收束成形 | 系统交付了 | 中速，带一次过冲 |

外加一个反向语态：**停摆 Halt**（核心 → 熄灭），只用于停止执行和恢复默认。

## 2. 三条硬约束（继承现有系统，不许破）

1. **一次交互只讲一件事**，同时动的层不超过三个。（已踩过：点资料卡曾同时铺开六组动画，视线被扯散反而显得廉价。）
2. **只动 transform / opacity**。发光靠素材自带的 alpha，不靠运行时 `filter`；`will-change` 不写进常驻样式。
3. **`prefers-reduced-motion` 下一律直达终态**，保留导航选中、开关、上传进度、错误态这些必要反馈。

## 3. 逐交互清单

标注：`✅ 已有` / `🔧 增强` / `🆕 新增`。「素材」列写需要哪张新图，`—` 表示纯代码。

### 3.1 首页

| # | 交互 | 状态 | 语态 | 设计 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 1 | 首次进入 | ✅ | — | 七幕核心点火，6.52s，5.5s 交棒 | — |
| 2 | 刷新进入 | ✅ | — | 入场时间轴 + 伴生体独立显现 | — |
| 3 | 指针移动 | ✅ | — | 光学跟随 + 四层阻尼视差 | — |
| 4 | 能力卡悬停 | ✅ | — | 抬起 3px + 容器级指针光 | — |
| 5 | **输入框打字** | 🆕 | 蓄 | 输入条左缘的能量导轨随字数从 0 亮到 1（`@property` 注册的数值，连续补间而不是每键一次 tween）；每落一个词（空格/标点）在光标处推一次 12px 的横向光晕，160ms；伴生体核心亮度同步从 .68 抬到 .82。停手 1.2s 后缓落。 | `composer-charge-rail-v1` |
| 6 | **工具开关**（资料库 / 联网） | 🔧 | 蓄 | 开启时从按钮向伴生体对应区域飞一颗信号点（资料库→头部记忆环，联网→肩部），到达后该区域亮一次；关闭时反向收回。按钮图标做一次 180° `rotateY` 翻面。 | — |
| 7 | **快捷提问 / 场景模板** | 🆕 | 放 | 用 Flip 把被点卡片的标题克隆体从卡片飞进输入框首行，落地的同一拍输入框按 40ms/字打出（封顶 600ms），不是瞬间填充。 | — |
| 8 | 模式滑块 拖拽/点击 | ✅ | — | 玻璃块阻尼拖拽 + 速度形变 + 弹簧吸附 | — |
| 9 | **模式切换的语义回声** | 🆕 | 蓄 | 切「深度」核心转为更饱和的红并放慢一档呼吸；切「快速」呼吸加快一档；滑块下的焦散层换底色（自动=青柠 / 快速=琥珀 / 深度=靛蓝）。 | `caustic-sheet-v1` |
| 10 | 附件拖入 / 选择 | ✅ | — | 拖放层 + chip 弹入 | — |
| 11 | **附件 chip 移除** | 🆕 | 结 | 向下塌陷 + 横向收窄 + 三个光点向下溃散，180ms。现在是直接消失。 | — |
| 12 | 主按钮 悬停/按压/释放 | ✅ | — | 一条 GSAP 按压管线 + 指针光斑 | — |
| 13 | **提交任务** | 🔧 | 放 | 现有信号飞向核心保留；**新增最炫的一笔**：信号到达的同一拍，核心推出一圈细环（scale .4→2.4，opacity .7→0，520ms），同时伴生体脉络沿测地距离场从核心向外亮一次（复用开场的闸门技术，0.9s 走完，比开场快一倍）。 | —（复用点火图+流场图） |
| 14 | 空内容提交 | ✅ | — | 信号转交输入框 + 输入条回弹 | — |

### 3.2 任务页

| # | 交互 | 状态 | 语态 | 设计 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 15 | **阶段推进 0→3** | 🔧 | 导 | 光束改用真实导管贴图（内芯+外辉+流动纹），替代现在的纯渐变 div；到达步骤时图标点亮的同一拍推出一圈 6px 的环；伴生体上该阶段对应的身体区域（1=头 2=胸 3=手 4=全身）用流场闸门局部亮一次。 | `energy-conduit-v1` |
| 16 | 执行完成 | ✅ | 结 | 四个原点收回核心 + 完成波纹 + 核心过冲 | — |
| 17 | **停止执行** | 🆕 | 停摆 | 三拍共 620ms：①光束从两端向中间断开、碎成三段熄灭（160ms）②当前步骤的环从呼吸变骤停——弹到 1.15 再落回 1，色由青转灰（120ms）③伴生体脉络从核心开始逆向褪色（流场闸门反向推，420ms），核心转暗红并停止呼吸。 | `companion-halt-map-v1` |
| 18 | **重新执行** | 🆕 | 蓄 | 停摆的逆过程但不机械倒放：脉络从核心重新点亮（流场正向 520ms），按钮图标转一圈 360°，执行轨道的格子逐个复位成待执行。 | —（复用 17 的素材） |
| 19 | **切换任务记录** | 🔧 | 结 | 左侧选中指示条从上一条滑到这一条（一块玻璃，与导航玻璃同语言）；右侧正文做一次换页——整块左退 10px 淡出、新内容从右 10px 进入（220ms）；执行轨道填充条按新任务进度重新长出。 | — |
| 20 | **继续追问** | 🔧 | 蓄 | 输入条展开的同时，从按钮向输入框飞一道二次贝塞尔光迹（260ms），落点即光标位置，输入框边缘亮一圈。 | — |
| 21 | **查看成果** | 🔧 | 结晶 | 去掉现在 `result-reveal` 里的 `filter: blur(5px)`（每帧重绘），改为「结晶」：三片半透明晶面从中心向外展开，合拢的同一拍正文落位。 | `crystal-facet-v1` |
| 22 | 回答段落滚动点亮 | ✅ | — | ScrollTrigger.batch 逐条 | — |
| 23 | 输入条滚动让位 | ✅ | — | 连续收起量，不跳变 | — |

### 3.3 文件页

| # | 交互 | 状态 | 语态 | 设计 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 24 | 进入文件页 | ✅ | — | 记忆态转场 + 四条轨道展开 | — |
| 25 | 资料卡悬停 | ✅ | — | 指针倾斜跟随 | — |
| 26 | 资料卡点击 | ✅ | — | 抬起 + 落点涟漪 + 详情交叉淡入 + 核心脉冲 | — |
| 27 | **搜索聚焦** | 🔧 | 导 | 伴生体头部出现记忆检索环并慢速扫描（**只在聚焦期间**，离焦即停）；四条轨道的活跃度按匹配数排序，命中多的更亮。 | `companion-scan-ring-v1` |
| 28 | 搜索无结果 | ✅ | — | 轨道降活跃 + 记忆环收拢 | — |
| 29 | **上传资料** | 🔧 | 蓄 | 现有信号→核心→轨道保留；索引进度改为「沿轨道流动的一道光」，不是普通进度条。 | —（复用 15 的导管） |
| 30 | **「用于当前对话」** | 🆕 | 放 | 详情面板折叠成信号：面板缩到该资料在轨道上的卡片位置，再沿贝塞尔飞向输入条，落地变成一枚附件 chip（Flip + 路径），420ms。 | — |
| 31 | 外部文件拖入 | ✅ | — | 接收反馈 + 拖放层 | — |

### 3.4 设置页

| # | 交互 | 状态 | 语态 | 设计 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 32 | 进入设置页 | ✅ | — | 三个语义锚点淡入 | — |
| 33 | **分类切换** | 🔧 | — | 左栏选中指示改用同一块滑动玻璃，与导航、模式滑块统一 | — |
| 34 | 分段控件切换 | ✅ | — | 玻璃块滑动 | — |
| 35 | **开关切换** | 🔧 | 结 | 拨块滑动的同时，轨道底色从灰「注满」青柠（`@property` 注册的百分比，一条真实的填充而不是整块换色）；对应语义锚点脉冲一次（已有）。 | — |
| 36 | 偏好改变 → 锚点回应 | ✅ | — | 锚点脉冲 + 标签轻推 | — |
| 37 | **保存** | 🆕 | 结晶 | 三个锚点按序各亮一次（stagger .08），最后一颗亮起的同一拍，保存按钮外圈收拢一圈细环并在中心留下 Check；文案换「已保存」，1.6s 后换回。 | — |
| 38 | **恢复默认** | 🆕 | 停摆 | 被改过的行同时回弹（y −3 → 0，stagger .03），锚点整体暗一拍再恢复。 | — |

### 3.5 全局

| # | 交互 | 状态 | 语态 | 设计 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 39 | 导航悬停/聚焦预演 | 🔧 | — | 任务、文件已有；**补上设置的预演**：伴生体浮现三点偏好锚点微光，不展开轨道 | — |
| 40 | 页面切换 | ✅ | — | 可反向的单主体路由时间轴 | — |

## 4. 素材清单

**统一交付规则**

- 一律输出 **PNG，纯黑背景 `#000000`**（不要透明背景、不要棋盘格、不要白底）。抠图交给 `scripts/remove-keyframe-background.py`，它按连通域剥离底色并烘进 alpha，比模型直出的透明通道干净得多。
- 与人物对位的三张（A/B），**必须以 `design-reference/source/ai-companion.png` 作为参考图/控制图**，轮廓、姿态、比例严格一致，画布同为 **1252×1898**（即 626:949 的 2 倍）。对不齐的话所有 `clip-path` 分区和 `transform-origin: 43% 56%` 全部失效。
- 原图放 `design-reference/source/`，转换后的 `.webp` 放 `public/assets/`。
- 不要文字、不要签名、不要边框、不要景深虚化、不要人物脸部细节。

### A. `companion-halt-map-v1` — 停摆态脉络（必需）

> A full-body neural energy map of a translucent synthetic humanoid, front-facing, standing relaxed with arms at the sides, cropped at mid-thigh — exactly matching the reference figure's silhouette, pose, proportions and framing, pixel-aligned. Render ONLY the internal neural pathways as self-illuminated lines on a pure black background; the body itself must not be drawn, no skin, no outline, no silhouette fill. The pathways are a cooling-down, powered-off state: desaturated slate blue-grey (#5C7A86 to #8FA9B2), overall dim, with visible broken gaps and severed line ends scattered along the limbs and torso, as if current stopped mid-flow. A few endpoints have a faint residual ember glow. The chest core at 43.6% width / 55.6% height is the dimmest point, a nearly extinguished dark red ring. No green, no cyan, no bright highlights, no particles, no text. Peak brightness must stay below 60% — this is an unpowered state. Canvas 1252x1898, pure black background #000000.

用途：#17 停止执行、#18 重新执行（反向复用）。

### B. `companion-scan-ring-v1` — 记忆检索环（必需）

> A head-and-shoulders memory-retrieval overlay for a translucent synthetic humanoid, front-facing, exactly matching the reference figure's head position, size and tilt, pixel-aligned on a 1252x1898 canvas. Render ONLY the overlay on a pure black background: a thin concentric halo ring system around and slightly behind the head (three nested rings, 1-2px stroke, decreasing opacity outward), plus one soft wedge-shaped scanning sector sweeping from the head's centre, and a sparse arc of small index tick marks along the outermost ring. Colour is a cool memory cyan (#5DD4E0 to #A8ECF2) with a faint pearl-white inner edge. The body, face, shoulders and neck must not be drawn. Everything below the collarbone is pure black. Restrained and instrument-like, not magical — this reads as a retrieval apparatus, not an aura. No particles, no lens flare, no text, no glow bloom larger than the head itself. Canvas 1252x1898, pure black background #000000.

用途：#27 搜索聚焦。

### C. `energy-conduit-v1` — 能量导管（必需）

> A horizontal energy conduit texture for a UI beam, on a pure black background. One straight horizontal channel spanning the full width: a bright hot white-lime core line down the centre (#EAFFC9), wrapped in a tighter saturated lime sheath (#8BDB3E), fading outward into a soft transparent halo. Along the channel, subtle irregular brightness nodes suggest current flowing left to right, and a few very fine filament strands run parallel to the main line. The left and right edges must fade to pure black so the texture can be stretched and tiled seamlessly along its length. Perfectly horizontal, perfectly centred vertically, no perspective, no arrowheads, no endpoints, no particles, no text. Canvas 1024x64, pure black background #000000.

用途：#15 执行光束、#29 索引进度流光。

### D. `crystal-facet-v1` — 结晶面片（必需）

> Three separate translucent crystal facets arranged side by side on a pure black background, each a flat angular polygon shard of pearl-white frosted glass. Facet 1 is a wide shallow quadrilateral, facet 2 a narrow tall triangle, facet 3 an irregular pentagon. Each shard has a bright thin refractive edge highlight along its upper-left contour, a soft internal gradient from translucent white to near-transparent, and one faint lime-green refraction streak crossing its interior. Flat-on view, no perspective, no thickness, no drop shadow, no cast light on the background. The three shards must not touch or overlap and must be separated by pure black. Cool pearl tone, restrained, optical rather than gemlike. Canvas 1536x512, pure black background #000000.

用途：#21 成果结晶。

### E. `caustic-sheet-v1` — 焦散光片（可选，建议做）

> A soft optical caustic light sheet on a pure black background: the wavering bright pattern that light makes after passing through moving water, rendered in PURE WHITE only, no colour at all. Gentle interlacing bright filaments forming irregular loops and cells, brightest in the centre and dissolving toward all four edges into pure black. Organic and continuous, low contrast, no hard edges, no sparkles, no star shapes, no text. This is a tintable white mask — any colour cast will make it unusable. Canvas 512x256, pure black background #000000.

用途：#9 模式滑块焦散（白色贴图 + 底色换色，一张顶三张）、输入条内层折射（替代现在的 `blur(8px)` 渐变，省一次滤镜）。

### F. `composer-charge-rail-v1` — 输入条能量导轨（可选）

> A slim vertical energy rail for a UI edge, on a pure black background. One narrow vertical bar occupying the centre of the canvas: a bright lime core (#8BDB3E) at the bottom fading upward through a dimmer green into pure black at the top, with a soft symmetric horizontal halo bleeding a few pixels to each side. The bottom end terminates in a small rounded bright cap. Subtle granular texture inside the bar suggests stored charge rather than a flat gradient. Perfectly vertical, no perspective, no text, no particles, no endpoints other than the bottom cap. Canvas 64x512, pure black background #000000.

用途：#5 打字蓄能。

### 脚本派生，不用生成

| 产物 | 来源 | 做法 |
| --- | --- | --- |
| `companion-charge-flow-v1` | `companion-ignite-flow-v2.webp` | 亮度取反（`255 - v`），得到「末梢先亮、核心最后亮」的汇聚流场，用于 #13 提交蓄能与 #18 重新执行 |
| 停摆的反向推进 | 同上流场 + `companion-halt-map-v1` | 闸门阈值反向推，不需要第二张图 |

## 5. 实施顺序

不需要素材的先做，素材到位再做第二批。每批做完取真实浏览器证据 + 跑一遍性能基线再进下一批。

**第一批（零素材）—— 已完成**

| 项 | 状态 | 备注 |
| --- | --- | --- |
| #6 工具开关信号 | ✅ | 含图标 180° 翻面 |
| #7 快捷提问飞入 | ✅ | 克隆体飞入 + 40ms/字打出 |
| #11 chip 溃散 | ✅ | 光点当场造、播完删 |
| #13 提交冲击波 + 脉络回声 | ✅ | 新增常驻 `.companion-echo`，滤镜移出开场分支，贴图空闲预热 |
| #19 切换任务换页 | ✅ | 退场 `onComplete` 后才提交 state |
| #20 追问光迹 | ✅ | 两轴不同缓动合出弧线 |
| #30 用于当前对话 | ✅ | 面板收一下 + 信号飞向输入条 |
| #33 设置分类玻璃 | ✅ | 排查后发现早已实现，未改动 |
| #35 开关注满 | ✅ | `scaleX` 填充，撤掉整条换色 |
| #37 保存结晶 | ✅ | 补锚点按序 + 收拢环 |
| #38 恢复默认 | ✅ | 只回弹真正改过的行 |
| #39 设置预演 | ✅ | 复用常驻锚点层，无新 DOM |

验收：四套逐条脚本（settings / composer / task / echo）全绿，五个既有项目验收脚本 + `npm run build` + `npm run test:sites` 全绿，`prefers-reduced-motion` 逐条确认直达终态；性能基线无回退。

**已知取舍**：#13 的脉络回声在任务页上被内容面板遮掉大部分——伴生体在那一页本来就是右移、压到 opacity .5、藏在右栏后面的。回声峰值已从 .62 提到 .95 让它在缝隙里读得出来，但要它完整可见需要改动"提交后 380ms 才点火"这条既有编排，属于设计决策，未擅自改。

**第二批（素材相关）—— 已完成**

| 素材 | 交互 | 状态 | 备注 |
| --- | --- | --- | --- |
| C 导管 | #15 阶段推进、#29 索引流光 | ✅ | 贴图两端已收黑，可无缝拉伸 |
| A 停摆图 | #17 停止执行、#18 重新执行 | ✅ | 重新执行复用提交链路的脉络回声，不另写 |
| B 检索环 | #27 搜索聚焦 | ✅ | 改成工作区级覆盖层，否则被详情面板全遮 |
| D 晶面 | #21 成果结晶 | ✅ | 顺带撤掉 `filter: blur(5px)` |
| E 焦散 | #9 模式语义回声 | ✅ | 白贴图当遮罩 + 底色换色，一张顶三张 |
| F 导轨 | #5 打字蓄能 | ✅ | 补间注册过的 `--charge` 数值 |

素材处理：`scripts/bake-luma-alpha.py`。人物叠层走 RGB + 运行时 SVG 亮度→alpha 滤镜（烘 alpha 会把去预乘噪点留在近透明处，压缩不动：停摆图 499KB vs RGB 115KB）；UI 小件直接烘 alpha。

**流畅性验收（1x 真机）**：26 个环节全部 104–120fps。唯一超过 50ms 的一帧落在开场的 +95ms / +160ms——首屏挂载与首次栅格化，发生在黑幕之后、编排开演之前，不是动画掉帧。4x CPU 节流下六处新交互最长帧 10–32ms。合成层与纹理占用回到开工前水平（首页 25 层/235MB、任务页 28 层/287MB、文件页 37 层/280MB），六处新交互净增零合成层。

## 6. 验收

沿用上一轮定下的手法，每批做完都跑：

- 1x 下全部环节无 >50ms 的帧；4x CPU 节流下无长任务堆积。
- `UpdateLayoutTree` 单次重算元素数不接近文档总元素数。
- 新增动画一律只动 transform/opacity；新增自定义属性写在能覆盖读者的最小节点上。
- 五个既有验收脚本（动效所有权、入场连续性、导航交接、单主体、输入条可见性）+ `npm run build` + `npm run test:sites` 全绿。
- `prefers-reduced-motion` 下逐条确认直达终态。
