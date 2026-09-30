(() => {
  const forms = document.querySelectorAll('.abc-enquiry-form');
  if (!forms.length) return;

  const setError = (field, message) => {
    const wrap = field.closest('label');
    if (!wrap) return;
    let error = wrap.querySelector('.field-error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'field-error';
      wrap.appendChild(error);
    }
    error.textContent = message || '';
    field.classList.toggle('field-invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const clearError = field => setError(field, '');

  forms.forEach(form => {
    const requiredFields = [...form.querySelectorAll('[required]')];
    requiredFields.forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) clearError(field);
      });
      field.addEventListener('change', () => {
        if (field.value.trim()) clearError(field);
      });
    });

    const phone = form.querySelector('input[name="phone"]');
    phone?.addEventListener('input', () => {
      phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
      if (/^\d{10}$/.test(phone.value)) clearError(phone);
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      let valid = true;
      const firstInvalid = [];

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          setError(field, field.tagName === 'SELECT' ? 'Please select an option.' : `Please enter your ${field.name === 'name' ? 'name' : field.name}.`);
          valid = false;
          firstInvalid.push(field);
        } else {
          clearError(field);
        }
      });

      if (phone && phone.value && !/^\d{10}$/.test(phone.value)) {
        setError(phone, 'Please enter a valid 10-digit phone number.');
        valid = false;
        firstInvalid.push(phone);
      }

      const status = form.querySelector('.form-status');
      if (!valid) {
        if (status) {
          status.textContent = 'Please complete the required fields marked with *.';
          status.className = 'form-status error';
        }
        firstInvalid[0]?.focus();
        return;
      }

      const data = new FormData(form);
      const service = data.get('service') || 'an enquiry';
      const msg = `Hi ABC Fashion & Beauty Academy,\n\nName: ${data.get('name')}\nEmail: ${data.get('email') || 'Not provided'}\nPhone: ${data.get('phone')}\nWork / Store Service: ${service}\nRequirement: ${data.get('message') || 'Not provided'}`;
      const whatsappUrl = 'https://wa.me/919385920297?text=' + encodeURIComponent(msg);
      window.open(whatsappUrl, '_blank', 'noopener');
      if (status) {
        status.textContent = 'Opening WhatsApp with your enquiry…';
        status.className = 'form-status success';
      }
    });
  });
})();
