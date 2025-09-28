/**
 * Hayalimdeki Çanakkale - Kısa Film Yarışması
 * Form Validation JavaScript
 */

'use strict';

const ValidationRules = {
    required: {
        validate: (value) => value.trim() !== '',
        message: 'Bu alan zorunludur'
    },
    email: {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Geçerli bir email adresi giriniz'
    },
    phone: {
        validate: (value) => {
            const cleanPhone = value.replace(/\s/g, '');
            return /^(\+90|0)?5\d{9}$/.test(cleanPhone);
        },
        message: 'Geçerli bir telefon numarası giriniz (05XX XXX XX XX)'
    },
    minLength: (min) => ({
        validate: (value) => value.length >= min,
        message: `En az ${min} karakter olmalıdır`
    }),
    maxLength: (max) => ({
        validate: (value) => value.length <= max,
        message: `En fazla ${max} karakter olabilir`
    }),
    youtubeUrl: {
        validate: (value) => {
            const patterns = [
                /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
                /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/
            ];
            return patterns.some(pattern => pattern.test(value));
        },
        message: 'Geçerli bir YouTube URL\'si giriniz'
    }
};

class FormField {
    constructor(element) {
        this.element = element;
        this.name = element.name;
        this.rules = [];
        this.errorElement = null;
        this.isValid = true;
        
        this.init();
    }
    
    init() {
        this.errorElement = document.createElement('span');
        this.errorElement.className = 'form-error-message hidden';
        this.element.parentNode.appendChild(this.errorElement);
        
        this.element.addEventListener('blur', () => this.validate());
        this.element.addEventListener('input', () => {
            if (!this.isValid) {
                this.validate();
            }
        });
    }
    
    addRule(rule) {
        this.rules.push(rule);
        return this;
    }
    
    validate() {
        const value = this.element.value;
        let firstError = null;
        
        for (const rule of this.rules) {
            let isValid = rule.validate(value);
            
            if (!isValid) {
                firstError = rule.message;
                break;
            }
        }
        
        if (firstError) {
            this.showError(firstError);
            this.isValid = false;
        } else {
            this.hideError();
            this.isValid = true;
        }
        
        return this.isValid;
    }
    
    showError(message) {
        this.element.classList.add('error');
        this.element.classList.remove('success');
        this.errorElement.textContent = message;
        this.errorElement.classList.remove('hidden');
    }
    
    hideError() {
        this.element.classList.remove('error');
        this.element.classList.add('success');
        this.errorElement.classList.add('hidden');
    }
    
    reset() {
        this.element.classList.remove('error', 'success');
        this.errorElement.classList.add('hidden');
        this.isValid = true;
    }
}

class Form {
    constructor(formElement) {
        this.form = formElement;
        this.fields = new Map();
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        window.AppUtils?.debugLog(`Form başlatıldı: ${this.form.id || 'unnamed'}`);
    }
    
    addField(name, rules = []) {
        const element = this.form.querySelector(`[name="${name}"]`);
        
        if (!element) {
            console.error(`Form field bulunamadı: ${name}`);
            return this;
        }
        
        const field = new FormField(element);
        
        rules.forEach(rule => field.addRule(rule));
        
        this.fields.set(name, field);
        return this;
    }
    
    validateAll() {
        let isValid = true;
        
        this.fields.forEach(field => {
            if (!field.validate()) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async handleSubmit() {
        if (this.isSubmitting) return;
        
        if (!this.validateAll()) {
            this.showAlert('error', 'Lütfen tüm alanları doğru şekilde doldurunuz.');
            return;
        }
        
        this.isSubmitting = true;
        this.disableForm();
        
        try {
            const formData = this.getFormData();
            window.AppUtils?.debugLog('Form gönderiliyor...', formData);
            
            await this.submitToAPI(formData);
            
            this.showAlert('success', 'Başvurunuz başarıyla alındı! En kısa sürede size dönüş yapacağız.');
            this.reset();
            
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            this.showAlert('error', 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
        } finally {
            this.isSubmitting = false;
            this.enableForm();
        }
    }
    
    async submitToAPI(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve({ success: true });
            }, 2000);
        });
    }
    
    getFormData() {
        const data = {};
        
        this.fields.forEach((field, name) => {
            if (field.element.type === 'checkbox') {
                data[name] = field.element.checked;
            } else {
                data[name] = field.element.value;
            }
        });
        
        return data;
    }
    
    showAlert(type, message) {
        const existingAlerts = this.form.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="alert-content">
                <p>${message}</p>
            </div>
        `;
        
        this.form.insertBefore(alert, this.form.firstChild);
        alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        if (type === 'success') {
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            }, 5000);
        }
    }
    
    disableForm() {
        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Gönderiliyor...';
        }
        
        this.fields.forEach(field => {
            field.element.disabled = true;
        });
    }
    
    enableForm() {
        const submitBtn = this.form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Başvuruyu Gönder';
        }
        
        this.fields.forEach(field => {
            field.element.disabled = false;
        });
    }
    
    reset() {
        this.form.reset();
        this.fields.forEach(field => field.reset());
    }
}

function initApplicationForm() {
    const applicationForm = document.getElementById('application-form');
    
    if (!applicationForm) return;
    
    const form = new Form(applicationForm);
    
    form
        .addField('fullName', [
            ValidationRules.required,
            ValidationRules.minLength(3)
        ])
        .addField('email', [
            ValidationRules.required,
            ValidationRules.email
        ])
        .addField('phone', [
            ValidationRules.required,
            ValidationRules.phone
        ])
        .addField('filmTitle', [
            ValidationRules.required,
            ValidationRules.minLength(2),
            ValidationRules.maxLength(100)
        ])
        .addField('youtubeUrl', [
            ValidationRules.required,
            ValidationRules.youtubeUrl
        ])
        .addField('filmDuration', [
            ValidationRules.required
        ])
        .addField('filmDescription', [
            ValidationRules.required,
            ValidationRules.minLength(50),
            ValidationRules.maxLength(1000)
        ])
        .addField('agreeTerms', [
            {
                validate: (value) => value === true || value === 'on',
                message: 'Şartları kabul etmelisiniz'
            }
        ]);
    
    window.AppUtils?.debugLog('Başvuru formu başlatıldı');
}

function initPhoneFormatting() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value[0] !== '0') {
                    value = '0' + value;
                }
                
                let formatted = value;
                if (value.length > 4) {
                    formatted = value.slice(0, 4) + ' ' + value.slice(4);
                }
                if (value.length > 7) {
                    formatted = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
                }
                if (value.length > 9) {
                    formatted = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 9) + ' ' + value.slice(9, 11);
                }
                
                e.target.value = formatted;
            }
        });
    });
    
    window.AppUtils?.debugLog('Telefon formatlaması başlatıldı');
}

function initCharacterCounter() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        
        const counter = document.createElement('div');
        counter.className = 'character-counter text-sm text-gray-500 mt-1 text-right';
        counter.innerHTML = `<span class="current">0</span> / <span class="max">${maxLength}</span>`;
        
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const currentLength = textarea.value.length;
            const currentSpan = counter.querySelector('.current');
            currentSpan.textContent = currentLength;
            
            if (currentLength >= maxLength * 0.9) {
                currentSpan.className = 'text-red-500 font-semibold';
            } else if (currentLength >= maxLength * 0.7) {
                currentSpan.className = 'text-yellow-500 font-semibold';
            } else {
                currentSpan.className = 'text-gray-700';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
    
    window.AppUtils?.debugLog('Karakter sayaçları başlatıldı');
}

function initForms() {
    window.AppUtils?.debugLog('Form sistemleri başlatılıyor...');
    
    initApplicationForm();
    initPhoneFormatting();
    initCharacterCounter();
    
    window.AppUtils?.debugLog('Form sistemleri başlatıldı');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
} else {
    initForms();
}

window.FormModule = {
    Form,
    FormField,
    ValidationRules
};