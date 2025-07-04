import type { Plugin } from 'vite'
import type { FilterFunction, ViteLiquidPluginOptions } from './types/liquid'
import { Liquid } from 'liquidjs'

export function vitePluginLiquid(options: ViteLiquidPluginOptions = {}): Plugin {
  const parameters: ViteLiquidPluginOptions = options || {}
  let engine: Liquid | null = null

  // 虚拟模块ID，用于共享Liquid引擎
  const VIRTUAL_MODULE_ID = 'virtual:liquid-engine'
  const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

  // 辅助函数：注册过滤器到引擎实例
  function registerFilters(filters: Record<string, FilterFunction | any>): void {
    if (!engine)
      return
    for (const [name, filter] of Object.entries(filters)) {
      engine.registerFilter(name, filter)
    }
  }

  // 辅助函数：生成过滤器注册代码字符串
  function generateFilterRegistrationCode(filters: Record<string, FilterFunction | any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return '// No custom filters to register'
    }

    const filterRegistrations: string[] = []
    for (const [name, filter] of Object.entries(filters)) {
      // 不同类型的过滤器需要不同的处理方式
      if (typeof filter === 'function') {
        // 如果是函数，直接使用其字符串表示
        filterRegistrations.push(`engine.registerFilter("${name}", ${filter.toString()});`)
      }
      else {
        // 其他类型的过滤器
        filterRegistrations.push(`engine.registerFilter("${name}", ${JSON.stringify(filter)});`)
      }
    }

    return filterRegistrations.join('\n              ')
  }

  return {
    // 插件名称
    name: 'vite-plugin-liquidjs',
    enforce: 'pre',

    configureServer() {
      // 初始化 Liquid 引擎
      if (!engine) {
        engine = new Liquid(parameters.liquidjs || {})
        registerFilters(parameters.liquidjs?.filters || {})
      }
    },

    // 解析虚拟模块ID
    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
      return null
    },

    // 加载虚拟模块
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // 确保引擎已初始化
        if (!engine) {
          engine = new Liquid(parameters.liquidjs || {})
          registerFilters(parameters.liquidjs?.filters || {})
        }

        // 创建虚拟模块内容，导出引擎实例和辅助方法
        return `
          import { Liquid } from 'liquidjs';
          
          // 创建共享的Liquid引擎实例
          const engine = new Liquid(${JSON.stringify(parameters.liquidjs || {})});
          
          // 注册自定义过滤器
          ${generateFilterRegistrationCode(parameters.liquidjs?.filters || {})}
          
          /**
           * 渲染Liquid模板
           * @param {string} templateContent - 模板内容
           * @param {Object} context - 渲染上下文
           * @returns {Promise<string>} 渲染后的HTML
           */
          export async function renderTemplate(templateContent, context = {}) {
            return await engine.parseAndRender(templateContent, context);
          }
          
          // 导出引擎实例，以便高级用法
          export { engine };
        `
      }
      return null
    },

    async transform(code: string, id: string) {
      // 检查是否是.liquid文件
      if (!/\.liquid$/i.test(id)) {
        return null
      }

      try {
        if (!engine) {
          engine = new Liquid(parameters.liquidjs || {})
          registerFilters(parameters.liquidjs?.filters || {})
        }

        // 如果提供了locals，则使用它渲染模板
        if (parameters.locals) {
          const rendered = await engine.parseAndRender(code, parameters.locals)
          // 将渲染后的内容作为字符串导出
          return {
            code: `export default ${JSON.stringify(rendered)};`,
            map: null,
          }
        }
        else {
          // 提供一个函数，允许用户自己渲染模板
          // 使用虚拟模块中的共享引擎
          return {
            code: `
              import { renderTemplate } from 'virtual:liquid-engine';
              
              // 模板内容
              const templateContent = ${JSON.stringify(code)};
              
              /**
               * 渲染此模板
               * @param {Object} context - 渲染上下文
               * @returns {Promise<string>} 渲染后的HTML
               */
              export default async function render(context = {}) {
                return await renderTemplate(templateContent, context);
              }
              
              // 为了方便直接使用，也导出模板内容
              export const template = ${JSON.stringify(code)};
            `,
            map: null,
          }
        }
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error processing liquid template ${id}:`, error)
        return {
          code: `export default "Error processing template: ${errorMessage}";`,
          map: null,
        }
      }
    },
  }
}
