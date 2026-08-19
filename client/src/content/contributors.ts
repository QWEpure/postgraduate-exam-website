/**
 * contributors —— 共建者数据源
 *
 * 首页「一起把 408 学薄一点」区域展示的贡献者列表。
 * 两行数据源互不重复（唯一），分别向左 / 向右滚动。
 *
 * 字段：
 *   - name:     展示名
 *   - platform: 平台标识（bilibili / douyin / xhs / github）
 *   - url:      点击跳转的主页地址
 *   - row:      所在行（1 = 上行向左滚动，2 = 下行向右滚动）
 *
 * 增减贡献者：直接在下面数组里加一行即可，HomePage 会自动渲染。
 */
export type ContributorPlatform = 'bilibili' | 'douyin' | 'xhs' | 'github'

export type Contributor = {
  name: string
  platform: ContributorPlatform
  url: string
}

export const contributors: Contributor[] = [
  { name: '11408考研良子', platform: 'bilibili', url: 'https://space.bilibili.com/385409016', },
]
