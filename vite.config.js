import {
  defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  resolve
} from 'path'
import requireTransform from 'vite-plugin-require-transform';
import {
  url,
  serve
} from 'config-yml'

export default defineConfig({
  plugins: [vue(), requireTransform({}), ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true, //自动打开 
    proxy: { // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
      // 正则表达式写法
      '/room': {
        target: `http://${url.ip}:${serve.port}/room`, // 后端服务实际地址
        changeOrigin: true, //开启代理
        rewrite: (path) => path.replace(/^\/room/, '')
      }
    }
  }
})