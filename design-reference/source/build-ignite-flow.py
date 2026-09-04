"""从点火图的脉络亮度算一张真正的"沿通路"测地距离场，用作开场点火的闸门贴图。

在本目录的上两级（原型根目录）执行：python3 design-reference/source/build-ignite-flow.py
依赖 Pillow + numpy。输出 companion-ignite-flow-v2.png，再转成 public/assets 下的 WebP。

亮 = 先到（核心），暗 = 后到（末梢）。距离沿脉络累积，不是到核心的直线距离。
"""
import numpy as np
from PIL import Image, ImageFilter

SRC = "design-reference/source/companion-ignite-map-v1-src.png"
FIG = "design-reference/source/ai-companion.png"
OUT = "design-reference/source/companion-ignite-flow-v2.png"

CORE = (0.436, 0.556)
OUT_W, OUT_H = 626, 949
CALC_DIV = 2  # 计算分辨率 = 输出的一半，场是平滑的，不丢信息


def maxpool(a, k):
    h, w = a.shape
    h, w = h // k * k, w // k * k
    return a[:h, :w].reshape(h // k, k, w // k, k).max(axis=(1, 3))


ignite = np.asarray(Image.open(SRC).convert("L")).astype(np.float32) / 255.0
fig = Image.open(FIG)
alpha = np.asarray(fig.split()[-1]).astype(np.float32) / 255.0
print("ignite", ignite.shape, "figure alpha", alpha.shape)

# 缩到计算分辨率。脉络是细线，必须 max-pool，均值池化会把它们抹平。
cw, ch = OUT_W // CALC_DIV, OUT_H // CALC_DIV
k = max(1, round(ignite.shape[1] / cw))
L = maxpool(ignite, k)
L = np.asarray(Image.fromarray((L * 255).astype(np.uint8)).resize((cw, ch), Image.BILINEAR)).astype(np.float32) / 255.0
A = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((cw, ch), Image.BILINEAR)).astype(np.float32) / 255.0
print("calc grid", L.shape, "lit frac", (L > 0.07).mean())

# 代价场：脉络上便宜，脉络之间贵。指数压一下让亮度差被放大。
K_OFF, P = 26.0, 0.75
cost = 1.0 + K_OFF * np.power(np.clip(1.0 - L, 0, 1), P)
# 轮廓外更贵，避免距离从体外抄近路绕过去
cost = np.where(A > 0.25, cost, cost * 6.0)

H, W = cost.shape
INF = 1e9
d = np.full((H, W), INF, np.float32)
cy, cx = int(H * CORE[1]), int(W * CORE[0])
d[cy - 1:cy + 2, cx - 1:cx + 2] = 0.0

DIRS = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
        (-1, -1, 1.4142), (-1, 1, 1.4142), (1, -1, 1.4142), (1, 1, 1.4142)]


def shift(a, dy, dx, fill):
    out = np.full_like(a, fill)
    ys, yd = (slice(dy, None), slice(None, -dy or None)) if dy > 0 else \
             ((slice(None, dy), slice(-dy, None)) if dy < 0 else (slice(None), slice(None)))
    xs, xd = (slice(dx, None), slice(None, -dx or None)) if dx > 0 else \
             ((slice(None, dx), slice(-dx, None)) if dx < 0 else (slice(None), slice(None)))
    out[ys, xs] = a[yd, xd]
    return out


# 并行 Bellman-Ford：每轮沿八个方向做一次 min-plus 松弛
for it in range(1200):
    prev = d
    best = d
    for dy, dx, ln in DIRS:
        nb = shift(d, dy, dx, INF)
        nbc = shift(cost, dy, dx, 1.0)
        best = np.minimum(best, nb + 0.5 * (cost + nbc) * ln)
    d = best
    if it % 120 == 0:
        reach = (d < INF).mean()
        print(f"  iter {it:4d} reached {reach*100:5.1f}%  max {d[d<INF].max():9.1f}")
    if it > 200 and np.max(prev - d) < 1e-3:
        print(f"  converged at iter {it}")
        break

lit = (L > 0.07) & (A > 0.25)
d = np.where(np.isfinite(d) & (d < INF), d, d[d < INF].max())
print("distance range", d.min(), d.max(), "lit px", lit.sum())

# 直方图均衡：只按脉络像素的到达顺序拉平，这样闸门线性推进 = 脉络线性点亮，
# 节奏完全交给 GSAP 的缓动去调，贴图本身不带节奏偏见。
dv = d[lit]
qs = np.quantile(dv, np.linspace(0, 1, 513))
qs = np.maximum.accumulate(qs)
rank = np.interp(d, qs, np.linspace(0, 1, 513))

g = 1.0 - rank                       # 核心=1（先到），末梢=0（后到）
g = 0.055 + 0.945 * g                # 末梢留一点底，闸门推到头时不会有一段死黑
g[d <= 1e-6] = 1.0

img = Image.fromarray(np.clip(g * 255, 0, 255).astype(np.uint8), "L")
img = img.resize((OUT_W, OUT_H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.6))
img.convert("RGB").save(OUT)
print("wrote", OUT, img.size)

chk = np.asarray(img).astype(np.float32)
for name, y0, y1, x0, x1 in [
    ("核心区", .52, .60, .36, .52), ("上胸/颈", .28, .36, .32, .58),
    ("肩背", .38, .46, .15, .30), ("上臂", .55, .70, .10, .22),
    ("前臂/腕", .80, .95, .05, .18), ("头顶", .02, .10, .30, .60),
]:
    r = chk[int(OUT_H * y0):int(OUT_H * y1), int(OUT_W * x0):int(OUT_W * x1)]
    print(f"  {name:8s} 均值 {r.mean():6.1f}  p90 {np.percentile(r, 90):6.1f}")
