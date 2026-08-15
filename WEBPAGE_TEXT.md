## English

### About BCP-Link

**BrowseComp-Plus-Link (BCP-Link)** is a benchmark for evaluating how effectively search agents can use hyperlinks to discover evidence beyond initial search results in an offline, fully reproducible search environment. Built on [BrowseComp-Plus](https://arxiv.org/pdf/2508.06600), it recovers 63,371 verified links among the fixed corpus of 100,195 offline webpages, which are inserted directly into the document text and exposed through standardized `search` and `visit` tools. This setup enables controlled analysis of whether search agents can recognize useful links, navigate across documents, gather relevant evidence, and reach the correct answer efficiently.

The current release includes:

- **100,195** offline webpages in the fixed corpus
- **63,371** verified in-corpus hyperlinks
- **13.77%** of webpages containing at least one hyperlink
- **4.59** average verified links per linked webpage
- **2** document views: `text_raw` and link-enriched `text`
- **2** standardized tools: `search` and `visit`
- **8** Parquet shards in the corpus release

[Code](https://github.com/ml-stat-Sustech/SearcherKit) · [Dataset](https://huggingface.co/datasets/SUSTech/BCP-Link-corpus)


### BCP versus BCP-Link

1. Models trained with the same `search` and `visit` tools reach higher Accuracy on BCP-Link than on BCP, often with fewer turns. This indicates their capability of exploiting link information.

2. For models without matching tool-use training or with materially different interfaces, such as summary-returning Visit tools, the performance gap between BCP and BCP-Link is limited.

### Evaluation Rules

Every model is evaluated through the same reproducible pipeline with the same `search` and `visit` interfaces.

#### Reproducibility
Every run follows one fixed evaluation process: the same corpus, query set, Elasticsearch index, prompts, turn limit, and scoring scripts.

#### Link-aware navigation
Gold evidence can sit beyond the first search results, so agents must recognize and follow useful text links.

#### Two standard tools
All models receive the same two tools, `search` and `visit`, with identical inputs and outputs for a fair comparison.

### Metric Guide

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

**BrowseComp-Plus-Link（BCP-Link）** 是用于评估搜索智能体在离线、完全可复现的搜索环境中利用超链接，在初始搜索结果之外高效发现证据的基准。它构建于 [BrowseComp-Plus](https://arxiv.org/pdf/2508.06600) 之上，从固定的 100,195 个离线网页语料中恢复 63,371 条经验证链接，将链接直接插入文档文本，并通过标准化的 `search` 和 `visit` 工具提供给智能体。该设置支持受控分析，评估搜索智能体能否识别有用链接、跨文档导航、收集相关证据并高效得到正确答案。

当前版本包括：

- **100,195** 个固定语料中的离线网页
- **63,371** 条经验证的语料内超链接
- **13.77%** 的网页至少包含一条超链接
- **4.59** 个含链接网页的平均验证链接数
- **2** 种文档视图：`text_raw` 与链接增强后的 `text`
- **2** 种标准化工具：`search` 与 `visit`
- **8** 个 corpus Parquet 分片

[Code](https://github.com/ml-stat-Sustech/SearcherKit) · [Dataset](https://huggingface.co/datasets/SUSTech/BCP-Link-corpus)

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
