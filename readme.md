# proxy-mosaic

# 安装
```js
npm install -g proxy-mosaic
// 或者
yarn add proxy-mosaic -g
```

# 使用
```js
// 创建mosaic工程
mosaic create 'projectName' 

// 克隆所需管理的前端应用
mosaic clone  // 默认即为 mosaic clone all  ===>  克隆全部应用
mosaic clone '[appName...]' // 指定clone的app应用

// 切换分支
mosaic checkout 'branch' // 默认即为 mosaic checkout 'branch' all  ===>  统一切换指定分支
mosaic checkout 'branch' '[appName...]' // 指定切换分支的应用

// 打包构建前端应用
mosaic build  // 默认即为 mosaic build all  ===>  构建全部应用
mosaic build  '[appName...]' // 指定打包的app应用

mosaic build -c // 选择打包模式
mosaic build -a // 新增打包模式


// 部署
mosaic deploy // 默认即为 mosaic deploy all   ===>  部署全部应用
mosaic deploy  '[appName...]' // 指定部署的app应用
```


# 服务器私钥配置为免登
```js
// 查看本地公钥
cat ~/.ssh/id_rsa.pub
// 查看本地私钥
cat ~/.ssh/id_rsa

// 生成密钥
ssh-keygen -t rsa

// 服务器配置本地公钥  #请确保目标服务器上~/.ssh目录及其内部的authorized_keys文件拥有正确的权限
cat ~/.ssh/id_rsa.pub | ssh 用户名@服务器ip 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys'

// 服务编辑配置
// 服务器路径
cd /etc/ssh/sshd_config

// 将以下配置项添加至sshd_config文件
PubkeyAuthentication yes
AuthorizedKeysFile      %h/.ssh/authorized_keys


// 重启服务器ssh服务生效配置
sudo service ssh restart
```