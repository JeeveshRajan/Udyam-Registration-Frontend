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

// Define the form structure type
interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  validation_rules: string[];
  options?: string[];
  max_length?: number;
  pattern?: string;
}

interface FormStep {
  step_number: number;
  title: string;
  description: string;
  fields: FormField[];
}

interface FormStructure {
  metadata: {
    url: string;
    title: string;
    scraped_at: string;
    total_steps: number;
  };
  steps: FormStep[];
}

// Mock form structure based on your scraped data (since import isn't working)
const formStructure: FormStructure = {
  metadata: {
    url: "https://udyamregistration.gov.in/UdyamRegistration.aspx",
    title: "UDYAM REGISTRATION FORM",
    scraped_at: "2025-01-14",
    total_steps: 2
  },
  steps: [
    {
      step_number: 1,
      title: "Step 1",
      description: "Aadhaar Verification with OTP",
      fields: [
        {
          name: "aadhaarNumber",
          type: "text",
          label: "1. Aadhaar Number/ आधार संख्या",
          placeholder: "Your Aadhaar No",
          required: true,
          validation_rules: ["max_length: 12"],
          max_length: 12
        },
        {
          name: "entrepreneurName",
          type: "text",
          label: "2. Name of Entrepreneur / उद्यमी का नाम",
          placeholder: "Enter your full name as per Aadhaar",
          required: true,
          validation_rules: ["max_length: 100"],
          max_length: 100
        },
        {
          name: "mobileNumber",
          type: "tel",
          label: "3. Mobile Number",
          placeholder: "Enter mobile number",
          required: true,
          validation_rules: ["max_length: 10"],
          max_length: 10
        },
        {
          name: "emailAddress",
          type: "email",
          label: "4. Email Address",
          placeholder: "Enter email address",
          required: true,
          validation_rules: [],
        }
      ]
    },
    {
      step_number: 2,
      title: "Step 2",
      description: "PAN Verification & Business Details",
      fields: [
        {
          name: "businessType",
          type: "select",
          label: "3. Type of Organisation / संगठन के प्रकार",
          placeholder: "Select business type",
          required: true,
          validation_rules: [],
          options: [
            'Individual / व्यक्तिगत',
            'Partnership / साझेदारी',
            'Company / कंपनी',
            'Proprietorship / स्वामित्व',
            'LLP / सीमित देयता साझेदारी',
            'HUF / हिंदू अविभाजित परिवार',
            'Society / सोसायटी',
            'Trust / ट्रस्ट',
            'Other / अन्य'
          ]
        },
        {
          name: "panNumber",
          type: "text",
          label: "4.1 PAN / पैन",
          placeholder: "ABCDE1234F",
          required: true,
          validation_rules: ["max_length: 10"],
          max_length: 10
        },
        {
          name: "businessName",
          type: "text",
          label: "4.1.1 Name of PAN Holder / पैन धारक का नाम",
          placeholder: "Enter business name as per PAN",
          required: true,
          validation_rules: ["max_length: 100"],
          max_length: 100
        },
        {
          name: "addressLine1",
          type: "text",
          label: "4.1.2 Address / पता",
          placeholder: "Enter your complete address",
          required: true,
          validation_rules: ["max_length: 200"],
          max_length: 200
        },
        {
          name: "addressLine2",
          type: "text",
          label: "Address Line 2 (Optional)",
          placeholder: "Apartment, suite, etc. (optional)",
          required: false,
          validation_rules: ["max_length: 200"],
          max_length: 200
        },
        {
          name: "city",
          type: "text",
          label: "City / शहर",
          placeholder: "Enter city",
          required: true,
          validation_rules: ["max_length: 50"],
          max_length: 50
        },
        {
          name: "state",
          type: "select",
          label: "State / राज्य",
          placeholder: "Select state",
          required: true,
          validation_rules: [],
          options: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
          ]
        },
        {
          name: "pincode",
          type: "text",
          label: "PIN Code",
          placeholder: "Enter PIN code",
          required: true,
          validation_rules: ["max_length: 6"],
          max_length: 6
        }
      ]
    }
  ]
};

// Build validation schema dynamically from form structure
const buildValidationSchema = () => {
  const step1Fields: Record<string, any> = {};
  const step2Fields: Record<string, any> = {};

  formStructure.steps.forEach((step) => {
    step.fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny = z.string().min(1, `${field.label} is required`);

      // Apply validation rules
      if (field.validation_rules) {
        field.validation_rules.forEach((rule) => {
          if (rule.includes('max_length:')) {
            const maxLength = parseInt(rule.split(':')[1]);
            fieldSchema = fieldSchema.max(maxLength, `Maximum ${maxLength} characters allowed`);
          }
        });
      }

      // Special validations for known fields
      if (field.name.includes('aadhaar') || field.name.includes('adharno')) {
        fieldSchema = z.string()
          .min(1, 'Aadhaar number is required')
          .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
          .refine((val) => !/^(\d)\1{11}$/.test(val), 'Invalid Aadhaar number');
      } else if (field.name.includes('pan') || field.name.includes('PAN')) {
        fieldSchema = z.string()
          .min(1, 'PAN number is required')
          .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F');
      } else if (field.name.includes('mobile') || field.name.includes('phone')) {
        fieldSchema = z.string()
          .min(1, 'Mobile number is required')
          .regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6, 7, 8, or 9');
      } else if (field.name.includes('email')) {
        fieldSchema = z.string()
          .min(1, 'Email is required')
          .email('Please enter a valid email address');
      } else if (field.name.includes('pincode') || field.name.includes('pin')) {
        fieldSchema = z.string()
          .min(1, 'PIN code is required')
          .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits');
      }

      // Add to appropriate step
      if (step.step_number === 1) {
        step1Fields[field.name] = fieldSchema;
      } else if (step.step_number === 2) {
        step2Fields[field.name] = fieldSchema;
      }
    });
  });

  // Add OTP and consent fields for step 1
  step1Fields.otp = z.string()
    .min(1, 'OTP is required')
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits');
  step1Fields.aadhaarConsent = z.boolean()
    .refine((val) => val === true, 'You must agree to the Aadhaar consent');

  return {
    step1: z.object(step1Fields),
    step2: z.object(step2Fields),
    full: z.object({ ...step1Fields, ...step2Fields })
  };
};

const schemas = buildValidationSchema();
const step1Schema = schemas.step1;
const step2Schema = schemas.step2;
const fullSchema = schemas.full;

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
  const [pincodeData, setPincodeData] = useState<{ city: string, state: string } | null>(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Get form fields from form structure
  const getStepFields = (stepNumber: number) => {
    return formStructure.steps
      .find(step => step.step_number === stepNumber)
      ?.fields.filter(field => field.type !== 'hidden') || [];
  };

  const step1Fields = getStepFields(1);
  const step2Fields = getStepFields(2);

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
    defaultValues: (() => {
      const defaults: Record<string, any> = {};

      // Set default values for all fields from form structure
      [...step1Fields, ...step2Fields].forEach(field => {
        if (field.type === 'checkbox') {
          defaults[field.name] = false;
        } else if (field.type === 'select') {
          defaults[field.name] = '';
        } else {
          defaults[field.name] = '';
        }
      });

      // Add OTP and consent defaults
      defaults.otp = '';
      defaults.aadhaarConsent = false;

      return defaults;
    })(),
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

  // Dynamic field renderer based on form structure
  const renderField = (field: FormField, stepNumber: number) => {
    const fieldName = field.name;
    const isRequired = field.required;

    // Skip hidden fields
    if (field.type === 'hidden') return null;

    // Get field value and error
    const fieldError = errors[fieldName as keyof FormData];

    // Determine field type and render accordingly
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={fieldName} className={field.name.includes('aadhaar') || field.name.includes('pan') ? 'md:col-span-2' : ''}>
            <label className="block text-xl font-bold text-gray-700 mb-4">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name={fieldName as keyof FormData}
              control={control}
              render={({ field: controllerField }) => (
                <input
                  {...controllerField}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${fieldError ? 'border-red-400 bg-red-50' : ''
                    }`}
                  maxLength={field.max_length}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Apply formatting based on field type
                    if (field.name.includes('aadhaar')) {
                      value = formatAadhaar(value);
                      controllerField.onChange(value.replace(/\s/g, ''));
                    } else if (field.name.includes('pan')) {
                      value = formatPAN(value);
                      controllerField.onChange(value);
                    } else {
                      controllerField.onChange(value);
                    }
                  }}
                />
              )}
            />
            {fieldError && (
              <div className="flex items-center mt-3 text-red-500 text-base">
                <AlertCircle className="w-5 h-5 mr-2" />
                {fieldError.message}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="md:col-span-2">
            <label className="block text-xl font-bold text-gray-700 mb-4">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name={fieldName as keyof FormData}
              control={control}
              render={({ field: controllerField }) => (
                <select
                  {...controllerField}
                  className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${fieldError ? 'border-red-400 bg-red-50' : ''
                    }`}
                >
                  <option value="" className="bg-gray-100 text-gray-500">
                    {field.placeholder}
                  </option>
                  {field.options?.map((option: string) => (
                    <option key={option} value={option} className="bg-gray-100 text-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              )}
            />
            {fieldError && (
              <div className="flex items-center mt-3 text-red-500 text-base">
                <AlertCircle className="w-5 h-5 mr-2" />
                {fieldError.message}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={fieldName} className="md:col-span-2">
            <label className="block text-xl font-bold text-gray-700 mb-4">
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name={fieldName as keyof FormData}
              control={control}
              render={({ field: controllerField }) => (
                <input
                  {...controllerField}
                  type="text"
                  placeholder={field.placeholder}
                  className={`w-full px-6 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${fieldError ? 'border-red-400 bg-red-50' : ''
                    }`}
                />
              )}
            />
            {fieldError && (
              <div className="flex items-center mt-3 text-red-500 text-base">
                <AlertCircle className="w-5 h-5 mr-2" />
                {fieldError.message}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Progress Tracker */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            <div className={`flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500 ${currentStep >= 1
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-110'
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}>
              {currentStep > 1 ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <span className="font-bold text-3xl">1</span>
              )}
            </div>

            <div className={`w-32 h-3 rounded-full transition-all duration-500 ${currentStep >= 2
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                : 'bg-gray-200'
              }`}></div>

            <div className={`flex items-center justify-center w-20 h-20 rounded-3xl transition-all duration-500 ${currentStep >= 2
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-110'
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}>
              <span className="font-bold text-3xl">2</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xl text-gray-600">
          <span className={`font-bold transition-colors duration-300 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            {formStructure.steps[0]?.title || 'Step 1'} - {formStructure.steps[0]?.description || 'Aadhaar Verification with OTP'}
          </span>
          <span className="mx-8 text-gray-300 text-3xl">→</span>
          <span className={`font-bold transition-colors duration-300 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            {formStructure.steps[1]?.title || 'Step 2'} - {formStructure.steps[1]?.description || 'PAN Verification & Business Details'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Step 1: Dynamic fields from form structure */}
        <div className={`bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 transition-all duration-700 ${currentStep === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mr-6 mb-4 sm:mb-0 shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                {formStructure.steps[0]?.title || 'Step 1'}: {formStructure.steps[0]?.description || 'Aadhaar Verification with OTP'}
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                आधार सत्यापन और OTP के साथ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Render dynamic fields from form structure */}
            {step1Fields.map(field => renderField(field, 1))}

            {/* OTP Section - Always included for step 1 */}
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
                        className={`w-full pl-16 pr-20 py-5 border-2 rounded-2xl transition-all duration-300 text-xl font-medium bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${errors.otp ? 'border-red-400 bg-red-50' : ''
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

            {/* Aadhaar Consent - Always included for step 1 */}
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

        {/* Step 2: Dynamic fields from form structure */}
        <div className={`bg-white rounded-3xl shadow-2xl border-2 border-green-200 p-8 transition-all duration-700 ${currentStep === 2 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mr-6 mb-4 sm:mb-0 shadow-xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                {formStructure.steps[1]?.title || 'Step 2'}: {formStructure.steps[1]?.description || 'PAN Verification & Business Details'}
              </h2>
              <p className="text-xl text-gray-600 font-medium">
                पैन सत्यापन और व्यवसाय की जानकारी
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Render dynamic fields from form structure */}
            {step2Fields.map(field => renderField(field, 2))}
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
