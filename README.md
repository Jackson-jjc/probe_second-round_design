# AI × Authenticity · 第二轮五方案设计图册

更新：2026-10-02。静态研究设计稿；未接入AI、摄像头或访客数据采集。

![图册首页预览](preview.png)

打开 [index.html](index.html)，或本地运行 `python -m http.server 8766 --bind 127.0.0.1` 后访问 `http://127.0.0.1:8766/`。无需安装前端依赖。直接打开文件同样可用；官方图片外链需要联网。

五项：01藏品细节侦探镜；02把领子折出来（GHT改为布片形状探索）；03只改这一处；04两个人的一张展签；05送你一个细节。每项含场景概念图、中文三屏流程、THG与GHT对象适配、真实案例、摄像头方案、输入输出和研究分析。

正式研究问题仍为一主两次：人机互动如何塑造真实性体验；访客依托什么形成这种体验；如何维持或修订理解。

## 对象状态

- Tudor House & Garden：官方馆藏亮点中的人物造型皮革酒壶、绘鸟玻璃片。
- God’s House Tower：Pether家族2019–2020借展路线中的具名候选《God’s House Tower by Moonlight》（Abraham Pether）、《Everyone Involved》的2024纺织壁挂展览。两项均有官方场地关系证据，但不称为GHT永久馆藏或当前在展对象。单件、编号与研究可用性仍需确认。
- 皮革、玻璃不是纺织品。沿用既有设计的对象范围；如研究必须严格限定纺织品，THG仍需另选对象。

## 文件

- `design_data.json` / `research_details.json`：五个基础方案及研究细节（THG基础任务）。
- `venue_designs.json`：两馆对象、逐项适配、摄像头和案例来源。
- `build_atlas.py`：标准库构建脚本，生成HTML、文字稿和对象来源索引；不读私人研究资料，不联网。
- `styles.css` / `app.js`：响应式、键盘导航、展开全部、打印与外链图片失败提示。
- `assets/concept-01.png` 至 `concept-05.png`：五张内置image_gen生成的场景概念图。
- `image_prompts.json`：实际生成提示词和05修订提示。
- `DESIGN_NOTES.md`：完整文字稿。
- `validation.json`：交付检查结果。

修改数据后运行 `python build_atlas.py`。兼容入口 `python build_book.py` 执行同一构建。生成文件可直接作为静态站点根目录；本次推送Git仓库不等于已开启GitHub Pages。

## 图像及数据

AI场景图不代表真实藏品形态、真实场馆照片或已实施界面。真实对象和案例照片外链自官方网页；Pether画作另有Art UK图像地址、Commons转载档案及开幕报道的来源链，均标明来源；未将第三方照片打包进仓库。高清图、摄影及生成改作的正式使用条件需另行落实。页面不含真实参与者数据、API密钥、追踪统计或自动采集。

核查日期2026-10-02；全部互动例句为设计示例，时间与制作难度未实测。
