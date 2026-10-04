# friend_gift — 请客券礼物网页

参照 `D:\code\birthday_gift` 改的「请客券」版本：点「查看礼物」展开券面 → 点选大渔铁板烧/独野和牛寿喜烧 → 盖章收下 → 烟花。选择结果用 localStorage 记住（键名 `friend_gift_v1`）。

## 起床后待办

1. **改文案**：`index.html` 里搜索 `TODO`，共 5 处：
   - 网页 `<title>`
   - 朋友的名字/昵称（大标题）
   - 祝福语正文
   - 券面「承诺人」署名
   - 背景图 / 头像 / 音乐（见下）
2. **换图**：
   - 头像：✅ 已换成 `zehao.jpg`（2026-10-04）
   - 背景图：占位 hutao.jpg 已删除，当前为纯深色背景，待定新图后加回 `style.css` 的 body `background-image`
3. **换音乐**：替换 `Liyue.mp3`（或改 `index.html` 里 `<source src>`）。注意 mp3 别太大，网页打开加载慢。
   - 注：`chaophone.jpg` 是旧头像，现已不被引用，删留自定。
4. **部署/发送方式**待定，见对话里的问题清单。

## 备注

- 页面图标走 Google Fonts CDN，**需要联网**打开，离线时图标位置会显示成英文名。
- 券编号随机生成后存 localStorage，同一浏览器刷新不变。
- 如果对方换了浏览器/设备打开，选择和盖章状态会重置（没有后端，属正常）。
- 原版 `D:\code\birthday_gift` 未改动。
