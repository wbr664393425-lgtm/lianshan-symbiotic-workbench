#!/usr/bin/env python3
"""Remove a connected light/dark matte from generated companion keyframes."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def connected_background(rgb: np.ndarray) -> np.ndarray:
    rgb_f = rgb.astype(np.float32)
    high = rgb_f.max(axis=2)
    low = rgb_f.min(axis=2)
    mean = rgb_f.mean(axis=2)
    chroma = high - low

    border = np.concatenate((rgb_f[0], rgb_f[-1], rgb_f[:, 0], rgb_f[:, -1]))
    border_mean = float(border.mean())
    if border_mean > 128:
        candidate = (mean > 218) & (chroma < 34)
    else:
        candidate = (mean < 64) & (chroma < 48)

    count, labels, stats, _ = cv2.connectedComponentsWithStats(
        candidate.astype(np.uint8), connectivity=8
    )
    if count <= 1:
        raise RuntimeError("No removable background component was found")

    edge_labels = np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1]))
    edge_labels = edge_labels[edge_labels != 0]
    values, counts = np.unique(edge_labels, return_counts=True)
    background_label = int(values[np.argmax(counts)])
    background = labels == background_label

    # Checkerboards can leave large enclosed islands between the arms and torso.
    # Remove those matte components too, while retaining small glass highlights.
    if border_mean > 128:
        minimum_matte_area = max(480, int(rgb.shape[0] * rgb.shape[1] * 0.0003))
        for label in range(1, count):
            if stats[label, cv2.CC_STAT_AREA] >= minimum_matte_area:
                background |= labels == label
    return background


def remove_background(source: Path, png_target: Path, webp_target: Path, width: int) -> None:
    image = Image.open(source).convert("RGB")
    rgb = np.asarray(image)
    background = connected_background(rgb)
    foreground = (~background).astype(np.uint8)

    distance = cv2.distanceTransform(foreground, cv2.DIST_L2, 3)
    alpha = np.clip(distance * 150, 0, 255).astype(np.uint8)
    rgba = np.dstack((rgb, alpha))
    cutout = Image.fromarray(rgba, "RGBA")

    height = round(cutout.height * width / cutout.width)
    cutout = cutout.resize((width, height), Image.Resampling.LANCZOS)
    png_target.parent.mkdir(parents=True, exist_ok=True)
    cutout.save(png_target, optimize=True)
    cutout.save(webp_target, "WEBP", quality=84, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("png_target", type=Path)
    parser.add_argument("webp_target", type=Path)
    parser.add_argument("--width", type=int, default=700)
    args = parser.parse_args()
    remove_background(args.source, args.png_target, args.webp_target, args.width)


if __name__ == "__main__":
    main()
