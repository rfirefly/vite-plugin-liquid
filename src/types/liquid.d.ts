// 自定义过滤器类型
export type FilterFunction = (...args: any[]) => any

// 扩展 LiquidJS 选项接口以包含 filters
export interface LiquidOptions {
  /**
   * LiquidJS 引擎配置选项
   */
  cache?: boolean
  /**
   * 自定义过滤器
   */
  filters?: Record<string, FilterFunction | any>
  /**
   * 其他 LiquidJS 选项
   */
  [key: string]: any
}

/**
 * 插件选项接口
 */
export interface ViteLiquidPluginOptions {
  /**
   * 传递给LiquidJS引擎的选项
   */
  liquidjs?: LiquidOptions

  /**
   * 传递给模板的默认变量
   */
  locals?: Record<string, any>
}

/**
 * 渲染上下文类型
 */
export type RenderContext = Record<string, any>

declare module '*.liquid' {
  /**
   * 渲染模板的函数
   * @param context 传递给模板的数据对象
   * @returns Promise<string> 渲染后的 HTML 字符串
   */
  export default function render(context?: RenderContext): Promise<string>

  /**
   * 原始模板内容
   */
  export const template: string
}

declare module 'virtual:liquid-engine' {
  /**
   * 渲染Liquid模板
   * @param templateContent 模板内容
   * @param context 渲染上下文
   * @returns 渲染后的HTML
   */

  export function renderTemplate(
    templateContent: string,
    context?: RenderContext
  ): Promise<string>

}
