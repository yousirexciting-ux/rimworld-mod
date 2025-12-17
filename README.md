# RimWorld 风格最小模拟层

纯 TypeScript 实现的人物 Needs/Hediff/Capacities 模型，附带 ActionGates 判定、50x50 网格世界（Thing/环境场）与 30 天 Job/Toil 驱动演示。无需额外依赖，可直接在浏览器或 Node 中运行。

## 运行方式

- **Node 控制台：**
  ```bash
  node dist/demo.js
  ```
- **浏览器：** 打开 `demo.html`，点击“运行模拟”查看输出（同时也会写入控制台）。

## 构建与打包

1. 安装依赖：`npm install`
2. 将 TypeScript 编译到 `dist/`：`npm run build`
3. 运行示例（会先自动构建）：`npm run demo`
4. 生成可分发的压缩包（包含 dist、demo.html 等）：`npm run package`

## 模块划分
- `src/needs.ts`：需求衰减与温度驱动。
- `src/hediff.ts`：Hediff 基类（severity / stage / trend）。
- `src/capacities.ts`：根据 Need/Hediff/血量等计算能力值。
- `src/pawn.ts`：Pawn 状态、昏迷/死亡判定、环境对心情/温度的影响。
- `src/actionGates.ts`：行动门槛判定。
- `src/world.ts`：50x50 网格、环境查询（温度/灵气/污秽）、Thing 布局、Job 指派与 tick 推进。
- `src/job.ts`：Job/Toil 链（MoveTo -> UseThing -> Wait -> Finish）。
- `src/clock.ts`：基础 tick 推进（保留）。
- `src/demo.ts`：30 天演示脚本（也打包到 `dist/demo.js`）。

TS 与手写的 ES Module 版（`dist/*.js`）保持一一对应，便于直接运行或继续扩展。
