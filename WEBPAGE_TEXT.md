# BCP-Link Leaderboard Web Copy

This file collects the explanatory paragraphs currently rendered by the leaderboard. Interactive
labels, table values, model names, and navigation controls are omitted.

## English

### About BCP-Link

Evaluating whether search agents can find and follow useful links.

BrowseComp-Plus-Link (BCP-Link) is a controlled evaluation of link-aware search behavior. It uses standardized `search` and `visit` tools over a fixed corpus, making model results reproducible and directly comparable.

The fixed evaluation corpus is a static, link-enriched extension of the [BrowseComp-Plus](https://arxiv.org/pdf/2508.06600) (BCP) corpus. It preserves each document's original text while restoring selected, verified links at their original positions. A link is exposed only when its target resolves to another document in the same corpus, creating a reproducible document graph without live-web variation.

Key evidence can therefore lie beyond the initial search results. Agents can move directly from a retrieved document to a linked document and continue gathering evidence without issuing another broad search. BCP-Link evaluates not only answer accuracy, but also whether models can recognize useful links, navigate across documents, and reach the correct evidence efficiently.

Dataset summary: 63,371 deduplicated links; 4.59 average outgoing links per document containing at least one link; 84.18% of unique links target `en.wikipedia.org`.

### Leaderboard

Standard `search` and `visit` tools. Models are ranked by answer accuracy.

### BCP versus BCP-Link

Models trained with the same `search` and `visit` tools reach higher Accuracy on BCP-Link than on BCP, often with fewer turns. This indicates that they can use link information.

For models without matching tool-use training or with materially different interfaces, such as summary-returning Visit tools, the performance gap between BCP and BCP-Link is limited.

### Evaluation Rules

Every model is evaluated through the same reproducible pipeline with the same `search` and `visit` interfaces.

Every run follows one fixed evaluation process: the same corpus, query set, Elasticsearch index, prompts, turn limit, and scoring scripts.

Gold evidence can sit beyond the first search results, so agents must recognize and follow useful text links.

All models receive the same two tools, `search` and `visit`, with identical inputs and outputs for a fair comparison.

Search uses focused retrieval from the fixed benchmark corpus. Visit opens a result URL or follows a link from a visited document.

Each run is capped at 50 agent turns.

### Metric Guide

All values are averages across the benchmark evaluation set.

Accuracy and Recall are percentages from 0% to 100%; higher values are better. Search Calls, Visit Calls, Link-following Visit Calls, and Turns are non-negative average counts per task. Fewer calls or turns are preferable only when answer quality remains comparable.

#### Accuracy

Answer accuracy evaluated by Qwen3-32B as the LLM judge. It is the share of evaluated answers judged accurate by Qwen3-32B. Higher values indicate that more benchmark questions were answered correctly.

#### Recall

Recall of evidence documents across all searched and visited documents. It is the share of the gold evidence set recovered through search and visit outputs. Higher values indicate broader recovery of the evidence needed to answer each query.

#### Search Calls

Average number of search tool calls made by the agent. This describes retrieval strategy; more or fewer calls are not automatically better.

#### Visit Calls

Average number of visit tool calls made by the agent. Read this with answer quality to distinguish useful exploration from extra work.

#### Link-following Visit Calls

Average visit calls triggered by links found in retrieved or visited documents. A higher count alone does not prove better navigation.

#### Turns

Average number of agent turns per task. Fewer turns can indicate efficiency only when answer quality remains comparable.

## 中文

### BCP-Link 简介

Evaluating whether search agents can find and follow useful links.

BrowseComp-Plus-Link（BCP-Link）是面向链接感知搜索行为的受控评测。它使用标准化的 `search` 和 `visit` 工具访问固定语料，使不同模型的结果可复现、可直接比较。

固定评测语料是基于 [BrowseComp-Plus](https://arxiv.org/pdf/2508.06600)（BCP）语料构建的静态链接增强版本。它保留每篇文档的原始文本，并在对应位置恢复经筛选与验证的链接；只有当目标 URL 能映射到同一语料中的另一篇文档时，链接才会被保留，由此形成不受实时网页变化影响的可复现文档关联网络。

因此，关键证据可能位于初始检索结果之外。智能体可以从已检索文档直接进入关联文档，无需再次发起宽泛检索即可继续收集证据。BCP-Link 不仅考察答案准确性，还衡量模型能否识别有用链接、完成跨文档导航并高效抵达正确证据。

数据概览：63,371 个去重链接；每篇含链接文档平均 4.59 个出链；84.18% 的唯一链接目标为 `en.wikipedia.org`。

### 排行榜

统一使用 `search` 和 `visit` 工具，按答案准确率排名。

### BCP 与 BCP-Link 对比

对于使用相同 `search` 和 `visit` 工具训练的模型，BCP-Link 上的 Accuracy 高于 BCP，且往往使用更少的 turns，说明模型能够利用链接信息。

对于缺少相应工具训练，或训练时使用了不同工具接口（如 Visit 返回摘要）的模型，BCP 与 BCP-Link 的表现差距有限。

### 评测规则

所有模型均在同一套可复现流程中，使用相同的 `search` 与 `visit` 工具接口进行评测。

每次运行都遵循同一套固定流程：使用相同的语料、问题集、Elasticsearch 索引、提示词、turn 上限和评分脚本。

关键证据可能位于初始搜索结果之外，智能体需要识别并跟随有用的文本链接。

所有模型都使用输入与输出完全一致的 `search` 和 `visit` 两种标准工具，确保模型间比较公平。

Search 使用聚焦查询，从固定基准语料中检索相关文档；Visit 打开结果 URL，或跟随已访问文档中的链接。

每次运行最多允许 50 个智能体 turns。

### 指标说明

所有数值均为基准评测集上的平均结果。

Accuracy 和 Recall 的取值范围是 0%–100%，数值越高越好。Search Calls、Visit Calls、Link-following Visit Calls 和 Turns 是非负的每项任务平均次数；只有在答案质量相近时，较少的调用或 turns 才更理想。

#### Accuracy

由 Qwen3-32B 作为 LLM judge 评估的答案准确率。数值越高，表示正确回答的基准问题越多。

#### Recall

所有搜索和访问过的文档相对于 evidence documents 的召回率。数值越高，表示回答每个问题所需的证据覆盖得越完整。

#### Search Calls

智能体平均调用 `search` 工具的次数。该数值描述检索策略，调用更多或更少并不自动代表更好。

#### Visit Calls

智能体平均调用 `visit` 工具的次数。需要结合答案质量判断这些访问是有效探索还是额外开销。

#### Link-following Visit Calls

由检索结果或已访问文档中的链接触发的平均访问次数。次数更高本身并不能证明导航效果更好。

#### Turns

每个任务平均使用的智能体 turns 数量。仅在答案质量相近时，较少 turns 才能体现更高效率。
