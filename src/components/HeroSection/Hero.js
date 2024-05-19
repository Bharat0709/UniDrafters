import React from 'react';
import HeroImage from '../../assets/images/HeroImage.png';
import Navbar from './Navbar';
import { NavLink } from 'react-router-dom';

export default function Hero() {
  const handleOptionClick = (option) => {
    localStorage.setItem('selectedOption', option);
  };

  return (
    <>
      <Navbar />
      <div className='flex h-screen lg:md:text-left p-6 pt-14 lg:md:pt-0 pt-35  text-center flex-wrap justify-around w-full items-center'>
        <div className='flex flex-col items-center justify-center max-md:max-w-full'>
          <div className='md:lg:text-5xl text-[1.6rem] not-italic text-black capitalize leading-[30px] max-md:max-w-full'>
            Connecting Freshers{' '}
            <div className='sm:lg:md:-ml-3 -ml-3 md:lg:text-5xl text-[1.8rem] pl-3 sm:lg:md:text-left text-center w-max self-center mx-auto pr-3 p-1 mt-5 rounded-md  bg-[#f7f6f1]'>
              One Drafter at a Time
            </div>
          </div>
          <div className='mt-14 xl:sm:lg:md:text-left text-[1.11rem] self-start not-italic leading-8 text-black text-center capitalize max-md:mt-10 max-md:max-w-9/12'>
            A platform where seniors can sell their drafters to juniors
      
          </div>
          <div className='flex w-full lg:md:justify-start gap-5 justify-center self-start mt-8 text-base leading-7 capitalize whitespace-nowrap'>
            <NavLink
              to='/signup'
              onClick={() => handleOptionClick('BUY')}
              className='flex flex-col justify-center px-11 py-2.5 not-italic text-white bg-gradient-to-r from-slate-900 to-slate-700 rounded-[150px] max-md:px-10'
            >
              BUY
            </NavLink>
            <div className='flex flex-col justify-center px-11 py-2.5 not-italic text-slice-900 bg-white border border-sky-900 border-solid rounded-[150px] max-md:px-10'>
              <NavLink to='/signup' onClick={() => handleOptionClick('SELL')}>
                SELL
              </NavLink>
            </div>
          </div>
          <div className='flex gap-5 w-full self-start mt-16 text-black max-md:mt-10'>
            <div className='flex flex-col w-full items-start gap-3 my-auto'>
              <div className='text-[1.2rem] text-center lg:md:text-left w-full not-italic'>
                Our Average Price - ₹250{' '}
              </div>
              <div className='text-[1.2rem] text-center lg:md:text-left w-full not-italic'>
                Market Average Price - ₹650{' '}
              </div>
            </div>
          </div>
        </div>
        <img
          src={HeroImage}
          alt='Logo'
          className='h-[18rem] md:lg:h-[31rem] w-auto'
        />
      </div>
    </>
  );
}
