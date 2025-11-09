import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, verify2FA, resend2FA, clearErrors } from '../../store/auth/actions';
import { RootState } from '../../store';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, requires2FA, tempToken } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔘 Login button clicked, form data:', formData);
    try {
      const result = await dispatch(login(formData) as any);
      console.log('✅ Login dispatch completed:', result);
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      console.error('❌ Login error caught in component:', err);
      // Error handled by reducer
    }
  };

  const handleVerify2FA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (twoFactorCode.length === 6 && tempToken) {
      try {
        await dispatch(verify2FA({ tempToken, code: twoFactorCode }) as any);
      } catch (err) {
        // Error handled by reducer
      }
    }
  };

  const handleResendCode = async () => {
    if (tempToken && resendCooldown === 0) {
      try {
        await dispatch(resend2FA(tempToken) as any);
        setResendCooldown(60);
      } catch (err) {
        // Error handled by reducer
      }
    }
  };

  // Show 2FA step
  if (requires2FA && tempToken) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
          <p className="text-sm text-gray-600 mt-2">
            We've sent a 6-digit code to <strong>{formData.email}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify2FA}>
          <div className="mb-4">
            <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-center text-2xl tracking-widest font-mono"
              id="twoFactorCode"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-800 hover:bg-teal-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mb-3"
            disabled={loading || twoFactorCode.length !== 6}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400 transition-colors"
            >
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : 'Resend code'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setTwoFactorCode('');
              dispatch(clearErrors());
              window.location.reload(); // Reset to login form
            }}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to login
          </button>
        </form>
      </div>
    );
  }

  // Show login form
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:border-gray-400 transition-all text-gray-900 placeholder:text-gray-400"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:border-gray-400 transition-all pr-10 text-gray-900 placeholder:text-gray-400"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>
          <Link 
            to="/forgot-password" 
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-800 hover:bg-teal-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          disabled={loading || !formData.email || !formData.password}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <small className="text-gray-600 text-xs">
          <strong className="block mb-1 text-gray-700">Demo Credentials:</strong>
          Email: admin@jewelry.com<br />
          Password: admin123
        </small>
      </div>
    </div>
  );
};

export default Login;

