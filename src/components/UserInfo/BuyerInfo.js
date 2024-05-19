import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import { useNavigate } from 'react-router-dom';
import Profile from '../Profileheader/Profileheader';
import { NavLink } from 'react-router-dom';
import ErrorAlert from '../Alerts/Error';

const collegeNames = [
  'AIACTR',
  'AMITY',
  'BMCEM',
  'BPIT',
  'BVCOE',
  'BMIET',
  'CBPGEC',
  'DITM',
  'DITE',
  'DTC',
  'ADGITM',
  'GBPGEC',
  'GNIT',
  'GTB4CEC',
  'GTBIT',
  'HMR',
  'JIMS',
  'MAIT',
  'MSIT',
  'MSWAMI',
  'NPTI',
  'SBIT',
  'TIIPS',
  'VIPS',
];

const branches = [
  'CSE',
  'CIV',
  'ECE',
  'EE',
  'EEE',
  'ICE',
  'IT',
  'MAE',
  'ME',
  'MET',
  'PE',
  'TE',
  'CST',
  'ITE',
  'CSE-CS',
  'AIML',
  'IOT',
  'AIDS',
  'CSE-AI',
  'CSE-AIDS',
  'CSE-DS',
  'ECE-ACT',
  'EE-VLSI',
  'CS',
];

const BuyerForm = () => {
  const { user, handleCreateBuyerInfo, checkUserProfile } = useFirebase();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    collegeName: '',
    collegeYear: '',
    collegeBranch: '',
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    mobileNumber: false,
    collegeName: false,
    collegeYear: false,
    collegeBranch: false,
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!user) {
          navigate('/signup');
        } else if (user && loading) {
          const profileExists = await checkUserProfile(user.uid, setLoading);
          if (
            profileExists.identity === 'buyer' ||
            profileExists.identity === 'seller'
          ) {
            navigate('/products');
          }
          if (user.displayName) {
            setBuyerInfo((prevBuyerInfo) => ({
              ...prevBuyerInfo,
              email: user.email,
              name: user.displayName,
            }));
          } else {
            setBuyerInfo((prevBuyerInfo) => ({
              ...prevBuyerInfo,
              email: user.email,
            }));
          }
        }
      } catch (error) {
        setErrorMessage('Error Checking User Profile');
      }
    };
    checkUser();
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo({ ...buyerInfo, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted(e.target.checked);
    setErrors({ ...errors, terms: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {};
    Object.entries(buyerInfo).forEach(([key, value]) => {
      if (!value) {
        formErrors[key] = true;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      // Set errors for empty fields
      setErrors({ ...errors, ...formErrors });
      return;
    }

    try {
      setSubmitting(true);
      const result = await handleCreateBuyerInfo(buyerInfo);
      if (result === 'success') {
        navigate('/products');
      } else {
        setErrorMessage('An error occurred while processing your request.');
      }
      setBuyerInfo({
        mobileNumber: '',
        collegeName: '',
        collegeYear: '',
        collegeBranch: '',
      });
    } catch (error) {
      setLoading(true);
      setErrorMessage('An error occurred while processing your request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center text-center h-screen self-center'>
        Loading...
      </div>
    );
  }
  return (
    <>
      <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      <Profile />
      <div
        id='buyerdetails'
        className='p-[2rem] mt-2 flex flex-col gap-3 bg-white justify-center items-center w-auto'
      >
        <h2 className='text-4xl font-semibold mb-8'>Complete Profile</h2>
        <div className='justify-center items-center flex flex-col gap-10 max-w-[64rem] bg-gradient-to-r from-blue-100 to-cyan-200  px-10 rounded-xl py-8'>
          <h2 className='text-2xl font-semibold'>Buyer Details</h2>
          <form
            className='flex w-full justify-center flex-wrap items-center gap-6'
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor='name' className='block mb-2'>
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                required
                value={buyerInfo.name}
                onChange={handleChange}
                placeholder='Enter Name'
                disabled={user !== null && user.displayName !== null}
                className={`w-[18rem] p-2 rounded-md text-sm ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className='text-red-500'>Name is required</p>}
            </div>
            <div>
              <label htmlFor='email' className='block mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                required
                name='email'
                placeholder='Enter Email'
                value={buyerInfo.email}
                onChange={handleChange}
                disabled={user !== null}
                className={`w-[18rem] p-2 rounded-md text-sm  ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className='text-red-500'>Email is required</p>
              )}
            </div>
            <div>
              <label htmlFor='mobileNumber' className='block mb-2'>
                Mobile Number
              </label>
              <input
                type='tel'
                required
                id='mobileNumber'
                name='mobileNumber'
                placeholder='10 Digit Mobile Number'
                value={buyerInfo.mobileNumber}
                onChange={handleChange}
                className={`w-[18rem] p-2 rounded-md text-sm  ${
                  errors.mobileNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.mobileNumber && (
                <p className='text-red-500'>Mobile Number is required</p>
              )}
            </div>
            <div>
              <label htmlFor='collegeName' className='block mb-2'>
                College Name
              </label>
              <select
                id='collegeName'
                name='collegeName'
                value={buyerInfo.collegeName}
                onChange={handleChange}
                required
                className={`w-[18rem] p-2 rounded-md ${
                  errors.collegeName ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select College</option>
                {collegeNames.map((college, index) => (
                  <option key={index} value={college}>
                    {college}
                  </option>
                ))}
              </select>
              {errors.collegeName && (
                <p className='text-red-500'>College Name is required</p>
              )}
            </div>
            <div>
              <label htmlFor='collegeYear' className='block mb-2'>
                Semester
              </label>
              <select
                id='collegeYear'
                name='collegeYear'
                value={buyerInfo.collegeYear}
                onChange={handleChange}
                required
                className={`w-[18rem] p-2 rounded-md ${
                  errors.collegeYear ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Semester</option>
                <option value='1'>1</option>
                <option value='2'>2</option>
              </select>
              {errors.collegeYear && (
                <p className='text-red-500'>Semester is required</p>
              )}
            </div>
            <div>
              <label htmlFor='collegeBranch' className='block mb-2'>
                Branch
              </label>
              <select
                id='collegeBranch'
                name='collegeBranch'
                value={buyerInfo.collegeBranch}
                onChange={handleChange}
                required
                className={`w-[18rem] p-2 rounded-md ${
                  errors.collegeBranch ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Branch</option>
                {branches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              {errors.collegeBranch && (
                <p className='text-red-500'>Branch is required</p>
              )}
            </div>
          </form>
          <div>
            <input
              type='checkbox'
              id='terms'
              name='terms'
              checked={termsAccepted}
              onChange={handleCheckboxChange}
              required
            />
            <label htmlFor='terms' className='ml-2'>
              I agree to the terms and conditions:
            </label>
            {errors.terms && (
              <p className='text-red-500'>
                Please accept the terms and conditions
              </p>
            )}
          </div>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={!termsAccepted || submitting}
            className={`w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white py-2 rounded-md ${
              !termsAccepted || submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
        <p className='my-2 text-md opacity-100'>
          Not a Buyer?{' '}
          <NavLink to={'/sellerinfo'} className='text-[#1c6db5] mt-2 text-md z'>
            Sell Drafter
          </NavLink>
        </p>
        <div className='flex flex-col justify-center mb-4 px-10 py-8 lg:md:xl:w-max rounded-xl bg-gradient-to-r from-yellow-200 to-yellow-300'>
          <h2 className='text-2xl font-semibold mb-4'>Terms and Conditions</h2>
          <ul className='list-disc list-inside'>
            <li className='text-sm'>
              By checking the box below, you agree to the terms and conditions
              outlined here.
            </li>
            <li className='text-sm'>
              The product will not be delivered to your home; you have to
              collect it from your college only.
            </li>
            {/* Add more terms as needed */}
          </ul>
        </div>
      </div>
    </>
  );
};

export default BuyerForm;
