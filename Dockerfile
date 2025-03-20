# Sử dụng image Node.js chính thức từ Docker Hub
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có) vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN yarn

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng mà ứng dụng của bạn sẽ chạy (ví dụ: 3000)
EXPOSE 8000

# Lệnh để chạy ứng dụng khi container khởi động
CMD ["yarn start", "index.js"]
