import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import Profile from '../Profileheader/Profileheader';
import { useNavigate } from 'react-router-dom';
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
const SellerForm = () => {
  const [imagesPreview, setImagesPreview] = useState([]);
  const [sellerInfo, setSellerInfo] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    collegeName: '',
    collegeYear: '',
    collegeBranch: '',
    photos: [],
    condition: '',
    items: '',
    minimumPrice: '',
    maximumRetailPrice: '',
    company: '',
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    mobileNumber: false,
    collegeName: false,
    collegeYear: false,
    collegeBranch: false,
    condition: false,
    items: false,
    minimumPrice: false,
    availableDate: false,
    photos: false,
    company: false,
    maximumRetailPrice: false,
  });
  const [creatingProfile, setCreatingProfile] = useState(false); // State to track profile creation process
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { handleCreateSellerInfo, checkUserProfile, user } = useFirebase();
  const [errorMessage, setErrorMessage] = useState('');
  const [termsChecked, setTermsChecked] = useState(false); // State for terms and conditions checkbox
  // Your existing state variables and functions

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
            setSellerInfo((prevSellerInfo) => ({
              ...prevSellerInfo,
              email: user.email,
              name: user.displayName,
            }));
          } else {
            setSellerInfo((prevSellerInfo) => ({
              ...prevSellerInfo,
              email: user.email,
            }));
          }
        }
      } catch (error) {
        setErrorMessage('Error Checking User Profile');
      }
    };
    checkUser();
  }, [user, loading, navigate]); // Include checkUserProfile in the dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerInfo({ ...sellerInfo, [name]: value });
    // Clear error message when user starts typing
    setErrors({ ...errors, [name]: false });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      files.splice(3);
      alert('You can only upload a maximum of 3 pictures');
    }
    setSellerInfo({ ...sellerInfo, photos: files });

    const imageNames = files.map((file) => file.name);
    setImagesPreview(imageNames);
    setErrors({ ...errors, photos: false });
  };

  const handleChangeTerms = () => {
    setTermsChecked(!termsChecked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsChecked) {
      alert('Please accept the terms and conditions before submitting.');
      return;
    }
    // Disable the button and change text
    setCreatingProfile(true);

    // Validate form fields
    const formErrors = {};
    Object.keys(sellerInfo).forEach((key) => {
      if (
        !sellerInfo[key] &&
        key !== 'addons' &&
        key !== 'addonsPrice' &&
        key !== 'availableDate'
      ) {
        formErrors[key] = true;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      // Set errors for empty fields
      setErrors({ ...errors, ...formErrors });
      // Re-enable button
      setCreatingProfile(false);
      return;
    }

    try {
      setCreatingProfile(true);
      const result = await handleCreateSellerInfo(sellerInfo);
      if (result === 'success') {
        navigate('/products');
      } else if (result === 'nopics') {
        setErrorMessage('Please Upload at least 1 image');
        return;
      } else {
        setErrorMessage('An error occurred while processing your request.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while processing your request.');
    } finally {
      setCreatingProfile(false);
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
    <div className='flex flex-col justify-center items-center'>
      <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      <Profile />
      <div
        id='sellerdetails'
        className='p-[2rem] m-3 flex flex-col gap-3 bg-white justify-center items-center w-'
      >
        <h2 className='text-[34px] font-semibold mb-8'>Complete Profile</h2>
        <div className='flex md:xl:lg:w-full mb-2 flex-col px-10 rounded-xl bg-gradient-to-r from-amber-200 to-yellow-400 py-8 bg-blue-100'>
          <h2 className='text-2xl font-semibold mb-4 rounded'>
            Personal Details
          </h2>
          <div className='flex flex-wrap mt-2 gap-4'>
            <div className='mb-1'>
              <label htmlFor='name' className='block mb-2'>
                Name
              </label>
              <input
                type='text'
                id='name'
                required
                placeholder='Enter Name'
                name='name'
                value={sellerInfo.name}
                onChange={handleChange}
                disabled={user !== null && user.displayName !== null}
                className={`w-[18rem] p-2 rounded-md ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className='text-red-500'>Name is required</p>}
            </div>
            <div className='mb-1'>
              <label htmlFor='email' className='block mb-2'>
                Email
              </label>
              <input
                type='email'
                id='email'
                required
                placeholder='Enter Email'
                name='email'
                value={sellerInfo.email}
                disabled={user != null}
                onChange={handleChange}
                className={`w-[18rem] p-2 rounded-md ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className='text-red-500'>Email is required</p>
              )}
            </div>
            <div className='mb-1'>
              <label htmlFor='mobileNumber' className='block mb-2'>
                Mobile Number
              </label>
              <input
                type='tel'
                id='mobileNumber'
                required
                placeholder='10 Digit Mobile Number'
                name='mobileNumber'
                value={sellerInfo.mobileNumber}
                onChange={handleChange}
                className={`w-[18rem] p-2 rounded-md ${
                  errors.mobileNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.mobileNumber && (
                <p className='text-red-500'>Mobile Number is required</p>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-col mb-2 px-10 py-8 lg:md:xl:w-full rounded-xl bg-gradient-to-r from-violet-200 to-pink-200'>
          <h2 className='text-2xl font-semibold mb-4'>College Details</h2>
          <div className='flex flex-wrap mt-2  gap-4'>
            <div>
              <label htmlFor='collegeName' className='block mb-2'>
                College Name
              </label>
              <select
                id='collegeName'
                name='collegeName'
                value={sellerInfo.collegeName}
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
                value={sellerInfo.collegeYear}
                onChange={handleChange}
                required
                className={`w-[18rem] p-2 rounded-md ${
                  errors.collegeYear ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Semester</option>
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
                <option value='4'>4</option>
                <option value='5'>5</option>
                <option value='6'>6</option>
                <option value='7'>7</option>
                <option value='8'>8</option>
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
                value={sellerInfo.collegeBranch}
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
          </div>
        </div>
        <div className='flex flex-wrap items-start mb-2 px-8 py-8 sm:lg:md:xl:w-full rounded-xl bg-gradient-to-r from-blue-100 to-cyan-200 '>
          <h2 className='text-2xl font-semibold mb-4'>Product Details</h2>
          <div className='flex flex-wrap mt-2 gap-4'>
            <div flex flex-col>
              <div className='mb-4 file-input-container'>
                <div className='file-input-button mb-2'>
                  <label htmlFor='file-input' className='custom-file-label'>
                    Choose Files
                  </label>
                </div>
                <label
                  htmlFor='file-input'
                  className='text-[13px] w-[18rem] block mb-2 custom-file-input'
                >
                  Upload Product Images (Max 3)
                </label>
                <input
                  type='file'
                  required // Photos field is required
                  id='file-input'
                  name='photos'
                  multiple
                  accept='image/*'
                  onChange={handlePhotoChange}
                  className='hidden'
                />
              </div>
              {errors.photos && (
                <p className='text-red-500'>
                  Please upload at least one photo.
                </p>
              )}
              <div className='image-preview-container'>
                {imagesPreview.map((preview, index) => (
                  <div key={index} className='image-preview-name text-[12px]'>
                    {preview}
                  </div>
                ))}
              </div>
            </div>
            <div className='mb-4'>
              <label htmlFor='condition' className='block mb-2'>
                Items
              </label>
              <select
                id='items'
                required
                name='items'
                value={sellerInfo.items}
                onChange={handleChange}
                className={`w-[18rem] p-[10px] border rounded-md bg-white ${
                  errors.items ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Items</option>
                <option value='drafter'>Drafter</option>
                <option value='draftersheetholder'>
                  Drafter + Sheet Holder
                </option>
                <option value='sheetholder'>Sheet Holder</option>
              </select>
              {errors.items && (
                <p className='text-red-500'>Items is required</p>
              )}
            </div>
            <div className='mb-4'>
              <label htmlFor='company' className='block mb-2'>
                Product Company
              </label>
              <input
                type='text'
                id='company'
                required
                placeholder='Enter Company Name'
                name='company'
                value={sellerInfo.company}
                onChange={handleChange}
                className={`w-[18rem] p-2 border rounded-md ${
                  errors.company ? 'border-red-500' : ''
                }`}
              />
              {errors.company && (
                <p className='text-red-500'>Company is required</p>
              )}
            </div>
            <div className='mb-4'>
              <label htmlFor='condition' className='block mb-2'>
                Condition
              </label>
              <select
                id='condition'
                required
                name='condition'
                value={sellerInfo.condition}
                onChange={handleChange}
                className={`w-[18rem] p-[10px] border rounded-md bg-white ${
                  errors.condition ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Condition</option>
                <option value='new'>New</option>
                <option value='likeNew'>Like New</option>
                <option value='used'>Used</option>
                <option value='fair'>Fair</option>
                <option value='poor'>Poor</option>
                <option value='damaged'>Damaged</option>
                {/* Add more options as needed */}
              </select>

              {errors.condition && (
                <p className='text-red-500'>Condition is required</p>
              )}
            </div>{' '}
            <div className='mb-4'>
              <label htmlFor='maximumRetailPrice' className='block mb-2'>
                MRP
              </label>
              <input
                type='text'
                id='maximumRetailPrice'
                required
                placeholder='₹'
                name='maximumRetailPrice'
                value={sellerInfo.maximumRetailPrice}
                onChange={handleChange}
                className={`w-[18rem] p-2 border rounded-md ${
                  errors.maximumRetailPrice ? 'border-red-500' : ''
                }`}
              />
              {errors.maximumRetailPrice && (
                <p className='text-red-500'>MRP is required</p>
              )}
            </div>{' '}
            <div className='mb-4'>
              <label htmlFor='minimumPrice' className='block mb-2'>
                Minimum Price Expected
              </label>
              <input
                type='text'
                id='minimumPrice'
                required
                placeholder='₹'
                name='minimumPrice'
                value={sellerInfo.minimumPrice}
                onChange={handleChange}
                className={`w-[18rem] p-2 border rounded-md ${
                  errors.minimumPrice ? 'border-red-500' : ''
                }`}
              />
              {errors.minimumPrice && (
                <p className='text-red-500'>Minimum Price is required</p>
              )}
            </div>{' '}
          </div>
        </div>
        <div className='flex items-center mt-2 mb-2'>
          <input
            type='checkbox'
            id='termsCheckbox'
            checked={termsChecked}
            onChange={handleChangeTerms}
            className='mr-2'
          />
          <label htmlFor='termsCheckbox' className='text-sm'>
            I agree to the terms and conditions
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!termsChecked || creatingProfile} // Disable button if terms not checked or creating profile
          className={`w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white py-2 rounded-md ${
            !termsChecked || creatingProfile
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {creatingProfile ? 'Creating Profile' : 'Create Profile'}
        </button>
        {/* <p className='my-2 text-md opacity-100'>
          Not a Seller?{' '}
          <NavLink to={'/buyerinfo'} className='text-[#1c6db5] mt-2 text-md z'>
            Buy Drafter
          </NavLink>
        </p> */}
      </div>
      <div className='flex flex-col justify-center m-4 mt-0 mb-6 px-10 py-8 lg:md:xl:w-max rounded-xl bg-gradient-to-r from-yellow-200 to-yellow-300'>
        <h2 className='text-2xl font-semibold mb-4'>Terms and Conditions</h2>
        <ul className='list-disc list-inside'>
          <li className='text-sm'>
            By checking the box below, you agree to the terms and conditions
            outlined here.
          </li>
          <li className='text-sm'>
            A platform fee of 20% (of the Minimum Expected Price) will be
            charged for listed product.
          </li>
          <li className='text-sm'>
            If any provided information is found to be incorrect, the product
            will be delisted from the platform.
          </li>{' '}
          <li className='text-sm'>
            The seller will recieve the amount of their product (after deducting
            the platform fee) after completion of order.
          </li>
          {/* Add more terms as needed */}
        </ul>
      </div>
    </div>
  );
};

export default SellerForm;
