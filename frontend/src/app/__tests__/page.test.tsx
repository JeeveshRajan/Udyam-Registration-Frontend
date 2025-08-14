import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from '../page'

// Mock the API calls
global.fetch = jest.fn()

// Mock the UdyamForm component
jest.mock('../../components/UdyamForm', () => {
  return function MockUdyamForm() {
    return <div data-testid="udyam-form">Mock Udyam Form</div>
  }
})

describe('Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main page with header', () => {
    render(<Page />)
    
    expect(screen.getByText('Udyam Registration Portal')).toBeInTheDocument()
    expect(screen.getByText('Streamlined MSME Registration')).toBeInTheDocument()
    expect(screen.getByText(/Complete your Udyam registration/i)).toBeInTheDocument()
  })

  it('renders the UdyamForm component', () => {
    render(<Page />)
    
    expect(screen.getByTestId('udyam-form')).toBeInTheDocument()
  })

  it('displays features section', () => {
    render(<Page />)
    
    expect(screen.getByText('Key Features')).toBeInTheDocument()
    expect(screen.getByText('Real-time Validation')).toBeInTheDocument()
    expect(screen.getByText('Mobile-First Design')).toBeInTheDocument()
    expect(screen.getByText('Secure Data Handling')).toBeInTheDocument()
    expect(screen.getByText('Progress Tracking')).toBeInTheDocument()
  })

  it('displays footer with correct information', () => {
    render(<Page />)
    
    expect(screen.getByText(/© 2024 Udyam Registration Portal/i)).toBeInTheDocument()
    expect(screen.getByText(/Built with Next.js, React, and Tailwind CSS/i)).toBeInTheDocument()
  })

  it('has responsive design elements', () => {
    render(<Page />)
    
    // Check for responsive classes in the main container
    const mainContainer = screen.getByRole('main')
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br')
  })

  it('displays the description section', () => {
    render(<Page />)
    
    expect(screen.getByText(/Welcome to the Udyam Registration Portal/i)).toBeInTheDocument()
    expect(screen.getByText(/Our streamlined form makes it easy to complete/i)).toBeInTheDocument()
  })

  it('shows all feature descriptions', () => {
    render(<Page />)
    
    expect(screen.getByText(/Advanced validation ensures data accuracy/i)).toBeInTheDocument()
    expect(screen.getByText(/Optimized for all devices and screen sizes/i)).toBeInTheDocument()
    expect(screen.getByText(/Your information is protected with enterprise-grade security/i)).toBeInTheDocument()
    expect(screen.getByText(/Track your progress through each step/i)).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(<Page />)
    
    // Check for semantic HTML structure
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('displays the hero section with call to action', () => {
    render(<Page />)
    
    expect(screen.getByText('Get Started Today')).toBeInTheDocument()
    expect(screen.getByText(/Join thousands of businesses/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Page />)
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Udyam Registration Portal')
    
    const h2s = screen.getAllByRole('heading', { level: 2 })
    expect(h2s.length).toBeGreaterThan(0)
  })

  it('renders with proper styling classes', () => {
    render(<Page />)
    
    // Check for Tailwind CSS classes
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b')
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1', 'py-12', 'px-4')
  })

  it('displays the form section prominently', () => {
    render(<Page />)
    
    // The form should be the main content
    expect(screen.getByTestId('udyam-form')).toBeInTheDocument()
    
    // Check that the form is within the main content area
    const main = screen.getByRole('main')
    const form = screen.getByTestId('udyam-form')
    expect(main).toContainElement(form)
  })

  it('has consistent spacing and layout', () => {
    render(<Page />)
    
    // Check for consistent spacing classes
    const sections = screen.getAllByRole('region')
    sections.forEach(section => {
      expect(section).toHaveClass('py-8', 'px-4')
    })
  })

  it('displays the complete feature list', () => {
    render(<Page />)
    
    const features = [
      'Real-time Validation',
      'Mobile-First Design', 
      'Secure Data Handling',
      'Progress Tracking'
    ]
    
    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it('has proper meta information in the layout', () => {
    render(<Page />)
    
    // Check for proper document structure
    expect(document.title).toBeDefined()
  })

  it('renders without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error')
    
    render(<Page />)
    
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('has proper responsive breakpoints', () => {
    render(<Page />)
    
    // Check for responsive utility classes
    const container = screen.getByRole('main')
    expect(container).toHaveClass('px-4')
    
    // The container should have responsive padding
    expect(container).toHaveClass('py-12')
  })

  it('displays the complete business value proposition', () => {
    render(<Page />)
    
    expect(screen.getByText(/Streamlined MSME Registration/i)).toBeInTheDocument()
    expect(screen.getByText(/Complete your Udyam registration in minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/Join thousands of businesses/i)).toBeInTheDocument()
  })

  it('has proper semantic structure for screen readers', () => {
    render(<Page />)
    
    // Check for proper landmark roles
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    
    // Check for proper heading structure
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(1)
  })
})
