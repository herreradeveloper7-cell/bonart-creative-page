import { contact } from '../data/contact';

const card = document.querySelector<HTMLElement>('[data-contact-card]');
if (card) {
  const form = card.querySelector<HTMLFormElement>('[data-lead-form]')!;
  const fields = card.querySelector<HTMLFieldSetElement>('[data-fields]')!;
  const status = card.querySelector<HTMLElement>('[data-status]')!;
  const success = card.querySelector<HTMLElement>('[data-success]')!;
  const whatsapp = card.querySelector<HTMLAnchorElement>('[data-whatsapp]')!;
  const phone = form.elements.namedItem('phone') as HTMLInputElement;
  const name = form.elements.namedItem('firstname') as HTMLInputElement;
  const consent = form.elements.namedItem('consent') as HTMLInputElement;
  const submit = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  )!;
  const dialog = document.querySelector<HTMLDialogElement>(
    '[data-contact-dialog]',
  );
  const services = [
    'el plan Start',
    'el plan Growth',
    'el plan Commerce',
    'la Auditoría Bonart',
  ];
  let service = '';
  let pending = false;
  let completed = false;
  let trigger: HTMLElement | null = null;
  let previousOverflow = '';

  function updateSubmit() {
    submit.disabled = !consent.checked || pending || completed;
  }

  function selectService(value: string | null) {
    service = value && services.includes(value) ? value : '';
    if (completed || pending || !service) return;
    const suggestion = service.includes('Start')
      ? 'Página web'
      : service.includes('Growth')
        ? 'Conseguir más clientes'
        : service.includes('Commerce')
          ? 'Tienda online'
          : 'No estoy seguro';
    const options = form.querySelectorAll<HTMLInputElement>(
      '[name="necesidad_del_proyecto"]',
    );
    options.forEach((option) => {
      option.checked = option.value === suggestion;
    });
  }

  selectService(new URLSearchParams(location.search).get('servicio'));
  fields.disabled = false;
  updateSubmit();
  consent.addEventListener('change', updateSubmit);
  window.addEventListener('pageshow', updateSubmit);
  form.addEventListener('reset', () => queueMicrotask(updateSubmit));
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  name.addEventListener('input', () => name.setCustomValidity(''));

  if (dialog) {
    document
      .querySelectorAll<HTMLAnchorElement>('a[data-contact]')
      .forEach((link) => {
        link.addEventListener('click', (event) => {
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return;
          event.preventDefault();
          trigger = link;
          if (!completed && !pending)
            selectService(new URL(link.href).searchParams.get('servicio'));
          previousOverflow = document.body.style.overflow;
          dialog.showModal();
          document.body.style.overflow = 'hidden';
          if (completed) success.focus();
        });
      });
    dialog
      .querySelector('[data-close-contact]')
      ?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || completed || !consent.checked) return;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    const normalizedPhone = value('phone').replace(/[\s().-]/g, '');
    name.setCustomValidity(value('firstname') ? '' : 'Escribe tu nombre.');
    phone.setCustomValidity(
      /^\+[1-9]\d{7,14}$/.test(normalizedPhone)
        ? ''
        : 'Incluye +, el código del país y tu número. Ejemplo: +573001234567.',
    );
    if (!form.reportValidity()) return;
    if (value('website_url')) {
      status.textContent =
        'No pudimos enviar el formulario. Recarga la página e inténtalo de nuevo.';
      return;
    }
    const submittedService = service;
    pending = true;
    updateSubmit();
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando tus datos…';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${contact.portalId}/${contact.formId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            fields: [
              'firstname',
              'company',
              'email',
              'phone',
              'necesidad_del_proyecto',
            ].map((key) => ({
              objectTypeId: '0-1',
              name: key,
              value: key === 'phone' ? normalizedPhone : value(key),
            })),
            context: {
              pageUri: location.origin + location.pathname,
              pageName: submittedService
                ? `${document.title} — ${submittedService}`
                : document.title,
            },
            legalConsentOptions: {
              consent: {
                consentToProcess: data.get('consent') === 'on',
                text: contact.consent,
                communications: [],
              },
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? 'Hay muchos envíos en este momento. Espera un minuto e inténtalo de nuevo.'
            : 'No pudimos registrar tus datos. Inténtalo nuevamente en unos minutos.',
        );
      }
      completed = true;
      const message = `Hola BonArt, soy ${value('firstname')}${value('company') ? ` de ${value('company')}` : ''}. Acabo de enviar el formulario. Me interesa: ${value('necesidad_del_proyecto')}.${submittedService ? ` Quisiera información sobre ${submittedService}.` : ''}`;
      whatsapp.href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
      form.hidden = true;
      status.textContent = '';
      success.hidden = false;
      if (!dialog || dialog.open) success.focus();
    } catch (error) {
      status.textContent =
        error instanceof Error &&
        error.name !== 'AbortError' &&
        !(error instanceof TypeError)
          ? error.message
          : 'No pudimos confirmar el envío. Revisa tu conexión e inténtalo de nuevo; tus datos siguen en el formulario.';
    } finally {
      clearTimeout(timeout);
      pending = false;
      fields.disabled = completed;
      updateSubmit();
      form.removeAttribute('aria-busy');
    }
  });
}
