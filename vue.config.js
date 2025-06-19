const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    devtool: 'source-map', // Evita el uso de eval
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Cambia esto al puerto real de tu backend
        changeOrigin: true
      }
    }
  }
})
