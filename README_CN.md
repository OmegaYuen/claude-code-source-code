# Claude Code v2.1.88 — 深度分析

> **导读**：本项目是一个关于 CLI Agent 架构的学习研究仓库。所有内容均基于互联网上公开的资料与讨论整理而成，特别参考了目前非常受欢迎的 CLI Agent `claude-code` 的相关公开信息。我们的初衷是帮助大家更好地理解和使用 Agent 技术，未来也会持续推出更多关于 Agent 架构解析与实践的探讨内容，感谢各位的关注与支持！

> **免责声明**: 本仓库内容仅用于技术研究和科研爱好者交流学习参考，**严禁任何个人、机构及组织将其用于商业用途、盈利性活动、非法用途及其他未经授权的场景。** 若内容涉及侵犯您的合法权益、知识产权或存在其他侵权问题，请及时联系我们，我们将第一时间核实并予以删除处理。


**语言**: [English](README.md) | **中文** | [한국어](README_KR.md) | [日本語](README_JA.md)

---

## 目录

- [深度分析文档 (`docs/`)](#深度分析文档-docs) — 遥测、模型代号、卧底模式、远程控制、未来路线图
- [目录参考](#目录参考) — 代码结构树
- [架构概览](#架构概览) — 入口 → 查询引擎 → 工具/服务/状态

---

## 深度分析文档 (`docs/`)

基于网络公开资料与社区讨论整理的 Claude Code v2.1.88 分析报告，中英双语。

```
docs/
├── en/                                        # English
│   ├── [01-telemetry-and-privacy.md]          # Telemetry & Privacy — what's collected, why you can't opt out
│   ├── [02-hidden-features-and-codenames.md]  # Codenames (Capybara/Tengu/Numbat), feature flags, internal vs external
│   ├── [03-undercover-mode.md]                # Undercover Mode — hiding AI authorship in open-source repos
│   ├── [04-remote-control-and-killswitches.md]# Remote Control — managed settings, killswitches, model overrides
│   └── [05-future-roadmap.md]                 # Future Roadmap — Numbat, KAIROS, voice mode, unreleased tools
│
└── zh/                                        # 中文
    ├── [01-遥测与隐私分析.md]                    # 遥测与隐私 — 收集了什么，为什么无法退出
    ├── [02-隐藏功能与模型代号.md]                # 隐藏功能 — 模型代号，feature flag，内外用户差异
    ├── [03-卧底模式分析.md]                     # 卧底模式 — 在开源项目中隐藏 AI 身份
    ├── [04-远程控制与紧急开关.md]                # 远程控制 — 托管设置，紧急开关，模型覆盖
    └── [05-未来路线图.md]                       # 未来路线图 — Numbat，KAIROS，语音模式，未上线工具
```

> 点击文件名即可跳转到对应报告。

| # | 主题 | 核心发现 | 链接 |
|---|------|---------|------|
| 01 | **遥测与隐私** | 双层分析管道（1P→Anthropic, Datadog）。环境指纹、进程指标、每个事件携带会话/用户 ID。**没有面向用户的退出开关**。`OTEL_LOG_TOOL_DETAILS=1` 可记录完整工具输入。 | [EN](docs/en/01-telemetry-and-privacy.md) · [中文](docs/zh/01-遥测与隐私分析.md) |
| 02 | **隐藏功能与代号** | 动物代号体系（Capybara v8, Tengu, Fennec→Opus 4.6, **Numbat** 下一代）。Feature flag 用随机词对掩盖用途。内部用户获得更好的 prompt 和验证代理。隐藏命令：`/btw`、`/stickers`。 | [EN](docs/en/02-hidden-features-and-codenames.md) · [中文](docs/zh/02-隐藏功能与模型代号.md) |
| 03 | **卧底模式** | Anthropic 员工在公开仓库自动进入卧底模式。模型指令："**不要暴露你的掩护身份**" — 剥离所有 AI 归属，commit 看起来像人类写的。**没有强制关闭选项。** | [EN](docs/en/03-undercover-mode.md) · [中文](docs/zh/03-卧底模式分析.md) |
| 04 | **远程控制与 Killswitch** | 每小时轮询 `/api/claude_code/settings`。危险变更弹出阻塞对话框 — **拒绝 = 程序退出**。6+ 紧急开关（绕过权限、快速模式、语音模式、分析 sink）。GrowthBook 可无同意改变任何用户行为。 | [EN](docs/en/04-remote-control-and-killswitches.md) · [中文](docs/zh/04-远程控制与紧急开关.md) |
| 05 | **未来路线图** | **Numbat** 代号确认。Opus 4.7 / Sonnet 4.8 开发中。**KAIROS** = 完全自主代理模式，心跳 `<tick>`、推送通知、PR 订阅。语音模式（push-to-talk）已就绪。发现 17 个未上线工具。 | [EN](docs/en/05-future-roadmap.md) · [中文](docs/zh/05-未来路线图.md) |

---

## 版权与免责声明

```
本仓库仅用于技术研究和教育目的。严禁商业使用。

如果您是版权所有者并认为本仓库内容侵犯了您的权利，
请联系仓库所有者立即删除。
```

---

## 统计数据

| 项目 | 数量 |
|------|------|
| 文件 (.ts/.tsx) | ~1,884 |
| 行数 | ~512,664 |
| 最大单文件 | `query.ts` (~785KB) |
| 内置工具 | ~40+ |
| 斜杠命令 | ~80+ |
| 依赖 (node_modules) | ~192 个包 |
| 运行时 | Bun（编译为 Node.js >= 18 bundle）|

---

## 代理模式

```text
                    核心循环
                    ========

    用户 --> messages[] --> Claude API --> 响应
                                          |
                                stop_reason == "tool_use"?
                               /                          \
                             是                           否
                              |                             |
                        执行工具                        返回文本
                        追加 tool_result
                        循环回退 -----------------> messages[]


    这就是最小的代理循环。Claude Code 在此循环上
    包裹了生产级线束：权限、流式传输、并发、
    压缩、子代理、持久化和 MCP。
```

---

## 目录参考

```text
src/
├── main.tsx                 # REPL 引导程序，4,683 行
├── QueryEngine.ts           # SDK/headless 查询生命周期引擎
├── query.ts                 # 主代理循环 (785KB，最大文件)
├── Tool.ts                  # 工具接口 + buildTool 工厂
├── Task.ts                  # 任务类型、ID、状态基类
├── tools.ts                 # 工具注册、预设、过滤
├── commands.ts              # 斜杠命令定义
├── context.ts               # 用户输入上下文
├── cost-tracker.ts          # API 成本累积
├── setup.ts                 # 首次运行设置流程
│
├── bridge/                  # Claude Desktop / 远程桥接
│   ├── bridgeMain.ts        #   会话生命周期管理器
│   ├── bridgeApi.ts         #   HTTP 客户端
│   ├── bridgeConfig.ts      #   连接配置
│   ├── bridgeMessaging.ts   #   消息中继
│   ├── sessionRunner.ts     #   进程生成
│   ├── jwtUtils.ts          #   JWT 刷新
│   ├── workSecret.ts        #   认证令牌
│   └── capacityWake.ts      #   基于容量的唤醒
│
├── cli/                     # CLI 基础设施
│   ├── handlers/            #   命令处理器
│   └── transports/          #   I/O 传输 (stdio, structured)
│
├── commands/                # ~80 个斜杠命令
├── components/              # React/Ink 终端 UI
├── entrypoints/             # 应用入口点
├── hooks/                   # React hooks
├── services/                # 业务逻辑层
├── state/                   # 应用状态
├── tasks/                   # 任务实现
├── tools/                   # 40+ 工具实现
├── types/                   # 类型定义
├── utils/                   # 工具函数（最大目录）
└── vendor/                  # 原生模块存根
```

---

## 架构概览

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         入口层                                      │
│  cli.tsx ──> main.tsx ──> REPL.tsx (交互式)                        │
│                     └──> QueryEngine.ts (headless/SDK)              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       查询引擎                                      │
│  submitMessage(prompt) ──> AsyncGenerator<SDKMessage>               │
│    ├── fetchSystemPromptParts()    ──> 组装系统提示词               │
│    ├── processUserInput()          ──> 处理 /命令                   │
│    ├── query()                     ──> 主代理循环                   │
│    │     ├── StreamingToolExecutor ──> 并行工具执行                  │
│    │     ├── autoCompact()         ──> 上下文压缩                   │
│    │     └── runTools()            ──> 工具编排                     │
│    └── yield SDKMessage            ──> 流式传输给消费者             │
└──────────────────────────────┬──────────────────────────────────────┘
```

---

## 许可证

本仓库内容仅用于技术研究和教育目的。Claude Code 的相关知识产权归 **Anthropic 和 Claude** 所有。
