# 🎵 Spotify Clone
Dự án Spotify Clone là một ứng dụng web mô phỏng nền tảng nghe nhạc trực tuyến, bao gồm hệ thống phát nhạc, video, danh sách phát, tài khoản người dùng, và trang quản trị.

## 📁 Cấu trúc dự án

| Thư mục/ Tệp | Mô tả |
|---------------|-------|
| **Spotify/** | Thư mục gốc của dự án |
| **client/** | Frontend React (Vite) |
| **client/src/** | Mã nguồn frontend |
| **client/public/** | Tài nguyên tĩnh |
| **client/package.json** | Thông tin và dependencies |
| **client/vite.config.js** | Cấu hình Vite |
| **server/** | Backend Django |
| **server/media/** | File media (ảnh, nhạc, video upload) |
| **server/music/** | App xử lý dữ liệu nhạc |
| **server/server/** | Cấu hình Django |
| **server/db.sqlite3** | Cơ sở dữ liệu SQLite |
| **server/manage.py** | Công cụ quản lý Django |
| **server/requirements.txt** | Thư viện Python cần cài |
| **server/README.md** | Hướng dẫn sử dụng |
| **server/LICENSE** | Giấy phép |

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/HuynhQuocTien/Spotify.git
cd Spotify 
```

### 2. Cài đặt Backend (Django) on Linux 
 SSH vào EC2 instance:
    ```bash
        ssh -i "your-key.pem" ubuntu@your-name
    ```
- Cài đặt Python và các công cụ cần thiết:
    ```bash
        sudo apt update
        sudo apt install python3 python3-venv python3-pip -y
    ```
- Chạy Backend
    ```bash
        cd server
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt

        # Khởi tạo cơ sở dữ liệu
        python3 manage.py makemigrations
        python3 manage.py migrate

        # (Tuỳ chọn) Tạo tài khoản admin
        python3 manage.py createsuperuser

        # Chạy server Django
        python3 manage.py runserver

    ```

### 3. Cài đặt Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

| Thành phần | Đường dẫn |
|------------|-----------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **Trang Admin** | [http://localhost:8000/admin](http://localhost:8000/admin) |
