#!/usr/bin/env python3
"""
Udyam Registration Portal Web Scraper

This script scrapes the Udyam registration form to extract:
- Form fields and their types
- Validation rules and patterns
- UI structure and layout
- Dropdown options and selections
"""

import json
import time
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests


@dataclass
class FormField:
    """Represents a form field with its properties"""
    name: str
    type: str
    label: str
    placeholder: Optional[str]
    required: bool
    validation_rules: List[str]
    options: List[str] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None
    css_selector: str = ""


@dataclass
class FormStep:
    """Represents a form step with its fields"""
    step_number: int
    title: str
    description: str
    fields: List[FormField]
    validation_rules: List[str]


class UdyamScraper:
    """Main scraper class for Udyam registration portal"""
    
    def __init__(self, headless: bool = True):
        self.base_url = "https://udyamregistration.gov.in/UdyamRegistration.aspx"
        self.driver = None
        self.headless = headless
        self.form_data = {}
        
    def setup_driver(self):
        """Setup Chrome WebDriver with appropriate options"""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
    def extract_field_validation(self, field_element) -> List[str]:
        """Extract validation rules from field attributes"""
        validation_rules = []
        
        # Check for required attribute
        if field_element.get_attribute("required"):
            validation_rules.append("required")
            
        # Check for pattern attribute
        pattern = field_element.get_attribute("pattern")
        if pattern:
            validation_rules.append(f"pattern: {pattern}")
            
        # Check for maxlength
        max_length = field_element.get_attribute("maxlength")
        if max_length:
            validation_rules.append(f"max_length: {max_length}")
            
        # Check for minlength
        min_length = field_element.get_attribute("minlength")
        if min_length:
            validation_rules.append(f"min_length: {min_length}")
            
        # Check for type-specific validations
        field_type = field_element.get_attribute("type")
        if field_type == "email":
            validation_rules.append("email_format")
        elif field_type == "tel":
            validation_rules.append("phone_format")
            
        return validation_rules
    
    def extract_dropdown_options(self, select_element) -> List[str]:
        """Extract options from dropdown/select elements"""
        options = []
        try:
            option_elements = select_element.find_elements(By.TAG_NAME, "option")
            for option in option_elements:
                value = option.get_attribute("value")
                text = option.text.strip()
                if value and text:
                    options.append(f"{value}: {text}")
        except Exception as e:
            print(f"Error extracting dropdown options: {e}")
        return options
    
    def extract_form_fields(self, step_number: int) -> List[FormField]:
        """Extract form fields from the current step"""
        fields = []
        
        # Wait for form to load
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "form"))
        )
        
        # Find all input fields
        input_elements = self.driver.find_elements(By.TAG_NAME, "input")
        select_elements = self.driver.find_elements(By.TAG_NAME, "select")
        textarea_elements = self.driver.find_elements(By.TAG_NAME, "textarea")
        
        # Process input fields
        for input_elem in input_elements:
            try:
                field_type = input_elem.get_attribute("type") or "text"
                field_name = input_elem.get_attribute("name") or input_elem.get_attribute("id") or ""
                field_id = input_elem.get_attribute("id") or ""
                
                # Find associated label
                label = ""
                if field_id:
                    try:
                        label_elem = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{field_id}']")
                        label = label_elem.text.strip()
                    except:
                        pass
                
                # If no label found, look for nearby text
                if not label:
                    try:
                        parent = input_elem.find_element(By.XPATH, "./..")
                        label = parent.text.strip()
                    except:
                        pass
                
                placeholder = input_elem.get_attribute("placeholder") or ""
                required = bool(input_elem.get_attribute("required"))
                validation_rules = self.extract_field_validation(input_elem)
                
                field = FormField(
                    name=field_name,
                    type=field_type,
                    label=label,
                    placeholder=placeholder,
                    required=required,
                    validation_rules=validation_rules,
                    css_selector=f"#{field_id}" if field_id else ""
                )
                
                fields.append(field)
                
            except Exception as e:
                print(f"Error processing input field: {e}")
                continue
        
        # Process select fields
        for select_elem in select_elements:
            try:
                field_name = select_elem.get_attribute("name") or select_elem.get_attribute("id") or ""
                field_id = select_elem.get_attribute("id") or ""
                
                # Find associated label
                label = ""
                if field_id:
                    try:
                        label_elem = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{field_id}']")
                        label = label_elem.text.strip()
                    except:
                        pass
                
                placeholder = select_elem.get_attribute("placeholder") or ""
                required = bool(select_elem.get_attribute("required"))
                validation_rules = self.extract_field_validation(select_elem)
                options = self.extract_dropdown_options(select_elem)
                
                field = FormField(
                    name=field_name,
                    type="select",
                    label=label,
                    placeholder=placeholder,
                    required=required,
                    validation_rules=validation_rules,
                    options=options,
                    css_selector=f"#{field_id}" if field_id else ""
                )
                
                fields.append(field)
                
            except Exception as e:
                print(f"Error processing select field: {e}")
                continue
        
        # Process textarea fields
        for textarea_elem in textarea_elements:
            try:
                field_name = textarea_elem.get_attribute("name") or textarea_elem.get_attribute("id") or ""
                field_id = textarea_elem.get_attribute("id") or ""
                
                # Find associated label
                label = ""
                if field_id:
                    try:
                        label_elem = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{field_id}']")
                        label = label_elem.text.strip()
                    except:
                        pass
                
                placeholder = textarea_elem.get_attribute("placeholder") or ""
                required = bool(textarea_elem.get_attribute("required"))
                validation_rules = self.extract_field_validation(textarea_elem)
                
                field = FormField(
                    name=field_name,
                    type="textarea",
                    label=label,
                    placeholder=placeholder,
                    required=required,
                    validation_rules=validation_rules,
                    css_selector=f"#{field_id}" if field_id else ""
                )
                
                fields.append(field)
                
            except Exception as e:
                print(f"Error processing textarea field: {e}")
                continue
        
        return fields
    
    def extract_step_info(self, step_number: int) -> FormStep:
        """Extract information about a specific form step"""
        try:
            # Wait for step content to load
            time.sleep(2)
            
            # Try to find step title and description
            title = f"Step {step_number}"
            description = ""
            
            # Look for common step indicators
            step_indicators = [
                f"//div[contains(text(), 'Step {step_number}')]",
                f"//h[contains(text(), 'Step {step_number}')]",
                f"//span[contains(text(), 'Step {step_number}')]",
                f"//div[contains(@class, 'step-{step_number}')]"
            ]
            
            for indicator in step_indicators:
                try:
                    elem = self.driver.find_element(By.XPATH, indicator)
                    title = elem.text.strip()
                    break
                except:
                    continue
            
            # Extract fields for this step
            fields = self.extract_form_fields(step_number)
            
            # Extract validation rules for the step
            validation_rules = []
            for field in fields:
                validation_rules.extend(field.validation_rules)
            
            return FormStep(
                step_number=step_number,
                title=title,
                description=description,
                fields=fields,
                validation_rules=list(set(validation_rules))  # Remove duplicates
            )
            
        except Exception as e:
            print(f"Error extracting step {step_number} info: {e}")
            return FormStep(
                step_number=step_number,
                title=f"Step {step_number}",
                description="",
                fields=[],
                validation_rules=[]
            )
    
    def scrape_form_structure(self) -> Dict[str, Any]:
        """Main method to scrape the complete form structure"""
        try:
            print("Starting Udyam registration form scraping...")
            
            # Navigate to the form
            self.driver.get(self.base_url)
            print(f"Navigated to: {self.base_url}")
            
            # Wait for page to load
            time.sleep(5)
            
            # Extract form metadata
            form_metadata = {
                "url": self.base_url,
                "title": self.driver.title,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_steps": 2
            }
            
            # Extract Step 1: Aadhaar + OTP Validation
            print("Extracting Step 1: Aadhaar + OTP Validation...")
            step1 = self.extract_step_info(1)
            
            # Try to navigate to Step 2 if possible
            print("Attempting to navigate to Step 2...")
            try:
                # Look for next button or step 2 navigation
                next_buttons = self.driver.find_elements(By.XPATH, 
                    "//input[@type='submit' and contains(@value, 'Next')] | //button[contains(text(), 'Next')]")
                
                if next_buttons:
                    next_buttons[0].click()
                    time.sleep(3)
                    step2 = self.extract_step_info(2)
                else:
                    # If no next button, try to find step 2 elements on the same page
                    step2 = self.extract_step_info(2)
                    
            except Exception as e:
                print(f"Could not navigate to Step 2: {e}")
                step2 = FormStep(
                    step_number=2,
                    title="Step 2: PAN Validation",
                    description="",
                    fields=[],
                    validation_rules=[]
                )
            
            # Compile results
            form_structure = {
                "metadata": form_metadata,
                "steps": [asdict(step1), asdict(step2)]
            }
            
            return form_structure
            
        except Exception as e:
            print(f"Error during scraping: {e}")
            return {"error": str(e)}
    
    def save_results(self, data: Dict[str, Any], filename: str = "udyam_form_structure.json"):
        """Save scraped data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Results saved to {filename}")
        except Exception as e:
            print(f"Error saving results: {e}")
    
    def close(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()


def main():
    """Main execution function"""
    scraper = None
    try:
        # Initialize scraper
        scraper = UdyamScraper(headless=False)  # Set to False for debugging
        scraper.setup_driver()
        
        # Scrape form structure
        form_data = scraper.scrape_form_structure()
        
        # Save results
        if "error" not in form_data:
            scraper.save_results(form_data)
            print("Scraping completed successfully!")
            print(f"Total fields found: {sum(len(step['fields']) for step in form_data['steps'])}")
        else:
            print(f"Scraping failed: {form_data['error']}")
            
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        if scraper:
            scraper.close()


if __name__ == "__main__":
    main()
