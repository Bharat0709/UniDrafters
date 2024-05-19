import React, { useState } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import Logo from '../../assets/images/Logo.png';
import ProfilePic from '../../assets/images/profile.jpg';
import { useNavigate, NavLink } from 'react-router-dom';

function Profile() {
  const { user, logout } = useFirebase();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const signout = await logout();
    console.log(signout);
    if (signout === true) {
      localStorage.clear();
      navigate('/');
    } else {
      alert('Error Signing Out!!!');
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className='p-4 pl-6 flex self-center justify-between w-full text-black bg-gradient-to-r from-slate-900 to-slate-700 items-center backdrop-blur-lg'>
      <div className='flex items-center'>
        {/* NavLink to Home */}
        <NavLink to='/' className='flex items-center'>
          <img src={Logo} alt='Logo' className='h-13 w-32' />
        </NavLink>
      </div>
      <div className='lg:flex lg:items-center pr-2 lg:space-x-2'>
        <div className='relative'>
          <img
            src={user && user.photoURL ? user.photoURL : ProfilePic}
            alt='Profile'
            className='h-10 w-10 rounded-full cursor-pointer'
            onClick={toggleProfile}
          />
          {isProfileOpen && (
            <div className='absolute flex flex-col gap-0 top-10 right-0 bg-white shadow-md rounded-md p-2'>
              <p className='text-sm p-2'>{user.displayName}</p>
              <p className='text-xs p-2 text-gray-500'>{user.email}</p>
              <NavLink
                to='/orders'
                className='text-[#1c6db5] text-center bg-slate-100 rounded-full mt-2 mb-2 px-4 py-2 text-sm'
              >
                My Orders
              </NavLink>
              <button
                className='text-sm m-2 hover:underline text-center text-white mt-2 px-4 p-2 rounded-full bg-[#004182]'
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Profile;
