// ============================================
// CONTACT FORM HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    setupNavbarScroll();
    
    // Setup contact form
    setupContactForm();
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

function setupNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 100);
        });
    }
}

// ============================================
// CONTACT FORM SETUP
// ============================================

function setupContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                validateField(input);
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            form.classList.add('was-validated');
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        
        try {
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission (replace with actual API call)
            await submitContactForm(data);
            
            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Reset form after 5 seconds
            setTimeout(() => {
                form.reset();
                form.classList.remove('was-validated');
                form.style.display = 'block';
                successMessage.style.display = 'none';
                inputs.forEach(input => {
                    input.classList.remove('is-valid', 'is-invalid');
                });
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormError('An error occurred while sending your message. Please try again later.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
        }
    });
}

// ============================================
// VALIDATE FIELD
// ============================================

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = field.getAttribute('data-error') || 'This field is required.';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please provide a valid email address.';
        }
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            isValid = false;
            errorMessage = 'Please provide a valid phone number.';
        }
    }
    
    // Message length validation
    if (field.tagName === 'TEXTAREA' && value) {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long.';
        }
        if (value.length > 2000) {
            isValid = false;
            errorMessage = 'Message must be less than 2000 characters.';
        }
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

// ============================================
// SUBMIT CONTACT FORM
// ============================================

async function submitContactForm(data) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you would make an actual API call here:
    /*
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to submit form');
    }
    
    return await response.json();
    */
    
    // For now, just log the data (in production, this would be sent to a server)
    console.log('Form submitted with data:', data);
    
    // Simulate success
    return { success: true, message: 'Form submitted successfully' };
}

// ============================================
// SHOW FORM ERROR
// ============================================

function showFormError(message) {
    // Remove existing error alerts
    const existingAlert = document.querySelector('.form-error-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger form-error-alert';
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Error:</strong> ${message}
    `;
    
    // Insert before form
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(alert, form);
    
    // Scroll to error
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Remove error after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

