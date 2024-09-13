import React, { useEffect } from 'react';

const SuccessAlert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className='fixed top-0 left-0 right-0 z-50 w-max m-auto items-center flex justify-center'>
      <div
        className='bg-green-100 text-black py-2 px-4 rounded-md shadow-lg mt-8 transform transition-all duration-500'
        style={{ opacity: message ? 1 : 0, translateY: message ? 0 : '-100%' }}
      >
        <p>{message}</p>
      </div>
    </div>
  );
};

export default SuccessAlert;
