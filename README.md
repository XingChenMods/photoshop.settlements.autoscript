# Photoshop Settlement Marks Automation Scripts

这是一套用于在 Photoshop 中自动生成定居点标记的自动化脚本工具。

## 项目简介

本项目包含两个主要脚本：
1. **csvToSettlements.js** - 将 CSV 定居点数据转换为 JavaScript 数组
2. **makeSettlementMarks.jsx** - 在 Photoshop 中基于模板自动生成定居点标记

## 功能特性

- 📊 **CSV 数据处理**: 自动读取 CSV 文件并提取定居点信息
- 🎨 **模板系统**: 支持多种定居点类型的模板（城镇、堡垒、村庄等）
- 🚀 **批量生成**: 一次性处理多个定居点标记
- 🔧 **智能识别**: 根据 ID 前缀自动选择合适的模板
- ⚡ **错误处理**: 完善的错误检查和用户反馈

## 文件结构

```
psscripts/
├── csvToSettlements.js      # CSV 转换脚本
├── makeSettlementMarks.jsx  # Photoshop 自动化脚本
├── data/                    # CSV 数据文件目录
└── README.md               # 项目说明文件
```

## 使用方法

### 第一步：准备 CSV 数据

确保你的 CSV 文件包含以下结构：
- 第一行为标题行
- 第1列为定居点名称
- 第8列为定居点 ID

示例 CSV 格式：
```csv
Name,Type,Region,Culture,Owner,Population,Prosperity,ID
韩城,Town,韩,韩族,玩家,1500,75,town_han1
孟门堡,Fort,韩,韩族,敌方,800,60,fort_han1
```

### 第二步：转换 CSV 数据

使用 Node.js 运行转换脚本：

```bash
node csvToSettlements.js path/to/your/settlements.csv
```

这将在同目录下生成一个 `.js` 文件，包含格式化的定居点数组。

### 第三步：更新 Photoshop 脚本

1. 打开生成的 `.js` 文件
2. 复制其中的 `settlements` 数组内容
3. 粘贴到 `makeSettlementMarks.jsx` 中替换现有的 `settlements` 数组

### 第四步：准备 Photoshop 文档

确保你的 Photoshop 文档包含：
- 一个名为 "All Templates" 的图层组
- 在该组内包含以下模板子组：
  - `Town Template` - 城镇模板
  - `Fort Template` - 堡垒模板
  - `Town Village Template` - 城镇村庄模板
  - `Fort Village Template` - 堡垒村庄模板

每个模板组应包含至少两个文本图层：
- 第一个（最顶层）文本图层：用于显示定居点名称
- 第二个文本图层：用于显示定居点 ID

### 第五步：运行脚本

1. 在 Photoshop 中打开你的文档
2. 选择 **文件 > 脚本 > 浏览**
3. 选择 `makeSettlementMarks.jsx` 文件并运行

## 定居点类型识别

脚本根据 ID 前缀自动选择模板：

| ID 前缀         | 模板类型              | 示例                  |
| --------------- | --------------------- | --------------------- |
| `town_village_` | Town Village Template | `town_village_han1_1` |
| `fort_village_` | Fort Village Template | `fort_village_han1_1` |
| `town_`         | Town Template         | `town_han1`           |
| `fort_`         | Fort Template         | `fort_han1`           |

## 输出结果

脚本执行后，将在文档中生成以下内容：
- 每个定居点对应一个复制的模板组
- 组名格式：`${id} ${name}`（例如：`town_han1 韩城`）
- 自动填充的文本内容：
  - 顶层文本图层：定居点名称
  - 第二文本图层：定居点 ID

## 错误处理

脚本包含完善的错误处理机制：
- 缺失模板组时的警告
- 文本图层不足时的提示
- 无效 ID 前缀的跳过处理
- 详细的错误信息反馈

## 系统要求

- **Node.js** (用于 CSV 转换脚本)
- **Adobe Photoshop** (支持 JSX 脚本)
- **操作系统**: Windows/macOS/Linux

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

本项目采用 Apache 2.0 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 CSV 数据转换
- 支持多种定居点模板
- 完善的错误处理机制
