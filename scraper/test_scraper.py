#!/usr/bin/env python3
"""
Unit tests for Udyam registration form scraper
"""

import pytest
import json
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from scrape_udyam import UdyamScraper, FormField, FormStep


class TestFormField:
    """Test FormField dataclass"""
    
    def test_form_field_creation(self):
        """Test creating a FormField instance"""
        field = FormField(
            name="test_field",
            type="text",
            label="Test Label",
            placeholder="Enter test value",
            required=True,
            validation_rules=["required", "max_length: 50"]
        )
        
        assert field.name == "test_field"
        assert field.type == "text"
        assert field.label == "Test Label"
        assert field.placeholder == "Enter test value"
        assert field.required is True
        assert len(field.validation_rules) == 2
        
    def test_form_field_with_options(self):
        """Test FormField with dropdown options"""
        field = FormField(
            name="business_type",
            type="select",
            label="Business Type",
            placeholder="",
            required=True,
            validation_rules=["required"],
            options=["Individual", "Partnership", "Company"]
        )
        
        assert field.options == ["Individual", "Partnership", "Company"]


class TestFormStep:
    """Test FormStep dataclass"""
    
    def test_form_step_creation(self):
        """Test creating a FormStep instance"""
        fields = [
            FormField(
                name="aadhaar",
                type="text",
                label="Aadhaar Number",
                placeholder="",
                required=True,
                validation_rules=["required", "pattern: [0-9]{12}"]
            )
        ]
        
        step = FormStep(
            step_number=1,
            title="Aadhaar Validation",
            description="Enter your Aadhaar number",
            fields=fields,
            validation_rules=["required", "pattern: [0-9]{12}"]
        )
        
        assert step.step_number == 1
        assert step.title == "Aadhaar Validation"
        assert len(step.fields) == 1
        assert step.fields[0].name == "aadhaar"


class TestUdyamScraper:
    """Test UdyamScraper class"""
    
    @pytest.fixture
    def scraper(self):
        """Create a scraper instance for testing"""
        return UdyamScraper(headless=True)
    
    def test_scraper_initialization(self, scraper):
        """Test scraper initialization"""
        assert scraper.base_url == "https://udyamregistration.gov.in/UdyamRegistration.aspx"
        assert scraper.headless is True
        assert scraper.driver is None
        assert scraper.form_data == {}
    
    def test_extract_field_validation_required(self, scraper):
        """Test extracting validation rules from required field"""
        mock_element = Mock()
        mock_element.get_attribute.side_effect = lambda attr: {
            "required": "required",
            "pattern": None,
            "maxlength": None,
            "minlength": None,
            "type": "text"
        }.get(attr)
        
        rules = scraper.extract_field_validation(mock_element)
        assert "required" in rules
        assert len(rules) == 1
    
    def test_extract_field_validation_with_pattern(self, scraper):
        """Test extracting validation rules from field with pattern"""
        mock_element = Mock()
        mock_element.get_attribute.side_effect = lambda attr: {
            "required": None,
            "pattern": "[A-Z]{5}[0-9]{4}[A-Z]{1}",
            "maxlength": None,
            "minlength": None,
            "type": "text"
        }.get(attr)
        
        rules = scraper.extract_field_validation(mock_element)
        assert "pattern: [A-Z]{5}[0-9]{4}[A-Z]{1}" in rules
    
    def test_extract_field_validation_email(self, scraper):
        """Test extracting validation rules from email field"""
        mock_element = Mock()
        mock_element.get_attribute.side_effect = lambda attr: {
            "required": None,
            "pattern": None,
            "maxlength": None,
            "minlength": None,
            "type": "email"
        }.get(attr)
        
        rules = scraper.extract_field_validation(mock_element)
        assert "email_format" in rules
    
    def test_extract_dropdown_options(self, scraper):
        """Test extracting options from dropdown element"""
        mock_option1 = Mock()
        mock_option1.get_attribute.side_effect = lambda attr: {
            "value": "individual",
            "text": "Individual"
        }.get(attr)
        
        mock_option2 = Mock()
        mock_option2.get_attribute.side_effect = lambda attr: {
            "value": "company",
            "text": "Company"
        }.get(attr)
        
        mock_select = Mock()
        mock_select.find_elements.return_value = [mock_option1, mock_option2]
        
        options = scraper.extract_dropdown_options(mock_select)
        assert len(options) == 2
        assert "individual: Individual" in options
        assert "company: Company" in options
    
    def test_save_results(self, scraper):
        """Test saving results to JSON file"""
        test_data = {
            "metadata": {"title": "Test Form"},
            "steps": []
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_filename = f.name
        
        try:
            scraper.save_results(test_data, temp_filename)
            
            # Verify file was created and contains correct data
            assert os.path.exists(temp_filename)
            
            with open(temp_filename, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
            
            assert saved_data["metadata"]["title"] == "Test Form"
            
        finally:
            # Clean up
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)
    
    @patch('selenium.webdriver.Chrome')
    def test_setup_driver(self, mock_chrome, scraper):
        """Test setting up Chrome WebDriver"""
        mock_service = Mock()
        mock_chrome_options = Mock()
        
        with patch('selenium.webdriver.chrome.service.Service') as mock_service_class:
            with patch('selenium.webdriver.chrome.options.Options') as mock_options_class:
                with patch('webdriver_manager.chrome.ChromeDriverManager') as mock_manager:
                    mock_service_class.return_value = mock_service
                    mock_options_class.return_value = mock_chrome_options
                    mock_manager.return_value.install.return_value = "/path/to/chromedriver"
                    
                    scraper.setup_driver()
                    
                    mock_chrome.assert_called_once_with(
                        service=mock_service,
                        options=mock_chrome_options
                    )
    
    def test_close(self, scraper):
        """Test closing the scraper"""
        # Mock driver
        mock_driver = Mock()
        scraper.driver = mock_driver
        
        scraper.close()
        
        mock_driver.quit.assert_called_once()
        assert scraper.driver is None
    
    def test_close_no_driver(self, scraper):
        """Test closing when no driver exists"""
        scraper.driver = None
        
        # Should not raise any errors
        scraper.close()


class TestValidationRules:
    """Test validation rule extraction and processing"""
    
    def test_pan_validation_pattern(self):
        """Test PAN validation pattern"""
        pan_pattern = "[A-Z]{5}[0-9]{4}[A-Z]{1}"
        
        # Valid PAN examples
        valid_pans = ["ABCDE1234F", "WXYZA5678B", "PQRST9012C"]
        for pan in valid_pans:
            assert bool(re.match(pan_pattern, pan))
        
        # Invalid PAN examples
        invalid_pans = ["ABCD1234F", "ABCDE12345", "ABCDE1234", "12345ABCDE"]
        for pan in invalid_pans:
            assert not bool(re.match(pan_pattern, pan))
    
    def test_aadhaar_validation_pattern(self):
        """Test Aadhaar validation pattern"""
        aadhaar_pattern = "[0-9]{12}"
        
        # Valid Aadhaar examples
        valid_aadhaars = ["123456789012", "987654321098"]
        for aadhaar in valid_aadhaars:
            assert bool(re.match(aadhaar_pattern, aadhaar))
        
        # Invalid Aadhaar examples
        invalid_aadhaars = ["12345678901", "1234567890123", "ABCD12345678"]
        for aadhaar in invalid_aadhaars:
            assert not bool(re.match(aadhaar_pattern, aadhaar))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
