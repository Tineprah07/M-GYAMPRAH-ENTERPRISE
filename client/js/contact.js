/* Contact page enquiry form */
(function () {
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('[data-form-feedback]');
    const fd = new FormData(form);
    const payload = {
      name: fd.get('name')?.trim(),
      email: fd.get('email')?.trim(),
      phone: fd.get('phone')?.trim() || null,
      company: fd.get('company')?.trim() || null,
      subject: fd.get('subject')?.trim() || null,
      message: fd.get('message')?.trim(),
    };

    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = 'Sending…';
    feedback.classList.remove('show', 'success', 'error');

    try {
      const res = await MGE.api('/api/enquiries', { method: 'POST', body: JSON.stringify(payload) });
      feedback.textContent = res.message || 'Thank you. Your enquiry has been received.';
      feedback.classList.add('show', 'success');
      form.reset();
      MGE.toast('Enquiry sent.', 'success');
    } catch (err) {
      feedback.textContent = err.details?.join(' • ') || err.message || 'Something went wrong.';
      feedback.classList.add('show', 'error');
      MGE.toast('Failed to send enquiry', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  });
})();
