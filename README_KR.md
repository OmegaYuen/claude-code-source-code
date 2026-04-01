# Claude Code v2.1.88 — 심층 분석

> **소개**: 이 프로젝트는 CLI Agent 아키텍처에 대한 학습 및 연구 저장소입니다. 모든 자료는 전적으로 인터넷에 공개된 정보와 토론을 바탕으로 정리되었으며, 특히 현재 매우 인기 있는 CLI Agent인 `claude-code`와 관련된 공개 정보를 참고했습니다. 저희의 목적은 개발자들이 Agent 기술을 더 잘 이해하고 활용할 수 있도록 돕는 것입니다. 앞으로도 Agent 아키텍처와 관련된 더 많은 통찰과 실용적인 토론 콘텐츠를 지속적으로 공유할 예정입니다. 여러분의 관심과 성원에 감사드립니다!

> **면책 조항**: 본 저장소의 콘텐츠는 기술 연구, 학습, 교육 목적의 교류를 위해서만 제공됩니다. **상업적 사용은 엄격히 금지됩니다.** 어떠한 개인, 기관, 단체도 이 콘텐츠를 상업적 목적, 영리 활동, 불법 활동 또는 기타 무단 사용에 활용할 수 없습니다. 본 콘텐츠가 귀하의 법적 권리, 지적 재산권 또는 기타 이익을 침해하는 경우, 연락 주시면 즉시 확인 후 삭제 조치하겠습니다.


**언어**: [English](README.md) | [中文](README_CN.md) | **한국어** | [日本語](README_JA.md)

---

## 목차

- [심층 분석 보고서 (`docs/`)](#심층-분석-보고서-docs) — 텔레메트리, 코드네임, 언더커버 모드, 원격 제어, 향후 로드맵
- [디렉터리 참조](#디렉터리-참조) — 코드 구조 트리
- [아키텍처 개요](#아키텍처-개요) — 진입점 → 쿼리 엔진 → 도구/서비스/상태

---

## 심층 분석 보고서 (`docs/`)

인터넷에 공개된 자료와 커뮤니티 토론을 바탕으로 정리된 Claude Code v2.1.88 분석 보고서. 영어/중국어/한국어/일본어 4개 국어 제공.

```
docs/
├── en/                                        # English
│   ├── [01-telemetry-and-privacy.md]          # Telemetry & Privacy — what's collected, why you can't opt out
│   ├── [02-hidden-features-and-codenames.md]  # Codenames (Capybara/Tengu/Numbat), feature flags, internal vs external
│   ├── [03-undercover-mode.md]                # Undercover Mode — hiding AI authorship in open-source repos
│   ├── [04-remote-control-and-killswitches.md]# Remote Control — managed settings, killswitches, model overrides
│   └── [05-future-roadmap.md]                 # Future Roadmap — Numbat, KAIROS, voice mode, unreleased tools
│
├── ko/                                        # 한국어
│   ├── [01-텔레메트리와-프라이버시.md]          # 텔레메트리 및 프라이버시 — 수집 항목, 비활성화 불가 이유
│   ├── [02-숨겨진-기능과-코드네임.md]          # 숨겨진 기능 — 모델 코드네임, feature flag, 내부/외부 사용자 차이
│   ├── [03-언더커버-모드.md]                   # 언더커버 모드 — 오픈소스에서 AI 저작 은폐
│   ├── [04-원격-제어와-킬스위치.md]            # 원격 제어 — 관리 설정, 킬스위치, 모델 오버라이드
│   └── [05-향후-로드맵.md]                     # 향후 로드맵 — Numbat, KAIROS, 음성 모드, 미공개 도구
│
└── zh/                                        # 中文
    ├── [01-遥测与隐私分析.md]                    # 遥测与隐私 — 收集了什么，为什么无法退出
    ├── [02-隐藏功能与模型代号.md]                # 隐藏功能 — 模型代号，feature flag，内外用户差异
    ├── [03-卧底模式分析.md]                     # 卧底模式 — 在开源项目中隐藏 AI 身份
    ├── [04-远程控制与紧急开关.md]                # 远程控制 — 托管设置，紧急开关，模型覆盖
    └── [05-未来路线图.md]                       # 未来路线图 — Numbat，KAIROS，语音模式，未上线工具
```

> 파일명을 클릭하면 해당 보고서로 이동합니다.

| # | 주제 | 핵심 발견 | 링크 |
|---|------|----------|------|
| 01 | **텔레메트리 및 프라이버시** | 이중 분석 파이프라인 (1P→Anthropic, Datadog). 환경 핑거프린트, 프로세스 메트릭, 모든 이벤트에 세션/사용자 ID 포함. **사용자 대상 비활성화 설정 없음.** `OTEL_LOG_TOOL_DETAILS=1`로 전체 도구 입력 기록 가능. | [EN](docs/en/01-telemetry-and-privacy.md) · [한국어](docs/ko/01-텔레메트리와-프라이버시.md) · [中文](docs/zh/01-遥测与隐私分析.md) |
| 02 | **숨겨진 기능과 코드네임** | 동물 코드네임 체계 (Capybara v8, Tengu, Fennec→Opus 4.6, **Numbat** 차기). Feature flag에 무작위 단어 조합으로 목적 난독화. 내부 사용자는 더 나은 프롬프트와 검증 에이전트 제공. 숨겨진 명령어: `/btw`, `/stickers`. | [EN](docs/en/02-hidden-features-and-codenames.md) · [한국어](docs/ko/02-숨겨진-기능과-코드네임.md) · [中文](docs/zh/02-隐藏功能与模型代号.md) |
| 03 | **언더커버 모드** | Anthropic 직원은 공개 저장소에서 자동으로 언더커버 모드 진입. 모델 지시: **"정체를 들키지 마라"** — 모든 AI 저작 표시를 제거하고, 사람이 작성한 것처럼 커밋. **강제 비활성화 옵션 없음.** | [EN](docs/en/03-undercover-mode.md) · [한국어](docs/ko/03-언더커버-모드.md) · [中文](docs/zh/03-卧底模式分析.md) |
| 04 | **원격 제어 및 킬스위치** | 1시간마다 `/api/claude_code/settings` 폴링. 위험 변경 시 차단 다이얼로그 — **거부 = 앱 종료**. 6개 이상 킬스위치 (권한 우회, fast 모드, 음성 모드, 분석 싱크). GrowthBook으로 동의 없이 사용자 동작 변경 가능. | [EN](docs/en/04-remote-control-and-killswitches.md) · [한국어](docs/ko/04-원격-제어와-킬스위치.md) · [中文](docs/zh/04-远程控制与紧急开关.md) |
| 05 | **향후 로드맵** | **Numbat** 코드네임 확인. Opus 4.7 / Sonnet 4.8 개발 중. **KAIROS** = 완전 자율 에이전트 모드, `<tick>` 하트비트, 푸시 알림, PR 구독. 음성 모드(push-to-talk) 준비 완료. 미공개 도구 17개 발견. | [EN](docs/en/05-future-roadmap.md) · [한국어](docs/ko/05-향후-로드맵.md) · [中文](docs/zh/05-未来路线图.md) |

---

## 저작권 및 면책 조항

```text
본 저장소는 기술 연구 및 교육 목적으로만 제공됩니다. 상업적 사용은 금지됩니다.

저작권자로서 본 저장소 콘텐츠가 귀하의 권리를 침해한다고 판단되는 경우,
저장소 소유자에게 연락 주시면 즉시 삭제하겠습니다.
```

---

## 통계

| 항목 | 수량 |
|------|------|
| 파일 (.ts/.tsx) | ~1,884 |
| 라인 수 | ~512,664 |
| 최대 단일 파일 | `query.ts` (~785KB) |
| 내장 도구 | ~40개 이상 |
| 슬래시 명령 | ~80개 이상 |
| 의존성 (node_modules) | ~192개 패키지 |
| 런타임 | Bun (Node.js >= 18 번들로 컴파일) |

---

## 에이전트 모드

```
                    코어 루프
                    ========

    사용자 --> messages[] --> Claude API --> 응답
                                          |
                                stop_reason == "tool_use"?
                               /                          \
                             예                           아니오
                              |                             |
                        도구 실행                        텍스트 반환
                        tool_result 추가
                        루프 재진입 -----------------> messages[]


    이것이 최소 에이전트 루프이다. Claude Code는 이 루프 위에
    프로덕션급 하니스를 래핑한다: 권한, 스트리밍, 동시성,
    압축, 서브에이전트, 영속화 및 MCP.
```

---

## 디렉터리 참조

```
src/
├── main.tsx                 # REPL 부트스트랩, 4,683줄
├── QueryEngine.ts           # SDK/headless 쿼리 라이프사이클 엔진
├── query.ts                 # 메인 에이전트 루프 (785KB, 최대 파일)
├── Tool.ts                  # 도구 인터페이스 + buildTool 팩토리
├── Task.ts                  # 태스크 타입, ID, 상태 베이스 클래스
├── tools.ts                 # 도구 등록, 프리셋, 필터링
├── commands.ts              # 슬래시 명령 정의
├── context.ts               # 사용자 입력 컨텍스트
├── cost-tracker.ts          # API 비용 누적
├── setup.ts                 # 최초 실행 설정 플로우
│
├── bridge/                  # Claude Desktop / 원격 브릿지
│   ├── bridgeMain.ts        #   세션 라이프사이클 매니저
│   ├── bridgeApi.ts         #   HTTP 클라이언트
│   ├── bridgeConfig.ts      #   연결 설정
│   ├── bridgeMessaging.ts   #   메시지 릴레이
│   ├── sessionRunner.ts     #   프로세스 스폰
│   ├── jwtUtils.ts          #   JWT 갱신
│   ├── workSecret.ts        #   인증 토큰
│   └── capacityWake.ts      #   용량 기반 웨이크
│
├── cli/                     # CLI 인프라
│   ├── handlers/            #   명령 핸들러
│   └── transports/          #   I/O 전송 (stdio, structured)
│
├── commands/                # ~80개 슬래시 명령
├── components/              # React/Ink 터미널 UI
├── entrypoints/             # 앱 진입점
├── hooks/                   # React hooks
├── services/                # 비즈니스 로직 레이어
├── state/                   # 앱 상태
├── tasks/                   # 태스크 구현
├── tools/                   # 40개 이상 도구 구현
├── types/                   # 타입 정의
├── utils/                   # 유틸리티 (최대 디렉터리)
└── vendor/                  # 네이티브 모듈 스텁
```

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────┐
│                         진입 레이어                                  │
│  cli.tsx ──> main.tsx ──> REPL.tsx (인터랙티브)                     │
│                     └──> QueryEngine.ts (headless/SDK)              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       쿼리 엔진                                      │
│  submitMessage(prompt) ──> AsyncGenerator<SDKMessage>               │
│    ├── fetchSystemPromptParts()    ──> 시스템 프롬프트 조립          │
│    ├── processUserInput()          ──> /명령 처리                    │
│    ├── query()                     ──> 메인 에이전트 루프            │
│    │     ├── StreamingToolExecutor ──> 병렬 도구 실행               │
│    │     ├── autoCompact()         ──> 컨텍스트 압축                │
│    │     └── runTools()            ──> 도구 오케스트레이션           │
│    └── yield SDKMessage            ──> 소비자에게 스트리밍           │
└──────────────────────────────┬──────────────────────────────────────┘
```

---

## 라이선스

본 저장소 콘텐츠는 기술 연구 및 교육 목적으로만 제공됩니다. Claude Code와 관련된 지적 재산권은 **Anthropic과 Claude**에 있습니다.
