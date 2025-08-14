'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Smartphone, 
  Mail, 
  Shield, 
  FileText,
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Info,
  Sparkles,
  Building2,
  CheckCircle2,
  Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simplified validation schemas
const step1Schema = z.object({
  aadhaarNumber: z.string()
    .min(1, 'Aadhaar number is required')
    .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
    .refine((val) => !/^(\d)\1{11}$/.test(val), 'Invalid Aadhaar number'),
  entrepreneurName: z.string().min(1, 'Entrepreneur name is required'),
  mobileNumber: z.string()
    .min(1, 'Mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'),
  emailAddress: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  otp: z.string().min(1, 'OTP is required').regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  aadhaarConsent: z.boolean().refine((val) => val === true, 'You must agree to the Aadhaar consent')
});

const step2Schema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  panNumber: z.string()
    .min(1, 'PAN number is required')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F'),
  businessName: z.string().min(1, 'Business name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string()
    .min(1, 'PIN code is required')
    .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits')
});

const fullSchema = step1Schema.merge(step2Schema);

type FormData = z.infer<typeof fullSchema>;

interface UdyamFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export default function UdyamForm({ onSubmit }: UdyamFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [pincodeData, setPincodeData] = useState<{city: string, state: string} | null>(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      aadhaarNumber: '',
      entrepreneurName: '',
      mobileNumber: '',
      emailAddress: '',
      otp: '',
      aadhaarConsent: false,
      businessType: '',
      panNumber: '',
      businessName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: ''
    },
  });

  const watchedPincode = watch('pincode');
  const watchedAadhaar = watch('aadhaarNumber');

  // Auto-format Aadhaar number
  useEffect(() => {
    if (watchedAadhaar && watchedAadhaar.length <= 12) {
      const formatted = watchedAadhaar.replace(/\D/g, '').slice(0, 12);
      if (formatted !== watchedAadhaar) {
        setValue('aadhaarNumber', formatted);
      }
    }
  }, [watchedAadhaar, setValue]);

  // Auto-fill city and state based on pincode
  useEffect(() => {
    if (watchedPincode && watchedPincode.length === 6) {
      fetchPincodeData(watchedPincode);
    }
  }, [watchedPincode]);

  const fetchPincodeData = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setIsLoadingPincode(true);
    try {
      // Using a free pincode API
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setPincodeData({
          city: postOffice.District,
          state: postOffice.State
        });
        
        // Auto-fill the form
        setValue('city', postOffice.District);
        setValue('state', postOffice.State);
        
        toast.success('Address details auto-filled!');
      }
    } catch (error) {
      console.log('Pincode API error:', error);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handleSendOtp = async () => {
    const isValid = await trigger(['aadhaarNumber', 'entrepreneurName', 'mobileNumber', 'emailAddress']);
    if (!isValid) return;

    setIsLoadingOtp(true);
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoadingOtp(false);
      toast.success('OTP sent to your mobile and email!');
    }, 2000);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['aadhaarNumber', 'entrepreneurName', 'mobileNumber', 'emailAddress', 'otp', 'aadhaarConsent']);
      if (isValid) {
        setOtpVerified(true);
        toast.success('Step 1 completed successfully!');
        setCurrentStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return cleaned;
  };

  const formatPAN = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Tracker */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            <div className={`flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500 ${
              currentStep >= 1 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-110' 
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
            }`}>
              {currentStep > 1 ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <span className="font-bold text-3xl">1</span>
              )}
            </div>
            
            <div className={`w-32 h-3 rounded-full transition-all duration-500 ${
              currentStep >= 2 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                : 'bg-gray-200'
            }`}></div>
            
            <div className={`flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500 ${
              currentStep >= 2 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-110' 
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
            }`}>
              <span className="font-bold text-3xl">2</span>
            </div>
          </div>
        </div>
        
        <div className="text-center text-xl text-gray-600">
          <span className={`font-bold transition-colors duration-300 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            Step 1 - Aadhaar Verification with OTP
          </span>
          <span className="mx-8 text-gray-300 text-3xl">→</span>
          <span className={`font-bold transition-colors duration-300 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            Step 2 - PAN Verification & Business Details
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Step 1: Aadhaar + OTP Verification */}
        <div className={`bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 transition-all duration-700 ${
          currentStep === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mr-6 mb-4 sm:mb-0 shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                Step 1: Aadhaar Verification with OTP
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                आधार सत्यापन और OTP के साथ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Aadhaar Number */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                1. Aadhaar Number/ आधार संख्या <span className="text-red-500">*</span>
              </label>
              <Controller
                name="aadhaarNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Your Aadhaar No"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.aadhaarNumber ? 'border-red-400 bg-red-50' : ''
                    }`}
                    maxLength={12}
                    onChange={(e) => {
                      const value = formatAadhaar(e.target.value);
                      field.onChange(value.replace(/\s/g, ''));
                    }}
                  />
                )}
              />
              {errors.aadhaarNumber && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.aadhaarNumber.message}
                </div>
              )}
            </div>

            {/* Entrepreneur Name */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                2. Name of Entrepreneur / उद्यमी का नाम <span className="text-red-500">*</span>
              </label>
              <Controller
                name="entrepreneurName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your full name as per Aadhaar"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.entrepreneurName ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                )}
              />
              {errors.entrepreneurName && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.entrepreneurName.message}
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                3. Mobile Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="mobileNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder="Enter mobile number"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.mobileNumber ? 'border-red-400 bg-red-50' : ''
                    }`}
                    maxLength={10}
                  />
                )}
              />
              {errors.mobileNumber && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.mobileNumber.message}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                4. Email Address <span className="text-red-500">*</span>
              </label>
              <Controller
                name="emailAddress"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Enter email address"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.emailAddress ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                )}
              />
              {errors.emailAddress && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.emailAddress.message}
                </div>
              )}
            </div>
            
            {/* OTP Section */}
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                  <label className="block text-xl font-bold text-gray-700">
                    5. OTP Verification <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoadingOtp}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 w-full sm:w-auto shadow-xl hover:scale-105"
                  >
                    {isLoadingOtp ? (
                      <span className="flex items-center justify-center sm:justify-start">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
                
                <div className="relative group">
                  <Shield className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                  <Controller
                    name="otp"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showOtp ? 'text' : 'password'}
                        placeholder="Enter 6-digit OTP"
                        className={`w-full pl-16 pr-20 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                          errors.otp ? 'border-red-400 bg-red-50' : ''
                        }`}
                        maxLength={6}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                  >
                    {showOtp ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
                
                {errors.otp && (
                  <div className="flex items-center mt-3 text-red-500 text-base">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errors.otp.message}
                  </div>
                )}
                
                <p className="text-base text-gray-600 mt-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-500" />
                  OTP will be sent to your registered mobile number and email
                </p>
              </div>
            </div>

            {/* Aadhaar Consent */}
            <div className="md:col-span-2">
              <Controller
                name="aadhaarConsent"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-2 w-6 h-6 text-blue-500 border-gray-300 rounded focus:ring-blue-200 bg-gray-50"
                    />
                    <span className="text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                      I hereby give my consent to Ministry of MSME, Government of India, 
                      for using my Aadhaar number for Udyam Registration. 
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                )}
              />
              {errors.aadhaarConsent && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.aadhaarConsent.message}
                </div>
              )}
            </div>
          </div>

          {/* Next Step Button */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-12 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-2xl hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:transform-none"
            >
              Verify & Continue
              <ArrowRight className="w-6 h-6 ml-3 inline" />
            </button>
          </div>
        </div>

        {/* Step 2: PAN + Business Details */}
        <div className={`bg-white rounded-3xl shadow-2xl border-2 border-green-200 p-8 transition-all duration-700 ${
          currentStep === 2 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mr-6 mb-4 sm:mb-0 shadow-xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                Step 2: PAN Verification & Business Details
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                पैन सत्यापन और व्यवसाय की जानकारी
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business Type */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                3. Type of Organisation / संगठन के प्रकार <span className="text-red-500">*</span>
              </label>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.businessType ? 'border-red-400 bg-red-50' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-100 text-gray-500">
                      Select business type
                    </option>
                    <option value="Individual" className="bg-gray-100 text-gray-800">Individual / व्यक्तिगत</option>
                    <option value="Partnership" className="bg-gray-100 text-gray-800">Partnership / साझेदारी</option>
                    <option value="Company" className="bg-gray-100 text-gray-800">Company / कंपनी</option>
                    <option value="Proprietorship" className="bg-gray-100 text-gray-800">Proprietorship / स्वामित्व</option>
                    <option value="LLP" className="bg-gray-100 text-gray-800">LLP / सीमित देयता साझेदारी</option>
                    <option value="HUF" className="bg-gray-100 text-gray-800">HUF / हिंदू अविभाजित परिवार</option>
                    <option value="Society" className="bg-gray-100 text-gray-800">Society / सोसायटी</option>
                    <option value="Trust" className="bg-gray-100 text-gray-800">Trust / ट्रस्ट</option>
                    <option value="Other" className="bg-gray-100 text-gray-800">Other / अन्य</option>
                  </select>
                )}
              />
              {errors.businessType && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.businessType.message}
                </div>
              )}
            </div>

            {/* PAN Number */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                4.1 PAN / पैन <span className="text-red-500">*</span>
              </label>
              <Controller
                name="panNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="ABCDE1234F"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.panNumber ? 'border-red-400 bg-red-50' : ''
                    }`}
                    maxLength={10}
                    onChange={(e) => {
                      const value = formatPAN(e.target.value);
                      field.onChange(value);
                    }}
                  />
                )}
              />
              {errors.panNumber && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.panNumber.message}
                </div>
              )}
            </div>

            {/* Business Name */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                4.1.1 Name of PAN Holder / पैन धारक का नाम <span className="text-red-500">*</span>
              </label>
              <Controller
                name="businessName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter business name as per PAN"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.businessName ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                )}
              />
              {errors.businessName && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.businessName.message}
                </div>
              )}
            </div>

            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                4.1.2 Address / पता <span className="text-red-500">*</span>
              </label>
              <Controller
                name="addressLine1"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your complete address"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.addressLine1 ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                )}
              />
              {errors.addressLine1 && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.addressLine1.message}
                </div>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="md:col-span-2">
              <label className="block text-xl font-bold text-gray-700 mb-4">
                Address Line 2 (Optional)
              </label>
              <Controller
                name="addressLine2"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    className="w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300"
                  />
                )}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                City / शहर <span className="text-red-500">*</span>
              </label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter city"
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.city ? 'border-red-400 bg-red-50' : ''
                    }`}
                  />
                )}
              />
              {errors.city && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.city.message}
                </div>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                State / राज्य <span className="text-red-500">*</span>
              </label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                      errors.state ? 'border-red-400 bg-red-50' : ''
                    }`}
                  >
                    <option value="" className="bg-gray-100 text-gray-500">
                      Select state
                    </option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                )}
              />
              {errors.state && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.state.message}
                </div>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-4">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <Controller
                name="pincode"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter PIN code"
                      className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
                        errors.pincode ? 'border-red-400 bg-red-50' : ''
                      }`}
                      maxLength={6}
                    />
                    {isLoadingPincode && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.pincode && (
                <div className="flex items-center mt-3 text-red-500 text-base">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.pincode.message}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-6">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="flex-1 px-8 py-5 bg-gray-100 text-gray-700 font-bold text-xl rounded-2xl hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-300 transform hover:scale-105 border border-gray-200"
            >
              <ArrowLeft className="w-6 h-6 mr-3 inline" />
              Previous Step
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 inline animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-3 inline" />
                  Submit Registration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
