import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
        },
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;



// 1. 基础结构与类型导入
// typescript
// import type { Config } from 'tailwindcss';
// const config: Config = {
//   // 配置内容
// };
// export default config;
// import type { Config } from 'tailwindcss'：导入 Tailwind 提供的 Config 类型接口，用于约束配置对象的结构，获得类型提示和校验。
// const config: Config = { ... }：定义符合 Config 类型的配置对象。
// export default config：导出配置，供 Tailwind 工具链读取。

// 2. content 配置：指定需要扫描的文件
// typescript
// content: [
//   './pages/**/*.{js,ts,jsx,tsx,mdx}',
//   './components/**/*.{js,ts,jsx,tsx,mdx}',
//   './app/**/*.{js,ts,jsx,tsx,mdx}',
// ]
// 这是 Tailwind 的内容扫描配置，用于指定需要检测的文件路径。Tailwind 会扫描这些文件中的类名（如 bg-blue-500），只生成项目中实际使用的 CSS 样式，从而减小最终 CSS 文件体积。
// **/* 表示递归匹配该目录下的所有子目录和文件。
// {js,ts,jsx,tsx,mdx} 表示匹配这些后缀的文件（覆盖 JavaScript、TypeScript、JSX/TSX 组件和 MDX 文档）。
// 路径覆盖了 pages（传统 Next.js 路由）、components（组件目录）和 app（Next.js 13+ App Router 目录），确保所有使用 Tailwind 类的文件都被扫描。

// 3. theme 配置：自定义主题
// theme 用于扩展或覆盖 Tailwind 的默认主题（如颜色、间距、动画等），extend 表示在默认主题基础上添加新配置（而非完全替换）。
// 3.1 gridTemplateColumns: { '13': 'repeat(13, minmax(0, 1fr))' }
// 扩展了网格布局的列数配置。Tailwind 默认提供 grid-cols-1 到 grid-cols-12，这里新增 grid-cols-13，表示 “13 列网格”，每列宽度自动平分可用空间。
// 使用场景：需要 13 列布局时，直接用 grid-cols-13 类名即可。
// 3.2 colors: { blue: { ... } }
// 自定义了 blue 颜色系列，覆盖 / 扩展了 Tailwind 默认的蓝色。
// blue-400: '#2589FE'、blue-500: '#0070F3'、blue-600: '#2F6FEB' 分别定义了不同深浅的蓝色。
// 使用场景：在组件中用 bg-blue-500（背景色）、text-blue-600（文字色）等类名直接引用。
// 3.3 keyframes: { shimmer: { ... } }
// 定义了一个名为 shimmer 的动画关键帧，用于实现 “闪烁 / 滑动” 效果：
// '100%': { transform: 'translateX(100%)' } 表示动画结束时，元素沿 X 轴平移 100% 宽度（从左到右滑动）。
// 使用场景：配合 Tailwind 的 animate-* 工具类使用，例如定义一个工具类后应用于加载动画：
// css
// @layer utilities {
//   .animate-shimmer {
//     animation: shimmer 1.5s infinite;
//   }
// }
// 然后在组件中用 <div className="animate-shimmer">...</div> 实现滑动效果。

// 4. plugins 配置：引入插件
// typescript
// plugins: [require('@tailwindcss/forms')]
// 引入了 @tailwindcss/forms 插件，这是 Tailwind 官方提供的表单样式插件，用于美化原生表单元素（如输入框、下拉菜单等），使其默认样式更统一、更美观，且支持 Tailwind 的工具类定制。
// 使用效果：导入后，表单元素会自动应用基础样式，无需手动编写大量 CSS。
