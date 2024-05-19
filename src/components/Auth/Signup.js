import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'; // Import eye icons
import GoogleIcon from '../../assets/images/Google.png';
import LogoIcon from '../../assets/images/LogoIcon.png';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const SignUp = () => {
  const { signup, signInWithGoogle, isLoggedIn } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const [passwordErrors, setPasswordErrors] = useState([]); // State to manage password error messages
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false); // State to manage sign-up button loading state
  const navigate = useNavigate();

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
    setIsSigningUp(true); // Set loading state to true
    try {
      if (validatePassword(password) && validateEmail(email)) {
        await signup(email, password);
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      // Map Firebase error codes to custom error messages
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email already exists!';
          break;
        default:
          errorMessage = 'An error occurred. Please try again.';
      }
      setError(errorMessage);
    } finally {
      setIsSigningUp(false); // Set loading state back to false
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Function to validate password
  const validatePassword = (password) => {
    const minLength = 8;
    const containsNumber = /\d/.test(password);
    const containsUppercase = /[A-Z]/.test(password);
    const containsLowercase = /[a-z]/.test(password);
    const containsSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      password
    );

    const errors = [];

    if (password.length < minLength) {
      errors.push('Must be at least 8 characters long.');
    }
    if (!containsNumber) {
      errors.push('Must contain at least one number.');
    }
    if (!containsUppercase) {
      errors.push('Must contain at least one uppercase letter.');
    }
    if (!containsLowercase) {
      errors.push('Must contain at least one lowercase letter.');
    }
    if (!containsSpecialChar) {
      errors.push('Must contain at least one special character.');
    }
    setPasswordErrors(errors);
    if (errors.length !== 0) {
      setError(null);
    }

    return errors.length === 0;
  };

  // Function to validate email
  const validateEmail = (email) => {
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
    return isValidEmail;
  };

  return (
    <div
      id='signup'
      className='lg:md:xl:h-screen lg:md:xl:pt-0 pt-24 h-max scale-[1.2] self-center w-max lg:md:px-[8rem] rounded-xl bg-white container mx-auto flex flex-col items-center justify-center'
    >
      <img src={LogoIcon} alt='Logo' className='w-20 h-20 mb-4' />

      <h2 className='text-2xl font-md mb-4'>Create Account</h2>

      <button
        onClick={handleGoogleSignIn}
        className='flex items-center mt-4 justify-start gap-4 w-[16rem] border-slate-800/25 border-[1px] text-sm bg-white text-black pl-8 pr-12 py-3 rounded-xl mb-4'
      >
        <img src={GoogleIcon} alt='Google Icon' className='w-5 h-5 mr-2' />
        Sign Up with Google
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
          <input
            type='email'
            id='email'
            placeholder='Email Id'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-2 border text-sm border-gray-300 rounded-md'
          />
          {/* Email Error Message */}
          {emailError && (
            <p className='text-sm mt-3 text-red-500'>{emailError}</p>
          )}
        </div>
        <div className='mb-4 w-full relative'>
          {/* Password Input */}
          <input
            type={showPassword ? 'text' : 'password'} // Show plain text if showPassword is true
            id='password'
            placeholder='Create Password'
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
        {/* Password Error Messages */}
        {passwordErrors.length > 0 && (
          <ul className='mb-4 text-sm text-red-500'>
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
        {error && (
          <p className='text-center mb-2 text-sm mt-3 text-red-500'>{error}</p>
        )}
        <button
          type='submit'
          className={`block w-full p-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-md mt-2 mb-4 ${
            isSigningUp ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSigningUp}
        >
          {isSigningUp ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      {/* Already have an account Login? */}
      <p className='mt-1 text-sm opacity-60'>
        Already have an account?{' '}
        <NavLink to={'/login'} className='mt-3 text-sm text-[#1c6db5]'>
          Login
        </NavLink>
      </p>
    </div>
  );
};

export default SignUp;
