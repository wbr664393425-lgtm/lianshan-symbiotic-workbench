export const PAGE_MOTION = Object.freeze({
  duration: 1.16,
  flipDuration: .68,
  beats: Object.freeze({
    idle: 0,
    navPress: .03,
    attention: .08,
    release: .14,
    migration: .26,
    structure: .42,
    content: .62,
    connect: .82,
    confirm: 1.02,
    settled: 1.16,
  }),
});

export const COMPANION_MOTION = Object.freeze({
  homeToWork: .68,
  workToWork: .56,
  workToHome: .58,
  previewIn: .34,
  previewOut: .22,
});

export function getFlipDuration(progress, destination) {
  const distance = Math.abs(destination - progress);
  return Math.max(.2, PAGE_MOTION.flipDuration * distance);
}

export function getCompanionShift(viewportWidth) {
  return viewportWidth <= 820 ? 72 : 230;
}

// 动效的语气分层。expo.out 在前 20% 的时间里走完 80% 的距离，
// 同样时长下比 power3.out 感知更快、尾部更从容——这是"显现"该有的曲线；
// 退场则要干脆，用 in 类曲线，别让离开的东西拖住视线。
// 放在这里而不是 App.jsx，是为了让 TaskWorkspace / FilesWorkspace / SettingsWorkspace
// 都能取到同一套曲线，新增动画一律从里面选，不要再随手写 power3.out。
// 例外：gsap.quickTo 的指针跟随与滑块拖拽保持 power3.out——跟随类需要平滑而不是锐利。
export const EASE = Object.freeze({
  reveal: "expo.out",       // 显现：锐利起步、长尾收束
  glide: "power4.out",      // 位移滑行
  exit: "power2.in",        // 退场：干脆
  swap: "power2.inOut",     // 双向交接
  settle: "back.out(1.6)",  // 落定确认
});
