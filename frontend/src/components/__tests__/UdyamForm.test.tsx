import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UdyamForm from '../UdyamForm'

// Mock the API calls
global.fetch = jest.fn()

describe('UdyamForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with step 1 initially', () => {
    render(<UdyamForm />)
    
    expect(screen.getByText('Udyam Registration Form')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    expect(screen.getByLabelText(/Aadhaar Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it('shows progress tracker with correct steps', () => {
    render(<UdyamForm />)
    
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Aadhaar Verification')).toBeInTheDocument()
    expect(screen.getByText('PAN Validation')).toBeInTheDocument()
  })

  it('validates required fields in step 1', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Aadhaar number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Mobile number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
    })
  })

  it('validates Aadhaar number format', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    const aadhaarInput = screen.getByLabelText(/Aadhaar Number/i)
    await user.type(aadhaarInput, '123456789012')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Should show Aadhaar validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid Aadhaar number format/i)).toBeInTheDocument()
    })
  })

  it('validates mobile number format', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    const mobileInput = screen.getByLabelText(/Mobile Number/i)
    await user.type(mobileInput, '1234567890')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Should show mobile validation error
    await waitFor(() => {
      expect(screen.getByText(/Mobile number must start with 6, 7, 8, or 9/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    const emailInput = screen.getByLabelText(/Email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument()
    })
  })

  it('proceeds to step 2 with valid step 1 data', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    // Fill valid step 1 data
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Should show OTP input
    await waitFor(() => {
      expect(screen.getByLabelText(/OTP/i)).toBeInTheDocument()
    })
    
    // Enter OTP
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Should proceed to step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
      expect(screen.getByLabelText(/PAN Number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument()
    })
  })

  it('validates required fields in step 2', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    // First complete step 1
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    // Enter OTP
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Now in step 2, try to submit without filling fields
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    const submitFormButton = screen.getByRole('button', { name: /submit form/i })
    await user.click(submitFormButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/PAN number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Business name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Business type is required/i)).toBeInTheDocument()
    })
  })

  it('validates PAN number format', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    // Complete step 1 first
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Now in step 2, test PAN validation
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    const panInput = screen.getByLabelText(/PAN Number/i)
    await user.type(panInput, 'INVALID')
    
    const submitFormButton = screen.getByRole('button', { name: /submit form/i })
    await user.click(submitFormButton)
    
    // Should show PAN validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid PAN number format/i)).toBeInTheDocument()
    })
  })

  it('allows navigation back to step 1', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    // Complete step 1
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Now in step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)
    
    // Should be back in step 1
    await waitFor(() => {
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
      expect(screen.getByLabelText(/Aadhaar Number/i)).toBeInTheDocument()
    })
  })

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: '123' })
    } as Response)
    
    render(<UdyamForm />)
    
    // Complete step 1
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Complete step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/PAN Number/i), 'ABCDE1234F')
    await user.type(screen.getByLabelText(/Business Name/i), 'Test Business')
    await user.selectOptions(screen.getByLabelText(/Business Type/i), 'Proprietorship')
    await user.type(screen.getByLabelText(/Address/i), '123 Test Street')
    await user.type(screen.getByLabelText(/City/i), 'Test City')
    await user.type(screen.getByLabelText(/State/i), 'Test State')
    await user.type(screen.getByLabelText(/Pincode/i), '123456')
    
    const submitFormButton = screen.getByRole('button', { name: /submit form/i })
    await user.click(submitFormButton)
    
    // Should submit successfully
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    })
  })

  it('handles form submission errors gracefully', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<UdyamForm />)
    
    // Complete step 1
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Complete step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/PAN Number/i), 'ABCDE1234F')
    await user.type(screen.getByLabelText(/Business Name/i), 'Test Business')
    await user.selectOptions(screen.getByLabelText(/Business Type/i), 'Proprietorship')
    await user.type(screen.getByLabelText(/Address/i), '123 Test Street')
    await user.type(screen.getByLabelText(/City/i), 'Test City')
    await user.type(screen.getByLabelText(/State/i), 'Test State')
    await user.type(screen.getByLabelText(/Pincode/i), '123456')
    
    const submitFormButton = screen.getByRole('button', { name: /submit form/i })
    await user.click(submitFormButton)
    
    // Should handle error gracefully
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('maintains form data when navigating between steps', async () => {
    const user = userEvent.setup()
    render(<UdyamForm />)
    
    // Fill step 1 data
    await user.type(screen.getByLabelText(/Aadhaar Number/i), '123456789012')
    await user.type(screen.getByLabelText(/Mobile Number/i), '9876543210')
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    
    // Go to step 2
    const submitButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton)
    
    const otpInput = screen.getByLabelText(/OTP/i)
    await user.type(otpInput, '123456')
    
    const verifyOtpButton = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton)
    
    // Fill step 2 data
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/PAN Number/i), 'ABCDE1234F')
    await user.type(screen.getByLabelText(/Business Name/i), 'Test Business')
    
    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)
    
    // Data should be preserved
    await waitFor(() => {
      expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument()
      expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })
    
    // Go back to step 2
    const submitButton2 = screen.getByRole('button', { name: /verify otp/i })
    await user.click(submitButton2)
    
    const otpInput2 = screen.getByLabelText(/OTP/i)
    await user.type(otpInput2, '123456')
    
    const verifyOtpButton2 = screen.getByRole('button', { name: /verify otp/i })
    await user.click(verifyOtpButton2)
    
    // Step 2 data should be preserved
    await waitFor(() => {
      expect(screen.getByDisplayValue('ABCDE1234F')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Business')).toBeInTheDocument()
    })
  })
})
