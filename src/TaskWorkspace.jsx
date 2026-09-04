import { ArrowClockwise } from "@phosphor-icons/react/dist/icons/ArrowClockwise";
import { ArrowRight } from "@phosphor-icons/react/dist/icons/ArrowRight";
import { Check } from "@phosphor-icons/react/dist/icons/Check";
import { Circle } from "@phosphor-icons/react/dist/icons/Circle";
import { FileText } from "@phosphor-icons/react/dist/icons/FileText";
import { Sparkle } from "@phosphor-icons/react/dist/icons/Sparkle";
import { Stop } from "@phosphor-icons/react/dist/icons/Stop";

const STEPS = [
  ["感知目标", "理解任务意图"],
  ["组织上下文", "连接资料与上下文"],
  ["执行工具", "调用所需能力"],
  ["交付成果", "整理最终回答"],
];

export function TaskWorkspace({
  phase = -1,
  finished = false,
  stopped = null,
  tasks = [],
  activeTaskId = null,
  activeTask = null,
  onSelectTask,
  onFollowUp,
  onRetry,
}) {
  const isRunning = phase >= 0 && phase < STEPS.length;
  const isStopped = stopped !== null;
  // 三种停法各有各的读数：跑着的看当前步，停下的看停在哪一步，
  // 都没有的时候给一个预览态（第 3 步），让这一栏不至于是空的。
  const previewPhase = isStopped ? stopped : phase < 0 && !finished ? 2 : phase;
  const sources = activeTask?.sources ?? [];

  return (
    <section className="task-workspace" aria-label="任务执行工作台">
      <aside className="task-history">
        <div className="task-history-head">
          <span>任务记录</span>
        </div>
        <div className="task-history-list">
          {tasks.map((task) => (
            <button
              className={task.id === activeTaskId ? "is-current" : ""}
              type="button"
              key={task.id}
              onClick={() => onSelectTask?.(task.id)}
              disabled={isRunning && task.id !== activeTaskId}
              aria-current={task.id === activeTaskId ? "true" : undefined}
            >
              <i />
              <span><strong>{task.title}</strong><small>{task.time}</small></span>
            </button>
          ))}
        </div>
        <div className="task-history-foot">
          <i />
          <span><strong>知识与工具已连接</strong><small>当前会话安全隔离</small></span>
        </div>
      </aside>

      <article className="task-thread">
        <header className="task-thread-head">
          <div>
            <span className="task-eyebrow"><i /> 当前任务</span>
            <h1>{activeTask?.title ?? "新任务"}</h1>
          </div>
          <span className={`task-live${finished ? " is-complete" : ""}${isStopped ? " is-stopped" : ""}`}>
            {finished ? <Check weight="bold" /> : isStopped ? <Stop weight="fill" /> : <Sparkle weight="fill" />}
            {finished
              ? "回答已完成"
              : isStopped
                ? `已在「${STEPS[stopped][0]}」停止`
                : isRunning
                  ? "正在生成回答"
                  : "任务上下文已就绪"}
          </span>
        </header>

        <div className="user-brief">
          <span>你</span>
          <p>{activeTask?.brief ?? ""}</p>
        </div>

        {/* 阶段推进要能被读屏听见：视觉上这一栏很清楚，但它是整个执行过程唯一的进度来源。 */}
        <section className="execution-trace" aria-label="执行轨道" aria-live="polite">
          <div className="execution-line" aria-hidden="true"><i /></div>
          {STEPS.map(([label, detail], index) => {
            const isCurrent = !finished && index === previewPhase;
            const isComplete = finished || index < previewPhase;
            const status = isComplete
              ? "已完成"
              : isCurrent
                ? (isStopped ? "已停止" : isRunning ? "执行中" : "生成中")
                : detail;
            return (
              <div
                className={`execution-step${isCurrent ? " is-current" : ""}${isComplete ? " is-complete" : ""}${isCurrent && isStopped ? " is-stopped" : ""}`}
                data-phase-index={index}
                key={label}
              >
                <span>
                  {isComplete
                    ? <Check weight="bold" />
                    : isCurrent
                      ? (isStopped ? <Stop weight="fill" /> : <Sparkle weight="fill" />)
                      : <Circle weight="regular" />}
                </span>
                <div><strong>{label}</strong><small>{status}</small></div>
              </div>
            );
          })}
        </section>

        {isStopped ? (
          <section className="answer-card is-stopped">
            <div className="answer-brand"><span>元枢</span><small>本次执行已停止</small></div>
            <p className="answer-intro">已停在「{STEPS[stopped][0]}」，没有生成回答。原来的任务描述还在，可以直接重新执行。</p>
            <button className="answer-followup" type="button" onClick={onRetry}>
              <ArrowClockwise weight="bold" />重新执行
            </button>
          </section>
        ) : (
          <section className={`answer-card${isRunning ? " is-generating" : ""}${phase >= 3 ? " is-revealing" : ""}${finished ? " is-complete" : ""}`}>
            <div className="answer-brand">
              <span>元枢</span>
              <small>{sources.length ? `基于 ${sources.length} 份资料生成` : "未引用资料"}</small>
            </div>
            <p className="answer-intro answer-reveal-piece">好的，以下是本周项目推进情况总结。</p>
            <h2 className="answer-reveal-piece">本周进展摘要</h2>
            <div className="answer-copy">
              <p className="answer-reveal-piece"><b>•</b><span><strong>核心功能进入联调阶段</strong>任务中心与资料库已完成主流程对接，关键接口响应稳定，具备下一轮集中验收条件。</span></p>
              <p className="answer-reveal-piece"><b>•</b><span><strong>设计体验完成一轮收敛</strong>首页交互、玻璃滑块与智能体状态反馈已统一，页面视觉与动作语言开始形成系统。</span></p>
              <p className="answer-reveal-piece"><b>•</b><span><strong>风险集中在数据边界验证</strong>仍需补齐异常数据、权限隔离及弱网场景测试，下周优先完成验收清单闭环。</span></p>
            </div>
            <button className="answer-followup answer-reveal-piece" type="button" onClick={onFollowUp}>
              继续追问 <ArrowRight />
            </button>
          </section>
        )}
      </article>

      <aside className="source-rail">
        <header><span>参考来源</span><small>{sources.length} 项</small></header>
        {sources.length ? (
          <div className="source-list">
            {sources.map((source, index) => (
              <div className="source-item" key={source.id ?? source.title}>
                <span><FileText weight="duotone" /></span>
                <div><strong>{source.title}</strong><small>{source.meta}</small></div>
                <em>{index + 1}</em>
              </div>
            ))}
          </div>
        ) : (
          <div className="source-empty">
            <FileText weight="duotone" />
            <strong>本次没有引用资料</strong>
            <small>打开资料库或添加附件后重新执行</small>
          </div>
        )}
        <div className="source-trust">
          <i><Sparkle weight="fill" /></i>
          <span><strong>执行轨迹</strong><small>知识与工具调用已记录</small></span>
        </div>
      </aside>
    </section>
  );
}
