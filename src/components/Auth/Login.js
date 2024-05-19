import React, { useEffect, useState } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'; // Import eye icons
import GoogleIcon from '../../assets/images/Google.png';
import LogoIcon from '../../assets/images/LogoIcon.png';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import SuccessAlert from '../Alerts/Success';

const Login = () => {
  const { login, signInWithGoogle, isLoggedIn } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // State to manage login button loading state
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      const selectedOption = localStorage.getItem('selectedOption');
      if (selectedOption === 'BUY') {
        navigate('/buyerinfo');
      } else if (selectedOption === 'SELL') {
        navigate('/sellerinfo');
      } else {
        navigate('/buyerinfo');
      }
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      // Handle specific errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'The sign-in popup was closed by the user.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'The sign-in popup was blocked by the browser.';
          break;
        // Add more cases for other error codes as needed
        default:
          errorMessage = 'An error occurred. Please try again.';
          break;
      }
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); // Set loading state to true
    try {
      const loginError = await login(email, password);
      if (loginError === null) {
        setSuccessMessage('Logged in Successfully');
      } else {
        let errorMessage = 'An error occurred. Please try again.';
        // Map Firebase error codes to custom error messages
        switch (loginError.code) {
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email address or password';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Invalid password.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'User not found.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'User account has been disabled.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          default:
            errorMessage = 'An error occurred. Please try again.';
        }
        setError(errorMessage);
      }
    } finally {
      setIsLoggingIn(false); // Set loading state back to false
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
      <div
        id='login'
        className='lg:md:xl:h-screen lg:md:xl:pt-0 pt-24 h-max scale-[1.2] self-center w-max lg:md:px-[8rem] rounded-xl bg-white container mx-auto flex flex-col items-center justify-center'
      >
        {/* Logo Icon */}
        <img src={LogoIcon} alt='Logo' className='w-20 h-20 mb-4' />
        {/* Login Text */}
        <h2 className='text-2xl font-md mb-4'>Login</h2>
        {/* Sign In with Google Button */}
        <button
          onClick={handleGoogleSignIn}
          className='flex items-center mt-4 justify-start gap-4 w-[16rem] border-slate-800/25 border-[1px] text-sm bg-white text-black pl-8 pr-12 py-3 rounded-md mb-4'
        >
          <img src={GoogleIcon} alt='Google Icon' className='w-5 h-5 mr-2' />
          Sign In with Google
        </button>
        {/* OR Divider */}
        <div className='flex items-center mb-4'>
          <hr className='flex-grow border-gray-300' />
          <span className='mx-2'>OR</span>
          <hr className='flex-grow border-gray-300' />
        </div>
        {/* Email and Password Input Fields */}
        <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
          <div className='mb-4'>
            {/* Email Input */}
            <input
              type='email'
              id='email'
              placeholder='Email Id'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-2 border text-sm border-gray-300 rounded-md'
            />
          </div>
          <div className='mb-4 w-full relative'>
            {/* Password Input */}
            <input
              type={showPassword ? 'text' : 'password'} // Show plain text if showPassword is true
              id='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Call setPassword on password change
              className='w-[16rem] p-2 border text-sm border-gray-300 rounded-md pr-10'
            />
            {/* Eye Button to toggle password visibility */}
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute top-0 right-0 bottom-0 flex items-center px-3 focus:outline-none'
            >
              {showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
            </button>
          </div>
          {error && (
            <p className='text-center mb-2 text-sm mt-3 text-red-500'>
              {error}
            </p>
          )}
          <button
            type='submit'
            className={`block w-full p-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-md mt-2 mb-4 ${
              isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {/* Don't have an account? Sign Up */}
        <p className='mt-1 text-sm opacity-60'>
          Don't have an account?{' '}
          <NavLink to={'/signup'} className='text-[#1c6db5] mt-2 text-sm z'>
            Sign Up
          </NavLink>
        </p>
      </div>
    </>
  );
};

export default Login;
