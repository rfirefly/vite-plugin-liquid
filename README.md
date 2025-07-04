# Vite Liquid 插件使用指南

此插件允许在 Vue/TypeScript 项目中直接导入和使用 Liquid 模板文件（.liquid）。

## 安装

如果您想将此插件作为一个独立的 npm 包使用，需要先安装以下依赖：

```bash
# 基础依赖
pnpm add liquidjs
pnpm add -D @vitejs/plugin-vue # 如果使用 Vue
```

## 配置

### 在 `vite.config.ts` 中配置插件：

```typescript
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vitePluginLiquid from './src/plugin/vite-liquid-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginLiquid({
      // LiquidJS 引擎的配置选项
      liquidjs: {
        filters: {
          currency: (value: number | string): string => `¥${Number.parseFloat(String(value)).toFixed(2)}`
        }
      },
      // 可选：为所有模板提供默认变量
      // locals: { ... }
    })
  ]
})
```

### TypeScript 配置

确保您的 `tsconfig.json` 包含以下配置，以支持 .liquid 文件的导入：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node"
    // 其他配置...
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

并在项目中添加 `.liquid` 文件的类型声明（通常放在 `src/types/liquid.d.ts` 中）：

```typescript
declare module '*.liquid' {
  export default function render(context?: Record<string, any>): Promise<string>
  export const template: string
}
```

## 使用方式

### 方式一：动态渲染（TypeScript）

```typescript
// 导入 .liquid 文件
import renderTemplate, { template as templateSource } from './example.liquid'

interface ProductData {
  product: {
    title: string
    price: number
    available: boolean
    tags: string[]
  }
}

// 在需要的地方渲染模板
const data: ProductData = {
  product: {
    title: '商品名称',
    price: 199.00,
    available: true,
    tags: ['热销', '新品']
  }
}

// 异步渲染
const renderedHTML = await renderTemplate(data)
```

### 方式二：在 Vue 组件中使用（使用 TypeScript）

```vue
<script lang="ts">
import { onMounted, ref } from 'vue'
import renderTemplate from './example.liquid'

interface ProductData {
  product: {
    title: string
    price: number
    available: boolean
    tags: string[]
  }
}

export default {
  setup() {
    const renderedTemplate = ref('')

    onMounted(async () => {
      const data: ProductData = {
        product: {
          title: '商品名称',
          price: 199.00,
          available: true,
          tags: ['热销', '新品']
        }
      }

      renderedTemplate.value = await renderTemplate(data)
    })

    return { renderedTemplate }
  }
}
</script>

<template>
  <div v-html="renderedTemplate" />
</template>
```

## 高级功能

### 自定义过滤器（带类型）

您可以在插件配置中添加带有类型声明的自定义过滤器，这些过滤器在服务端预渲染和客户端动态渲染时都能使用：

```typescript
vitePluginLiquid({
  liquidjs: {
    filters: {
      // 货币格式化
      currency: (value: number | string): string => `¥${Number.parseFloat(String(value)).toFixed(2)}`,

      // 大写转换
      uppercase: (value: string): string => value.toUpperCase(),

      // 带参数的过滤器
      truncate: (value: string, length: number = 50): string => {
        if (String(value).length <= length)
          return String(value)
        return `${String(value).substring(0, length)}...`
      }
    }
  }
})

// 然后在模板中使用
// {{ product.title | uppercase }}
// {{ product.description | truncate: 100 }}
```

这些过滤器可以在客户端动态渲染时使用，插件会自动处理过滤器的注册：

```typescript
// 导入模板
import renderTemplate from './example.liquid'

// 渲染模板时会应用已注册的过滤器
const html = await renderTemplate(data)
```
```

### 自定义标签

LiquidJS 支持自定义标签，您可以在插件配置中添加：

```typescript
vitePluginLiquid({
  liquidjs: {
    tags: {
      // 自定义标签定义
    }
  }
})
```

## 类型安全

使用 TypeScript 版本的插件，您可以获得更好的类型检查和开发体验：

1. 清晰的参数类型定义
2. 在 IDE 中获得更好的代码补全
3. 避免常见的类型相关错误

## 共享引擎实例

插件提供了一个虚拟模块 `virtual:liquid-engine`，它导出一个共享的 Liquid 引擎实例，可用于高级操作：

```typescript
// 直接导入共享引擎
import { engine, renderTemplate } from 'virtual:liquid-engine'

// 动态注册新过滤器
engine.registerFilter('highlight', (value: string) => {
  return `<span style="background-color: yellow">${value}</span>`
})

// 直接使用引擎渲染任意模板
const customTemplate = `<h1>{{ title | highlight }}</h1>`
const rendered = await engine.parseAndRender(customTemplate, { title: '标题' })

// 或使用辅助方法渲染
const rendered2 = await renderTemplate(customTemplate, { title: '标题' })
```

### 虚拟模块类型声明

在 `src/types/virtual-liquid-engine.d.ts` 中提供了类型声明：

```typescript
declare module 'virtual:liquid-engine' {
  import { Liquid } from 'liquidjs'

  export function renderTemplate(
    templateContent: string,
    context?: Record<string, any>
  ): Promise<string>

  export const engine: Liquid
}
```

这种共享引擎的方法有以下优点：

1. **性能更好**：不需要为每个模板创建单独的引擎实例
2. **状态一致**：所有模板共享同一引擎，确保过滤器和设置一致
3. **高级用法**：可以动态注册过滤器、标签，甚至修改现有的过滤器行为

更多高级用法请参考 [LiquidJS 官方文档](https://liquidjs.com/)。
