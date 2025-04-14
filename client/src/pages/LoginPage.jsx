"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginPage.css"
import api from "../services/api" // Import API service

const LoginPage = ({ onClose }) => {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot' | 'otp' | 'reset'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Xử lý submit tùy theo view hiện tại
      switch (view) {
        case 'login':
          // Xử lý đăng nhập
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate('/');
          break;
        case 'signup':
          // Xử lý đăng ký
          await new Promise(resolve => setTimeout(resolve, 1000));
          setView('otp');
          break;
        case 'forgot':
          // Gửi yêu cầu quên mật khẩu
          await new Promise(resolve => setTimeout(resolve, 1000));
          setView('otp');
          break;
        case 'otp':
          // Xác thực OTP
          await new Promise(resolve => setTimeout(resolve, 1000));
          setView('reset');
          break;
        case 'reset':
          // Đặt lại mật khẩu
          await new Promise(resolve => setTimeout(resolve, 1000));
          setView('login');
          break;
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn reload form mặc định
    setLoading(true);
    setError('');
    try {
      const response = await api.login({
        username: formData.username,
        password: formData.password,
      });
  
      console.log('Login response:', response);
      // // Tính toán thời gian hết hạn 12 giờ từ hiện tại
      // const expirationTime = new Date();
      // expirationTime.setHours(expirationTime.getHours() + 12); // Thêm 12 giờ vào thời gian hiện tại
        
      // // Lưu token vào cookie, hết hạn trong 12 giờ
      // Cookies.set('token', response.access, { expires: expirationTime, path: '' });
      // Cookies.set('refresh_token', response.refresh, { expires: expirationTime, path: '' });
      // Nếu response trả về thành công
      localStorage.setItem('token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
  
      navigate('/'); // Chuyển hướng về trang chính
      window.location.reload();
    } catch (err) {
      // Nếu là lỗi từ server (401, 400,...)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail); // Hiển thị thông báo từ backend
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API đăng ký
      const response = await api.signup({ email: formData.email, username: formData.username, password: formData.password });
      if (response.status === 201) {
        // Chuyển hướng về trang xác thực OTP
        setView('otp');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API gửi yêu cầu quên mật khẩu
      const response = await api.forgotPassword({ email: formData.email });
      if (response.status === 200) {
        // Chuyển hướng về trang xác thực OTP
        setView('otp');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API đặt lại mật khẩu
      const response = await api.resetPassword({ newPassword: formData.newPassword, confirmPassword: formData.confirmPassword });
      if (response.status === 200) {
        // Chuyển hướng về trang đăng nhập
        setView('login');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API xác thực OTP
      const response = await api.verifyOTP({ otp: formData.otp });
      if (response.status === 200) {
        // Chuyển hướng về trang đặt lại mật khẩu
        setView('reset');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API gửi lại mã OTP
      const response = await api.resendOTP({ email: formData.email });
      if (response.status === 200) {
        // Hiển thị thông báo gửi lại mã thành công
        setError('Mã OTP đã được gửi lại đến email của bạn.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setView('login');
    setFormData({
      username: '',
      password: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
    setLoading(false);
    setError('');
    onClose();
  };
  const handleBack = () => {
    switch (view) {
      case 'signup':
        setView('login');
        break;
      case 'forgot':
        setView('login');
        break;
      case 'otp':
        setView('signup');
        break;
      case 'reset':
        setView('otp');
        break;
      default:
        handleClose();
    }
  };

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <>
            <h2 className="modal-title">Đăng nhập vào Spotify</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Ghi nhớ đăng nhập
                </label>
                <a
                  type="button"
                  className="text-button"
                  onClick={() => setView('forgot')}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button type="submit" className="primary-button" disabled={loading} onClick={handleLogin}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="divider">hoặc</div>

            <button
              className="secondary-button"
              onClick={() => setView('signup')}
            >
              Đăng ký tài khoản Spotify
            </button>
          </>
        );

      case 'signup':
        return (
          <>
            <h2 className="modal-title">Đăng ký Spotify</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Tạo tên đăng nhập"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tạo mật khẩu"
                  required
                />
              </div>

              <button type="submit" className="primary-button" disabled={loading} onClick={handleSignup}>
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </form>

            <div className="divider">hoặc</div>

            <a
              className="text-button"
              onClick={() => setView('login')}
            >
              Đã có tài khoản? Đăng nhập
            </a>
          </>
        );

      case 'forgot':
        return (
          <>
            <h2 className="modal-title">Quên mật khẩu</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <button type="submit" className="primary-button" disabled={loading} onClick={handleForgotPassword}>
                {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              </button>
            </form>

            <a
              className="text-button"
              onClick={() => setView('login')}
            >
              Quay lại đăng nhập
            </a>
          </>
        );

      case 'otp':
        return (
          <>
            <h2 className="modal-title">Xác thực OTP</h2>
            {error && <div className="error-message">{error}</div>}

            <p className="instruction">Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra và nhập mã bên dưới.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Mã OTP</label>
                <input
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Nhập 6 chữ số"
                  required
                />
              </div>

              <button type="submit" className="primary-button" disabled={loading} onClick={handleVerifyOTP}>
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
            </form>

            <div className="resend-otp">
              <span>Không nhận được mã?</span>
              <a type="button" className="text-button" onClick={handleResendOTP}>Gửi lại</a>
            </div>
          </>
        );

      case 'reset':
        return (
          <>
            <h2 className="modal-title">Thiết lập mật khẩu mới</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button type="submit" className="primary-button" disabled={loading} onClick={handleResetPassword}>
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <div className="login-modal">
      <div className="login-container">
        <button className="close-button" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="login-card">
          <div className="logo-container">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="#1DB954"
              fillRule="evenodd"
              clipRule="evenodd"
              className="spotify-logo"
            >
              <path d="M19.098 10.638c-3.868-2.297-10.248-2.508-13.941-1.387-.593.18-1.22-.155-1.399-.748-.18-.593.154-1.22.748-1.4 4.239-1.287 11.285-1.038 15.738 1.605.533.317.708 1.005.392 1.538-.316.533-1.005.709-1.538.392zm-.126 3.403c-.272.44-.847.578-1.287.308-3.225-1.982-8.142-2.557-11.958-1.399-.494.15-1.017-.129-1.167-.623-.149-.495.13-1.016.624-1.167 4.358-1.322 9.776-.682 13.48 1.595.44.27.578.847.308 1.286zm-1.469 3.267c-.215.354-.676.465-1.028.249-2.818-1.722-6.365-2.111-10.542-1.157-.402.092-.803-.16-.895-.562-.092-.403.159-.804.562-.896 4.571-1.045 8.492-.595 11.655 1.338.353.215.464.676.248 1.028zm-5.503-17.308c-6.627 0-12 5.373-12 12 0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12z" />
            </svg>
          </div>

          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;