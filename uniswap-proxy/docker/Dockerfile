FROM nginx:alpine

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建目录结构
RUN mkdir -p /usr/share/nginx/html/js

# 复制注入脚本
COPY inject.js /usr/share/nginx/html/inject.js

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"] 