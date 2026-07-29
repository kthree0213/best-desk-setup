(() => {
  const track = (eventName, params = {}) => {
    const payload = { ...params, page_path: window.location.pathname };
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...payload });
    }
  };

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.dataset.open = String(open);
      const icon = menuButton.querySelector('i');
      if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-list';
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.dataset.open = 'false';
      }
    });
  }

  document.querySelectorAll('[data-problem]').forEach((link) => {
    link.addEventListener('click', () => track('desk_problem_select', { desk_problem: link.dataset.problem }));
  });

  document.querySelectorAll('[data-track]').forEach((link) => {
    link.addEventListener('click', () => track('internal_cta_click', { cta_name: link.dataset.track }));
  });

  document.querySelectorAll('a[href*="amazon.com"][data-affiliate]').forEach((link) => {
    link.addEventListener('click', () => {
      track('affiliate_click', {
        affiliate_network: 'amazon',
        asin: link.dataset.asin || '',
        product_name: link.dataset.product || '',
        link_position: link.dataset.position || ''
      });
    });
  });

  const form = document.querySelector('[data-fit-form]');
  const result = document.querySelector('[data-fit-result]');
  if (!form || !result) return;

  const recommendations = {
    clamp: {
      title: 'Start with a clamp-on solution',
      body: 'A flat, exposed edge gives a clamp somewhere to grip. Confirm desktop thickness, underside clearance, and where the clamp hardware will sit before ordering.',
      href: '/articles/no-drill-cable-management-for-renters.html',
      label: 'Open the no-drill guide'
    },
    adhesive: {
      title: 'Start with a removable adhesive route',
      body: 'A blocked edge can rule out many clamps. Adhesive channels or clips may work on a clean, sealed underside, but they are a poor match for dusty, textured, or porous surfaces.',
      href: '/articles/clamp-vs-adhesive-cable-management.html',
      label: 'Compare adhesive and clamp options'
    },
    clips: {
      title: 'Start with small cable clips',
      body: 'Daily charging cables need parking, not a load-bearing tray. Check cable diameter and adhesive surface before choosing a clip style.',
      href: '/articles/small-desk-cable-management-checklist.html',
      label: 'Open the cable checklist'
    },
    sleeve: {
      title: 'Start with a cable sleeve',
      body: 'A sleeve can contain one visible bundle between the desk and outlet. It will not hold a power strip or remove the need for safe slack.',
      href: '/articles/cable-management-for-standing-desks.html',
      label: 'Read the routing guide'
    },
    measure: {
      title: 'Measure before choosing a mount',
      body: 'Edge shape, desktop thickness, and obstacles beneath the surface determine what can attach safely. A two-minute measurement prevents most fit mistakes.',
      href: '/articles/measure-desk-for-clamp-accessories.html',
      label: 'Use the measurement guide'
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const edge = data.get('edge');
    const drill = data.get('drill');
    const load = data.get('load');
    let key = 'measure';
    if (load === 'daily') key = 'clips';
    else if (load === 'bundle') key = 'sleeve';
    else if (edge === 'flat' && drill === 'no') key = 'clamp';
    else if (edge === 'blocked' && drill === 'no') key = 'adhesive';
    else if (edge === 'flat') key = 'clamp';

    const recommendation = recommendations[key];
    result.innerHTML = `<h3>${recommendation.title}</h3><p>${recommendation.body}</p><a class="text-link" href="${recommendation.href}">${recommendation.label} <i class="ph ph-arrow-right" aria-hidden="true"></i></a>`;
    result.hidden = false;
    result.focus();
    track('fit_checker_complete', { recommendation: key, edge, drill, load });
  });
})();
