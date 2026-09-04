#!/usr/bin/env python3
"""把黑底自发光原图的亮度烘进 alpha，输出可直接叠加的 RGBA webp。

生图模型只能稳定产出"纯黑底 + 自发光"的图，但这套原型的规矩是叠层一律靠真
alpha，不许靠 mix-blend-mode: screen——`.companion-wrap` 带 transform、
`.companion-body` 带 will-change，两者各自是独立混合组，screen 够不到底下的
幕布，只会在组内跟透明背景相混，黑底就实打实画成一个黑方块。

变换和运行时那个 SVG feColorMatrix 完全等价：
    alpha = .3R + .59G + .11B
    rgb   = 原色 / alpha          （去预乘，否则叠上去会发灰）
去预乘之后暗处的色噪会被放大，所以低于 floor 的像素直接判为全透明。

用法：
    python3 scripts/bake-luma-alpha.py <输入.png> [输出.webp]
    python3 scripts/bake-luma-alpha.py --batch name1 name2 ...
批量模式从 design-reference/source/<name>.png 读，写到 public/assets/<name>.webp。
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "design-reference" / "source"
ASSET_DIR = ROOT / "public" / "assets"

# 亮度低于这一档的像素判为全透明。太低会把黑底里的编码噪点也留下来
# （去预乘会把它们放大成彩色麻点），太高会啃掉脉络末梢的渐隐。
FLOOR = 6 / 255


def bake(path: Path) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0
    alpha = rgb[:, :, 0] * .3 + rgb[:, :, 1] * .59 + rgb[:, :, 2] * .11
    alpha[alpha < FLOOR] = 0.0

    safe = np.maximum(alpha, 1e-4)[:, :, None]
    unpremultiplied = np.clip(rgb / safe, 0.0, 1.0)
    unpremultiplied[alpha == 0] = 0.0

    out = np.concatenate([unpremultiplied, alpha[:, :, None]], axis=2)
    return Image.fromarray((out * 255).round().astype(np.uint8), mode="RGBA")


def report(name: str, source: Path, target: Path, image: Image.Image) -> None:
    a = np.asarray(image)[:, :, 3]
    print(
        f"{name:26s} {image.size[0]:>5}x{image.size[1]:<5} "
        f"透明 {(a == 0).mean() * 100:5.1f}%  alpha 均值 {a.mean():5.1f}  "
        f"{source.stat().st_size // 1024:>4}KB → {target.stat().st_size // 1024:>4}KB"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="+")
    parser.add_argument("--batch", action="store_true", help="按资产名批量处理")
    parser.add_argument("--quality", type=int, default=92)
    args = parser.parse_args()

    if args.batch:
        jobs = [(name, SOURCE_DIR / f"{name}.png", ASSET_DIR / f"{name}.webp") for name in args.inputs]
    else:
        source = Path(args.inputs[0])
        target = Path(args.inputs[1]) if len(args.inputs) > 1 else source.with_suffix(".webp")
        jobs = [(source.stem, source, target)]

    for name, source, target in jobs:
        if not source.exists():
            raise SystemExit(f"找不到原图：{source}")
        image = bake(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "WEBP", quality=args.quality, method=6)
        report(name, source, target, image)


if __name__ == "__main__":
    main()
