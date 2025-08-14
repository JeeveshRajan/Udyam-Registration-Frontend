'use client';

import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import UdyamForm from '../components/UdyamForm';
import { 
  Building2, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  RefreshCw, 
  Info, 
  Search, 
  Star, 
  Settings, 
  User,
  Globe,
  Lock,
  Clock,
  Menu,
  X,
  Home,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronDown
} from 'lucide-react';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const handleFormSubmit = async (formData: any) => {
    console.log('Form submitted with data:', formData);
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form submitted successfully:', result);
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Beautiful Modern Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">Udyam Portal</h1>
                <p className="text-blue-100 text-sm">Government of India</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-white hover:text-blue-200 transition-colors duration-300 font-medium flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              
              <div className="relative">
                <button
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  className="text-white hover:text-blue-200 transition-colors duration-300 font-medium flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Services Dropdown */}
                {isServicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-blue-100 py-4 z-50">
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">MSME Services</h3>
                      <div className="space-y-2">
                        <a href="#registration" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                          Udyam Registration
                        </a>
                        <a href="#certificate" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                          Certificate Download
                        </a>
                        <a href="#updates" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                          Profile Updates
                        </a>
                        <a href="#support" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                          Support & Help
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <a href="#about" className="text-white hover:text-blue-200 transition-colors duration-300 font-medium">About MSME</a>
              <a href="#contact" className="text-white hover:text-blue-200 transition-colors duration-300 font-medium">Contact</a>
              
              {/* CTA Button */}
              <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-blue-200 transition-colors duration-300 p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-blue-700 border-t border-blue-600">
            <div className="px-4 py-6 space-y-4">
              <a href="#home" className="block text-white hover:text-blue-200 transition-colors duration-300 font-medium py-2">
                Home
              </a>
              <a href="#services" className="block text-white hover:text-blue-200 transition-colors duration-300 font-medium py-2">
                Services
              </a>
              <a href="#about" className="block text-white hover:text-blue-200 transition-colors duration-300 font-medium py-2">
                About MSME
              </a>
              <a href="#contact" className="block text-white hover:text-blue-200 transition-colors duration-300 font-medium py-2">
                Contact
              </a>
              <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 mt-4">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with Beautiful Styling */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section with Gradient Background */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl mb-8 shadow-2xl">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
            Udyam Registration
          </h1>
          
          <div className="space-y-2 mb-8">
            <p className="text-xl text-gray-700 font-medium">MSME Registration Portal</p>
            <p className="text-xl text-gray-700 font-medium">Official Portal</p>
            <div className="flex items-center justify-center space-x-3">
              <p className="text-xl text-gray-700 font-medium">Government of India</p>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Your MSME Registration Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 mb-12 shadow-lg border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Complete Your MSME Registration
          </h2>
          <p className="text-xl text-gray-700 mb-8 text-center leading-relaxed max-w-4xl mx-auto">
            Streamlined registration process for Micro, Small and Medium Enterprises. 
            Get your Udyam certificate in minutes with our simplified form.
          </p>
          
          {/* Features Grid with Beautiful Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Government Approved</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">Secure & Fast</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center">24/7 Support</h3>
            </div>
          </div>
          
          {/* Shield Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Important Information Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 mb-12 shadow-lg border border-amber-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Important Information
          </h3>
          <p className="text-xl text-gray-700 mb-6 text-center leading-relaxed max-w-4xl mx-auto">
            Please ensure you have your Aadhaar number, mobile number, and PAN details ready before proceeding. 
            This registration process is secure and follows government guidelines.
          </p>
          
          {/* Building Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Ministry Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 mb-12 shadow-lg border border-green-100 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ministry of Micro, Small & Medium Enterprises
          </h3>
          
          {/* Building Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Form Title */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl px-8 py-6 shadow-2xl">
            <h2 className="text-4xl font-bold text-white uppercase tracking-wider">
              UDYAM REGISTRATION FORM
            </h2>
          </div>
        </div>

        {/* Main Form Section */}
        <UdyamForm onSubmit={handleFormSubmit} />
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            fontSize: '16px',
            padding: '16px 20px',
          },
        }}
      />
    </div>
  );
}
