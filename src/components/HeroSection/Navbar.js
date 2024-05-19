import React, { useState } from 'react';
import Logo from '../../assets/images/Logo.png';
import { NavLink } from 'react-router-dom';

function Navbar() {
  // Pass scrollToSection as a prop
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    localStorage.setItem('selectedOption', option);
  };
  return (
    <nav className='p-4 pl-10 flex self-center justify-between w-full text-black bg-gradient-to-r from-slate-900 to-slate-700 items-center backdrop-blur-lg'>
      <div className='flex items-center'>
        <img src={Logo} alt='Logo' className='h-13 w-32' />
      </div>
      {/* Mobile Menu Button */}
      <div className='lg:hidden'>
        <button
          onClick={toggleMenu}
          className='text-white hover:bg-blue-950  focus:outline-none bg-gradient-to-r from-slate-900 to-slate-700 p-2 rounded-md'
        >
          <svg
            className='h-6 w-6 fill-current'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            {isOpen ? (
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M4 6h16v1H4V6zm0 5h16v1H4v-1zm16 4H4v1h16v-1z'
              />
            ) : (
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M4 6h16v2H4v-2zm0 5h16v2H4v-2zm16 5H4v2h16v-2z'
              />
            )}
          </svg>
        </button>
      </div>
      {/* Desktop Menu Items */}
      <div className='hidden lg:flex lg:items-center pr-4 lg:space-x-2'>
        <NavLink
          to={'/signup'}
          id='SignUpButton'
          className='hidden lg:block p-[12px] mr-2 text-sm  text-sky-700 bg-white font-bold pl-8 pr-8 rounded-full'
          onClick={() => handleOptionClick('BUY')} // Modified to call handleMenuItemClick
        >
          Buy
        </NavLink>{' '}
        <NavLink
          to={'/signup'}
          id='LoginButton'
          className='hidden lg:block text-md border border-white bg-gradient-to-r from-slate-900 to-slate-700 text-white p-2 pl-8 pr-8 rounded-full'
          onClick={() => handleOptionClick('SELL')} // Modified to call handleMenuItemClick
        >
          Sell
        </NavLink>
      </div>
      {/* Mobile Menu Items */}
      {isOpen && (
        <div className='lg:hidden absolute rounded-xl top-20 right-0 m-auto  left-0 bg-white w-10/12 text-black'>
          <div className='flex flex-col text-center p-4 space-y-2 text-black gap-2 '>
            <NavLink
              to={'/signup'}
              className='lg:block mr-2 text-sm  text-white pb-2 bg-sky-950 p-2 py-3 pl-4 pr-4 rounded-full'
              onClick={() => handleOptionClick('BUY')} // Modified to call handleMenuItemClick
            >
              Buy
            </NavLink>{' '}
            <NavLink
              to={'/signup'}
              className='lg:block mr-2 text-sm  text-black border py-3 pb-2 p-2 pl-4 pr-4 rounded-full'
              onClick={() => handleOptionClick('SELL')} // Modified to call handleMenuItemClick
            >
              Sell
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
