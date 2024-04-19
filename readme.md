# proxy-mosaic
- 本地CICD流水线工程
1. 手动执行触发
2. lint规范校验
3. unit单元测试
4. build构建打包
5. 传送服务器
6. nginx配置


# 功能
- 1. 拉取所有项目到本地
- - 1.1 拉取单个项目 
- 2. 执行所有项目的打包构建 lint build
- - 2.2 执行单个项目打包构建 lint build
- 2. 将所有资源部署到指定服务器
- - 2.2 将单个项目部署到指定服务器
- - 3.服务器nginx配置


# 扩展
1. 环境配置方式？ 
2. 借助node？(更贴近前端开发工作者的习惯？) 
3. 其他方式？
- 部署log日志形式
1. 本地文件式？
2. 可视化界面？
- 控制台样式
1. 动画
2. log颜色