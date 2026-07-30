import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articleDir = path.join(root, 'articles');
const siteUrl = 'https://bestdesksetup.com';
const associateTag = 'bestdeskweb-20';

// These are editorial dates, not build timestamps. Update only the URL whose
// reviewed content changed so sitemap and Article metadata remain truthful.
const contentDates = Object.freeze({
  '/': { modified: '2026-07-30' },
  '/guides.html': { modified: '2026-07-30' },
  '/method.html': { modified: '2026-07-30' },
  '/about.html': { modified: '2026-07-30' },
  '/disclosure.html': { modified: '2026-07-30' },
  '/privacy.html': { modified: '2026-07-30' },
  '/terms.html': { modified: '2026-07-30' },
  '/contact.html': { modified: '2026-07-30' },
  '/articles/no-drill-cable-management-for-renters.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/clamp-vs-adhesive-cable-management.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/cable-management-for-standing-desks.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/small-desk-cable-management-checklist.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/measure-desk-for-clamp-accessories.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/vertical-storage-for-small-desks.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/monitor-arm-compatibility-small-desk.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/compact-desk-lighting-guide.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/small-desk-layout-guide.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/renter-friendly-desk-upgrades.html': { published: '2026-07-30', modified: '2026-07-30' },
  '/articles/how-to-route-desk-cables.html': { published: '2026-07-30', modified: '2026-07-30' }
});

function datesFor(urlPath) {
  const dates = contentDates[urlPath];
  if (!dates) throw new Error(`Missing editorial dates for ${urlPath}`);
  return dates;
}

function displayDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`));
}

const images = {
  cables: '/assets/images/site-v3/no-drill-cable-tray.jpg',
  comparison: '/assets/images/site-v3/clamp-vs-adhesive-cable-management.webp',
  standing: '/assets/images/site-v3/standing-desk-cable-management.webp',
  checklist: '/assets/images/site-v3/small-desk-cable-checklist.webp',
  routing: '/assets/images/site-v3/desk-cable-routing.webp',
  storage: '/assets/images/site-v3/vertical-storage.jpg',
  monitor: '/assets/images/site-v3/monitor-arm.jpg',
  lighting: '/assets/images/site-v3/compact-lighting.jpg',
  layout: '/assets/images/site-v3/hero-compact-desk.jpg'
};

const header = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-header>
    <div class="shell nav-shell">
      <a class="wordmark" href="/" aria-label="Best Desk Setup home">Best <span>Desk</span> Setup</a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav" data-menu-toggle><i class="ph ph-list" aria-hidden="true"></i></button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-nav>
        <a href="/#desk-problems">Desk Problems</a>
        <a href="/guides.html">How-to Guides</a>
        <a href="/articles/clamp-vs-adhesive-cable-management.html">Comparisons</a>
        <a href="/method.html">Our Method</a>
      </nav>
    </div>
  </header>`;

const footer = `
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div><a class="wordmark" href="/">Best <span>Desk</span> Setup</a><p>Small-space desk fixes. Fit first.</p></div>
      <nav aria-label="Footer navigation"><a href="/guides.html">Guides</a><a href="/method.html">Our Method</a><a href="/about.html">About</a></nav>
      <nav aria-label="Legal links"><a href="/disclosure.html">Disclosure</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/contact.html">Contact</a></nav>
      <p>© 2026 Best Desk Setup</p>
    </div>
  </footer>`;

function head({ title, description, canonical, image = images.layout, type = 'article', schema = null, robots = 'index,follow' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}${image}">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css">
  <link rel="stylesheet" href="/assets/site-v3.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SPN9T63MYG"></script>
  <script>if(location.hostname==='localhost'||location.hostname==='127.0.0.1')window['ga-disable-G-SPN9T63MYG']=true;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-SPN9T63MYG');</script>
  <script defer src="/assets/site-v3.js"></script>${schema ? `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
</head>`;
}

function affiliateButton({ asin, product, position, shortName }) {
  return `<a class="affiliate-button" href="https://www.amazon.com/dp/${asin}?tag=${associateTag}" target="_blank" rel="sponsored noopener noreferrer" data-affiliate data-asin="${asin}" data-product="${product}" data-position="${position}">Check ${shortName} on Amazon <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>`;
}

function pick({ number, id, type, guidance, name, shortName, summary, fit, tradeoff, confirm, asin, position, primary = false }) {
  return `<article class="product-pick${primary ? ' product-pick--primary' : ''}" id="${id}">
    <header class="pick-header"><span class="pick-number" aria-hidden="true">${number}</span><div><p class="pick-type">${type}</p><h3>${name}</h3><p class="pick-guidance">${guidance}</p></div></header>
    <p>${summary}</p>
    <div class="pick-facts"><div><strong>Good fit when</strong><span>${fit}</span></div><div><strong>Main trade-off</strong><span>${tradeoff}</span></div></div>
    <p class="pick-confirm"><strong>Confirm on Amazon:</strong> ${confirm}</p>
    <div class="pick-action">${affiliateButton({ asin, product: name, position, shortName })}<span>Opens the current US listing.</span></div>
  </article>`;
}

const pickChooser = `
  <div class="pick-chooser" role="region" aria-label="Choose an installation style">
    <p><strong>These are four separate Amazon listings, not four versions of the same item.</strong> Choose one primary mounting method, then add a sleeve only if a visible cable run still needs containment.</p>
    <div class="pick-chooser-grid">
      <a href="#pick-clamp" data-track="chooser_flat_edge"><span>Flat, exposed desk edge</span><strong>Start with a clamp tray <i class="ph ph-arrow-down" aria-hidden="true"></i></strong></a>
      <a href="#pick-adhesive" data-track="chooser_blocked_edge"><span>Apron or frame blocks the edge</span><strong>Check an adhesive tray <i class="ph ph-arrow-down" aria-hidden="true"></i></strong></a>
      <a href="#pick-light" data-track="chooser_light_setup"><span>Clamp fits, but black feels too heavy</span><strong>See the light-color option <i class="ph ph-arrow-down" aria-hidden="true"></i></strong></a>
      <a href="#pick-sleeve" data-track="chooser_visible_run"><span>The tray is fine; the drop is messy</span><strong>Add a cable sleeve <i class="ph ph-arrow-down" aria-hidden="true"></i></strong></a>
    </div>
  </div>`;

const corePicks = `
  <div class="pick-list">
    ${pick({
      number: '01',
      id: 'pick-clamp',
      type: 'Clamp-on tray',
      guidance: 'The common starting point for a flat, exposed desk edge.',
      name: 'Litwaro Cable Management Tray',
      shortName: 'Litwaro',
      summary: 'A metal under-desk tray that attaches at the desk edge, so the power strip and excess cable can move off the floor without adhesive on the desktop.',
      fit: 'Your desk has a flat, exposed rear or side edge and clear space below it.',
      tradeoff: 'The clamps remain visible and edge geometry determines whether it can attach.',
      confirm: 'Clamp opening, usable edge depth, tray clearance, and included hardware.',
      asin: 'B0BZ3GHM8N',
      position: 'pick_1_clamp',
      primary: true
    })}
    ${pick({
      number: '02',
      id: 'pick-adhesive',
      type: 'Adhesive tray',
      guidance: 'Use this route when a frame or apron makes an edge clamp impossible.',
      name: 'Scandinavian Hub Under Desk Cable Management Tray',
      shortName: 'Scandinavian Hub',
      summary: 'A no-drill route for desks whose edge is blocked by a frame or apron. Treat the adhesive as surface-dependent rather than universally removable.',
      fit: 'The underside is smooth, sealed, clean, and wide enough for the mounting area.',
      tradeoff: 'Adhesive performance and removal risk vary with finish, dust, heat, and load.',
      confirm: 'Surface instructions, stated load, cure time, mounting footprint, and removal guidance.',
      asin: 'B09J5HH2LR',
      position: 'pick_2_adhesive'
    })}
    ${pick({
      number: '03',
      id: 'pick-light',
      type: 'Light-color clamp tray',
      guidance: 'A visual alternative only after the desk passes the same clamp-fit checks.',
      name: 'Cinati Under Desk Cable Management Tray',
      shortName: 'Cinati',
      summary: 'A clamp-on tray option for a light-colored setup. The buying decision should still be based on edge fit and knee clearance, not color alone.',
      fit: 'You want a clamp mount and have measured both desktop thickness and underside clearance.',
      tradeoff: 'Like any edge clamp, it can conflict with drawers, aprons, or a desk flush against a wall.',
      confirm: 'Clamp opening, edge shape, knee clearance, wall clearance, and current color options.',
      asin: 'B0BPLRX32S',
      position: 'pick_3_clamp_light'
    })}
    ${pick({
      number: '04',
      id: 'pick-sleeve',
      type: 'Visible-run sleeve',
      guidance: 'This complements a tray; it does not replace one.',
      name: 'JOTO Zipper Cable Management Sleeve',
      shortName: 'JOTO',
      summary: 'A sleeve for containing the visible bundle between the desk and outlet. It complements a tray but does not support a power strip.',
      fit: 'Several cables share one route and need to remain accessible for changes.',
      tradeoff: 'It tidies a bundle but cannot remove floor-level adapters or create mounting space.',
      confirm: 'Sleeve diameter, usable length, closure style, and the number of cables it can contain.',
      asin: 'B015HWXG4M',
      position: 'pick_4_sleeve'
    })}
  </div>`;

const articles = [
  {
    slug: 'no-drill-cable-management-for-renters',
    category: 'Cable management',
    title: 'No-drill cable management for renters',
    description: 'A fit-first guide to clamp trays, adhesive routes, cable clips, and sleeves for renter-friendly desk cable management.',
    dek: 'Move power, adapters, and cable slack off the floor without assuming you can drill—or that every “no-drill” product fits every desk.',
    image: images.cables,
    alt: 'Clamp-on metal cable tray holding a power strip and cables below a wood desk',
    readTime: '9 min read',
    sections: [
      { id: 'short-answer', title: 'The short answer', html: `<p>For most renters, the cleanest sequence is: place the power strip in a tray, park daily-use cables at the edge, contain the single visible run to the outlet, and keep a small service loop anywhere the desk or monitor moves. A clamp-on tray is the least surface-dependent option when the desk has a usable edge. Adhesive is the fallback when that edge is blocked, but only after checking the underside finish and accepting the removal risk.</p><div class="callout"><h3>Best starting point</h3><p>Choose by attachment geometry first. A beautiful tray that cannot clear the desk apron is not a solution. Measure the edge, underside obstruction, knee space, and route to the outlet before comparing colors or capacity.</p></div>` },
      { id: 'measure', title: 'Measure four things before buying', html: `<ol><li><strong>Desktop thickness:</strong> measure the full thickness where the clamp would sit, including any beveled edge.</li><li><strong>Clamp depth:</strong> check how far the clamp must reach under the desk before it finds a flat surface.</li><li><strong>Underside clearance:</strong> note aprons, crossbars, drawers, controls, and standing-desk hardware.</li><li><strong>Knee and wall clearance:</strong> locate the tray where it will not hit your legs or prevent the desk from moving close to the wall.</li></ol><p>Write the numbers down and compare them with the current product listing. Listing dimensions can change, so we deliberately do not reproduce them as permanent facts here. If your edge is irregular, start with our <a href="/articles/measure-desk-for-clamp-accessories.html">clamp measurement guide</a>.</p>` },
      { id: 'picks', title: 'Four useful installation styles to compare', html: `<p>Most desks need one primary tray, not every item below. We checked that each linked US listing matched its stated installation role on ${displayDate(datesFor('/articles/no-drill-cable-management-for-renters.html').modified)}; confirm the current dimensions, included hardware, and return terms on Amazon before ordering.</p>${pickChooser}${corePicks}<p class="article-disclosure"><strong>Affiliate note:</strong> These are paid links. As an Amazon Associate, we earn from qualifying purchases. We do not show copied prices or ratings because they can change.</p>` },
      { id: 'install', title: 'Install in the right order', html: `<ol><li><strong>Unplug and untangle.</strong> Photograph the existing connections, then disconnect only what you can identify.</li><li><strong>Place the power strip.</strong> Keep its switch reachable and its ventilation unobstructed. Do not daisy-chain power strips.</li><li><strong>Route from fixed to moving.</strong> Start at the outlet and leave controlled slack at the desk, monitor, and laptop dock.</li><li><strong>Separate parking from carrying.</strong> Small clips park charging leads; a tray carries adapters and the strip; a sleeve contains the visible drop.</li><li><strong>Test every movement.</strong> Raise a standing desk, rotate a monitor arm, pull the chair in, and make sure nothing becomes taut.</li></ol><p>Do not cinch signal or power cables so tightly that connectors bear the strain. Reopenable hook-and-loop ties make later changes much easier than permanent zip ties.</p>` },
      { id: 'tradeoffs', title: 'Clamp, adhesive, clips, or sleeve?', html: `<table><thead><tr><th>Method</th><th>Choose it when</th><th>Watch for</th></tr></thead><tbody><tr><td>Clamp-on tray</td><td>Flat edge, clear underside, heavier adapters</td><td>Clamp visibility, edge marks, wall clearance</td></tr><tr><td>Adhesive tray/channel</td><td>Blocked edge, smooth sealed underside</td><td>Finish damage, heat, dust, load limits</td></tr><tr><td>Cable clips</td><td>Daily charging leads need a parking spot</td><td>Cable diameter and adhesive footprint</td></tr><tr><td>Zipper sleeve</td><td>One visible bundle runs to the outlet</td><td>No support for power strips or bricks</td></tr></tbody></table><p>A hybrid usually works better than asking one accessory to do everything: tray for weight, clips for reach, sleeve for the final visible run.</p>` },
      { id: 'renter-safety', title: 'A renter-friendly removal plan', html: `<p>Keep packaging and mounting instructions until the system has survived a week of normal use. For adhesive parts, follow the manufacturer’s removal directions, work slowly, and stop if the desk finish begins to lift. Heat or solvents can damage laminate and veneer, so do not improvise a removal method on an unknown surface.</p><p>Photograph the underside before installation and after removal. If the desk belongs to a landlord or dorm, a clamp with protective pads is often easier to inspect and reverse than a high-bond adhesive mount—but only if the edge is structurally suitable.</p>` },
      { id: 'faq', title: 'Common questions', html: `<h3>Can a tray hold a power brick?</h3><p>Possibly, but capacity is product-specific. Compare the current load guidance with the combined weight of the strip, bricks, and cable. Leave ventilation around warm adapters.</p><h3>Will a clamp damage the desk?</h3><p>Padded clamps reduce direct contact, but soft wood, veneer, hollow-core tops, and thin glass need extra caution. Follow the desk maker’s mounting guidance.</p><h3>Should cables be completely hidden?</h3><p>No. Reachability, ventilation, and safe movement matter more than invisibility. A tidy system should still be easy to inspect and change.</p>` }
    ]
  },
  {
    slug: 'clamp-vs-adhesive-cable-management',
    category: 'Comparison',
    title: 'Clamp-on vs. adhesive cable management',
    description: 'Compare clamp-on and adhesive cable management by desk geometry, surface, load, removal, and access.',
    dek: 'The right answer depends less on how the tray looks and more on what the desk gives it to hold onto.',
    image: images.comparison,
    alt: 'Clamp-on tray and adhesive cable channel installed beneath a light wood desk',
    readTime: '7 min read',
    sections: [
      { id: 'decision', title: 'The decision in one minute', html: `<p>Choose a <strong>clamp</strong> when the desk has a flat exposed edge, the underside is clear, and you want a mount that can be removed without adhesive residue. Choose <strong>adhesive</strong> when an apron or frame blocks that edge but the underside is smooth, sealed, clean, and suitable for the product’s stated load. If neither condition is true, use lightweight clips or a floor-to-desk sleeve and avoid forcing a tray into the setup.</p>` },
      { id: 'comparison', title: 'Side-by-side trade-offs', html: `<table><thead><tr><th>Question</th><th>Clamp-on</th><th>Adhesive</th></tr></thead><tbody><tr><td>Needs a free desk edge?</td><td>Yes</td><td>No</td></tr><tr><td>Depends on surface chemistry?</td><td>Less</td><td>Strongly</td></tr><tr><td>Usually reversible?</td><td>More easily</td><td>Depends on finish and adhesive</td></tr><tr><td>Visible hardware?</td><td>At the edge</td><td>Mostly below</td></tr><tr><td>Best use</td><td>Tray, power strip, adapters</td><td>Light tray or channels on suitable surfaces</td></tr></tbody></table>` },
      { id: 'clamp', title: 'When a clamp is the better fit', html: `<p>A clamp converts the desk edge into a mechanical anchor. That makes performance easier to reason about than adhesive: if the opening fits, the contact surfaces are flat, and the desk material can tolerate the pressure, the mount has a defined grip point.</p><p>Clamps fail at geometry. A beveled edge can make the pad sit crooked. A deep apron can prevent the lower jaw from reaching the desktop. A drawer or control box may occupy the same space. Also check whether the clamp prevents the desk from sitting flush to a wall.</p>` },
      { id: 'adhesive', title: 'When adhesive is the better fit', html: `<p>Adhesive mounting avoids the edge and can produce a visually quiet result. It works best when the mounting area is smooth, sealed, degreased according to the product instructions, and left undisturbed for the recommended cure time.</p><p>The uncertainty is the desk surface. Dusty powder coat, textured laminate, unfinished wood, fabric, and heat near power adapters can all change performance. “No drill” does not automatically mean “no damage”; removal can lift weak finishes or leave residue.</p>` },
      { id: 'hybrid', title: 'The practical hybrid', html: `<p>Use the tray only for what needs support. A clamp or suitable adhesive tray can carry the power strip, reusable ties can control slack, small clips can park charging ends, and a sleeve can contain the one run to the outlet. This spreads the job across accessories designed for different loads.</p><div class="callout"><h3>Avoid the capacity trap</h3><p>A large tray encourages more hardware. Count the actual adapters first, keep the power switch accessible, and leave airflow around warm bricks.</p></div>` },
      { id: 'choose', title: 'Choose with this order', html: `<ol><li>Inspect and measure the edge and underside.</li><li>Identify the heaviest item the system must support.</li><li>Decide how important residue-free removal is.</li><li>Check knee, wall, drawer, and standing-desk clearance.</li><li>Compare current manufacturer dimensions and instructions.</li></ol><p>If a clamp fits, see the <a href="/articles/no-drill-cable-management-for-renters.html">renter cable guide and current examples</a>. If you are unsure, use the <a href="/articles/measure-desk-for-clamp-accessories.html">two-minute measurement process</a> first.</p>` }
    ]
  },
  {
    slug: 'cable-management-for-standing-desks',
    category: 'Cable management',
    title: 'Cable management for standing desks that actually move',
    description: 'Route power and signal cables for a standing desk with controlled slack, fixed and moving zones, and a full-height movement test.',
    dek: 'A standing desk cable plan has to look tidy at sitting height and remain safe at full height.',
    image: images.standing,
    alt: 'Standing desk with a mounted power strip, controlled service loop, and vertical cable sleeve',
    readTime: '8 min read',
    sections: [
      { id: 'motion-first', title: 'Design around movement first', html: `<p>The common mistake is bundling cables while the desk is sitting, then discovering that the bundle becomes taut when the desk rises. Set the desk to its highest working position before finalizing any route. Every cable that crosses from the moving desktop to the fixed wall or floor needs enough controlled slack for that full travel.</p><p>Controlled slack means a deliberate loop with a clear path—not a pile that can catch a foot or chair caster.</p>` },
      { id: 'zones', title: 'Divide the system into three zones', html: `<ol><li><strong>Moving zone:</strong> monitor, laptop, dock, lamp, and everything mounted to the desktop.</li><li><strong>Transition zone:</strong> the vertical bundle that expands and contracts as the desk moves.</li><li><strong>Fixed zone:</strong> wall outlet, surge protector location if floor-mounted, network connection, and anything that does not rise.</li></ol><p>Whenever possible, mount the power strip to the moving desk so individual device cords stay in the moving zone. Then only one power lead needs to cross the transition zone.</p>` },
      { id: 'service-loops', title: 'Leave service loops where movement happens', html: `<p>A service loop is a small reserve of cable near a moving joint or connector. Leave one near a monitor arm pivot, behind a laptop dock, and before the main vertical drop. The loop should be large enough for movement without pulling, but contained enough that it cannot enter the lift mechanism.</p><p>Use reusable ties loosely. Tight ties can bend cables sharply and transfer force directly to ports.</p>` },
      { id: 'route', title: 'A reliable routing sequence', html: `<ol><li>Move the desk to full height and place all devices in their working positions.</li><li>Mount or place the power strip where its switch remains reachable.</li><li>Connect the shortest stable runs on the desktop first.</li><li>Collect the remaining power lead and any unavoidable fixed connections into one transition path.</li><li>Anchor the top of that path to the moving desk and guide the bottom toward the fixed outlet.</li><li>Lower the desk slowly while watching every loop, connector, and snag point.</li></ol>` },
      { id: 'test', title: 'Run a five-part movement test', html: `<ul><li>Raise and lower the desk through its complete range twice.</li><li>Rotate and extend the monitor arm.</li><li>Move the laptop between docked and open positions.</li><li>Pull the chair fully in and roll it around the cable drop.</li><li>Confirm that the power switch and disconnect points stay reachable.</li></ul><p>If any cable becomes taut, catches on hardware, rubs against a sharp edge, or enters the leg mechanism, stop and reroute it.</p>` },
      { id: 'failures', title: 'Common failure modes', html: `<p><strong>Too little slack:</strong> connectors take the load at full height. <strong>Too much loose slack:</strong> the bundle catches feet or chair casters at sitting height. <strong>Fixed-wall clips:</strong> they prevent the moving cable from traveling. <strong>Tray in the lift path:</strong> it collides with a crossbar or control box. <strong>Hidden power switch:</strong> the desk must be dismantled to cut power.</p><p>For the visible transition bundle, a reopenable sleeve can be useful. See our <a href="/articles/no-drill-cable-management-for-renters.html#picks">examples and fit notes</a>.</p>` }
    ]
  },
  {
    slug: 'small-desk-cable-management-checklist',
    category: 'Cable management',
    title: 'A small-desk cable management checklist',
    description: 'A practical checklist for sorting, routing, parking, labeling, and testing cables on a compact desk.',
    dek: 'Tidy the system by function: support the weight, control the slack, and keep everyday cables within reach.',
    image: images.checklist,
    alt: 'Compact desk with cable clips, reusable ties, a mounted power strip, and a cable sleeve',
    readTime: '6 min read',
    sections: [
      { id: 'reset', title: 'Start with a reset, not more accessories', html: `<p>Take a photo of the working setup, shut devices down, and disconnect only the cables you can identify. Remove abandoned chargers, duplicate adapters, and cables that no longer reach a device. A smaller system is easier to route and easier to troubleshoot.</p><div class="callout"><h3>Keep a “not sure” bag</h3><p>Do not throw away an unidentified cable during the cleanup. Label it with the date and store it away from the desk. If nothing needs it after a month, decide whether to recycle it properly.</p></div>` },
      { id: 'inventory', title: 'Inventory by job', html: `<ul><li><strong>Power:</strong> wall lead, power strip, laptop brick, display power, lamp.</li><li><strong>Signal:</strong> display, USB, Ethernet, audio.</li><li><strong>Daily access:</strong> phone, headphones, camera, removable drives.</li><li><strong>Movement:</strong> monitor arm loops, standing desk transition, pull-out keyboard tray.</li></ul><p>This shows which cables need support, which need slack, and which need a reachable parking point.</p>` },
      { id: 'support', title: 'Support weight before hiding lines', html: `<p>Place the power strip and bulky adapters first. They are the heaviest components and define the route. A suitable tray keeps them off the floor; a well-ventilated box on the floor can work when the desk cannot accept a mount. Never suspend a heavy power brick from its connector.</p>` },
      { id: 'route', title: 'Route from source to device', html: `<ol><li>Follow the wall lead from the outlet to the desk.</li><li>Choose one entry point at the rear or side.</li><li>Run fixed device cables through the least visible stable path.</li><li>Leave a service loop before any moving screen or dock.</li><li>Park daily charging ends at an accessible edge.</li><li>Contain the remaining visible drop with a sleeve or reusable ties.</li></ol>` },
      { id: 'label', title: 'Label the part you would unplug', html: `<p>Put a small label near the power-strip end of each similar adapter. “Monitor,” “dock,” and “lamp” are more useful than labeling the visible end. If a cable has an unusual rating or belongs to a specific device, keep that information with it.</p>` },
      { id: 'test', title: 'Final checklist', html: `<ul><li>No connector carries the weight of a brick or bundle.</li><li>No cable is sharply bent at a port.</li><li>Warm adapters have airflow.</li><li>The power switch is reachable.</li><li>The chair, drawers, monitor arm, and desk can move freely.</li><li>Daily charging cables reach without pulling.</li><li>The route can be reopened without cutting permanent ties.</li></ul><p>Need a tray? Start with the <a href="/articles/no-drill-cable-management-for-renters.html">fit-first renter guide</a>, not a product list.</p>` }
    ]
  },
  {
    slug: 'measure-desk-for-clamp-accessories',
    category: 'Fit guide',
    title: 'How to measure a desk for clamp-on accessories',
    description: 'Measure desktop thickness, clamp depth, underside obstructions, rear clearance, and contact material before ordering a clamp accessory.',
    dek: 'Two minutes with a ruler can rule out the wrong cable tray, lamp, microphone arm, or monitor mount.',
    image: images.monitor,
    alt: 'A monitor arm clamp attached to the edge of a small wood desk',
    readTime: '7 min read',
    sections: [
      { id: 'tools', title: 'What you need', html: `<p>Use a ruler or tape measure, a flashlight, your phone camera, and a note. A small piece of card can help reveal whether the underside is flat enough for the lower clamp pad. Measure at the exact location where the accessory will attach; desk geometry often changes near corners and legs.</p>` },
      { id: 'thickness', title: '1. Measure desktop thickness', html: `<p>Measure from the top surface to the underside at the intended clamp point. Include any lip, bevel, or added desk mat only if it will sit inside the clamp. Compare this measurement with the current opening range stated by the accessory maker.</p><p>A clamp that barely opens wide enough leaves no useful adjustment. Give yourself margin for the protective pads and for tightening without forcing the hardware.</p>` },
      { id: 'depth', title: '2. Measure usable clamp depth', html: `<p>Look beneath the edge. The lower jaw must travel inward far enough to contact a flat, structurally suitable area. Measure from the outer edge to the first obstruction: apron, support rail, drawer, control box, or standing-desk frame.</p><p>A desk can be thin enough but still incompatible because the jaw cannot reach past a decorative lip.</p>` },
      { id: 'clearance', title: '3. Check below, behind, and above', html: `<ul><li><strong>Below:</strong> Will the screw knob, tray, or lower plate hit your knee or a drawer?</li><li><strong>Behind:</strong> Does the mount need space between the desk and wall?</li><li><strong>Above:</strong> Will the upper plate conflict with a desk mat, keyboard, or cable grommet?</li></ul><p>For monitor arms, include the rear swing of the arm. For lamps and microphone arms, include the direction of the first joint.</p>` },
      { id: 'material', title: '4. Identify the contact material', html: `<p>Solid wood, laminate over particleboard, bamboo panels, hollow-core tops, veneer, and glass behave differently under concentrated pressure. Follow the desk maker’s guidance. Glass and visibly damaged surfaces need particular caution; do not assume that an included pad makes every material safe.</p><p>A reinforcement plate can spread pressure on some compatible desks, but it does not repair a weak core or make an unsupported edge structural.</p>` },
      { id: 'record', title: 'Use a simple fit note', html: `<div class="callout"><h3>Your measurement card</h3><ul><li>Attachment location: ______</li><li>Desktop thickness: ______</li><li>Flat underside depth: ______</li><li>Nearest obstruction: ______</li><li>Rear wall gap: ______</li><li>Desk material: ______</li><li>Accessory load/weight: ______</li></ul></div><p>Keep this note while shopping and compare it with the current listing and manual. Do not rely on a product photo to estimate scale.</p>` },
      { id: 'next', title: 'Match the measurement to the job', html: `<p>For cable weight, continue to the <a href="/articles/no-drill-cable-management-for-renters.html">no-drill cable guide</a>. For a screen, use the <a href="/articles/monitor-arm-compatibility-small-desk.html">monitor-arm compatibility checklist</a>. If there is no viable clamp location, compare <a href="/articles/clamp-vs-adhesive-cable-management.html">adhesive and lightweight alternatives</a>.</p>` }
    ]
  },
  {
    slug: 'vertical-storage-for-small-desks',
    category: 'Small-space layout',
    title: 'Vertical storage that frees up a small desk',
    description: 'Use walls, pegboards, shelves, risers, and desk edges to create vertical storage without crowding a compact work surface.',
    dek: 'The goal is not to display more things. It is to move low-frequency items out of your primary work zone.',
    image: images.storage,
    alt: 'Pegboard and compact shelves beside a small home-office desk',
    readTime: '7 min read',
    sections: [
      { id: 'audit', title: 'Audit the surface before adding storage', html: `<p>Clear the desk and return only what you touch during a normal work block: display, keyboard, pointing device, notebook, and one active drink or tool. Everything else must earn a nearby location based on frequency.</p><ul><li><strong>Every few minutes:</strong> keep within arm’s reach.</li><li><strong>A few times a day:</strong> place at the edge or one vertical move away.</li><li><strong>Weekly:</strong> move to a shelf, drawer, or closed bin.</li></ul>` },
      { id: 'zones', title: 'Use four vertical zones', html: `<ol><li><strong>Above the monitor:</strong> lightweight, low-frequency objects only; avoid visual clutter in the direct sightline.</li><li><strong>Beside the monitor:</strong> pegboard tools, headphones, and small trays.</li><li><strong>Under the monitor:</strong> a riser can create a shallow parking bay for a keyboard or notebook.</li><li><strong>Desk side and underside:</strong> hooks, headphone holders, and cable support—after checking knee clearance.</li></ol>` },
      { id: 'pegboard', title: 'Pegboard or wall rail', html: `<p>A pegboard is useful when the arrangement changes frequently. Keep heavy items near secure mounting points and follow the wall and hardware guidance. In a rental, a freestanding or desk-clamped panel may be more reversible than wall anchors, but it consumes edge depth and requires a compatible clamp location.</p><p>Group by task instead of object type: video-call tools together, writing tools together, and charging accessories together. That reduces reaching and makes the board easier to reset.</p>` },
      { id: 'riser', title: 'Monitor riser or shelf', html: `<p>A riser trades some vertical volume for a second shallow level. It works best when the space below has a defined use such as parking the keyboard at the end of the day. Avoid turning the shelf into a permanent stack that blocks airflow or pushes the monitor too high.</p><p>If a riser exists only to correct monitor height, a compatible monitor arm may recover more surface area. Check the <a href="/articles/monitor-arm-compatibility-small-desk.html">arm fit guide</a> before assuming it will clamp to the desk.</p>` },
      { id: 'safety', title: 'Keep the visual win safe', html: `<ul><li>Do not put heavy objects above your head or an expensive display without appropriate anchors.</li><li>Keep vents and warm power adapters unobstructed.</li><li>Do not allow hooks or shelves to enter a standing desk’s movement path.</li><li>Check that wall-mounted storage does not violate rental terms.</li><li>Leave enough clear depth for wrists and forearms in front of the keyboard.</li></ul>` },
      { id: 'reset', title: 'Build a 60-second reset', html: `<p>Assign one home to each daily object and leave a small open landing area. At the end of work, park the keyboard, hang the headphones, return the notebook, and connect the charging lead. A layout that takes longer than a minute to reset will gradually become surface clutter again.</p><p>For the overall work zone, use our <a href="/articles/small-desk-layout-guide.html">small-desk layout sequence</a>.</p>` }
    ]
  },
  {
    slug: 'monitor-arm-compatibility-small-desk',
    category: 'Monitor position',
    title: 'Will a monitor arm fit your small desk?',
    description: 'Check VESA pattern, monitor weight, desk edge geometry, wall clearance, and arm movement before buying a monitor arm.',
    dek: 'A monitor arm can recover valuable depth—but only when the screen, mount, desk, and movement envelope all agree.',
    image: images.monitor,
    alt: 'Single monitor arm clamped to a compact wood desk',
    readTime: '8 min read',
    sections: [
      { id: 'five-checks', title: 'The five compatibility checks', html: `<ol><li><strong>Monitor interface:</strong> confirm the screen’s VESA mounting pattern or approved adapter.</li><li><strong>Supported weight:</strong> compare the monitor weight without its stand with the arm’s stated range.</li><li><strong>Desk attachment:</strong> measure thickness, clamp depth, and underside obstructions.</li><li><strong>Movement envelope:</strong> allow room behind and beside the screen for the arm to fold and rotate.</li><li><strong>Working position:</strong> confirm the arm can place the screen where you need it, not merely hold it.</li></ol>` },
      { id: 'vesa', title: 'Confirm the monitor, not just the screen size', html: `<p>Screen size alone does not establish compatibility. Find the exact monitor model and check its manual or manufacturer specification for VESA pattern and weight without the factory stand. Curved and ultrawide displays can place their center of mass farther from the arm pivot, so use the arm maker’s specific guidance.</p>` },
      { id: 'desk', title: 'Inspect the desk attachment point', html: `<p>Most small desks fail the geometry test rather than the thickness test. An apron, rear cable lip, drawer, frame, or wall can block the clamp. Measure at the exact intended position using the <a href="/articles/measure-desk-for-clamp-accessories.html">clamp fit note</a>.</p><p>Check the desk material and condition. Do not clamp to cracked, swollen, hollow, or unsupported material. A grommet mount requires an existing suitable hole or permission to create one.</p>` },
      { id: 'depth', title: 'Model the movement envelope', html: `<p>Push the current monitor to the desired final position and imagine the arm behind it. Some arms need significant rear space when folded; on a desk against a wall, that can push the screen forward and erase the depth you hoped to gain.</p><p>Use cardboard or painter’s tape to mark the desired screen center and rear clearance. Include portrait rotation, webcam space, and any lamp or shelf above the monitor.</p>` },
      { id: 'position', title: 'Set position after fit', html: `<p>Start with the top portion of the visible screen around eye level, then adjust for your posture, lenses, and viewing distance. The keyboard and pointing device should remain close enough that your shoulders can relax. An arm is useful because it separates screen support from desk depth; it is not a reason to reach forward all day.</p>` },
      { id: 'fallbacks', title: 'When an arm is the wrong tool', html: `<ul><li>A shallow riser may work when the edge cannot accept a clamp.</li><li>A wall mount can free the desk when wall modification is allowed and correctly anchored.</li><li>The factory stand may be safest on glass, hollow-core, or uncertain surfaces.</li><li>Moving the desk slightly away from the wall can improve both screen position and cable routing without buying hardware.</li></ul>` },
      { id: 'checklist', title: 'Pre-order checklist', html: `<ul><li>Exact monitor model and stand-free weight recorded.</li><li>VESA pattern confirmed from a primary specification.</li><li>Arm weight range and pattern match.</li><li>Desk thickness and flat clamp depth measured.</li><li>Desk material is suitable and undamaged.</li><li>Rear, side, and vertical movement space checked.</li><li>Cable service loops planned for full arm movement.</li></ul>` }
    ]
  },
  {
    slug: 'compact-desk-lighting-guide',
    category: 'Desk lighting',
    title: 'Task lighting without losing a desk corner',
    description: 'Compare clamp lamps, monitor lights, and wall-directed lighting for a compact desk while controlling glare and preserving surface area.',
    dek: 'Light the work, not the screen—and make the mount earn the space it occupies.',
    image: images.lighting,
    alt: 'Compact home desk lit by a clamp-on task lamp',
    readTime: '7 min read',
    sections: [
      { id: 'layers', title: 'Start with the job the light must do', html: `<p>A video call, handwritten notes, keyboard work, and late-night reading do not need the same light. Define the primary task first. A focused lamp improves contrast on paper; broad indirect light softens the room; a monitor-mounted light can illuminate the keyboard area without occupying a corner.</p><p>Most compact setups work better with two modest layers than one harsh source: gentle ambient light plus controllable task light.</p>` },
      { id: 'clamp-lamp', title: 'Clamp lamp: flexible but geometry-dependent', html: `<p>A clamp lamp saves surface area and can aim at paper or a wall. It needs a flat edge, underside clearance, and enough space for the arm to move without hitting the monitor. Place it on the side opposite your writing hand to reduce hand shadows.</p><p>Before ordering, use the same <a href="/articles/measure-desk-for-clamp-accessories.html">edge measurement</a> required for any clamp accessory.</p>` },
      { id: 'monitor-light', title: 'Monitor light: compact but screen-specific', html: `<p>A monitor light occupies no desk corner and can direct light downward. Check whether its mount suits the monitor’s top edge, thickness, curvature, webcam, and rear shape. The light should not shine directly into your eyes or create a bright reflection in the screen.</p><p>Laptop screens and unusually curved or thick displays may need a different solution than a standard monitor light.</p>` },
      { id: 'bounce', title: 'Wall-directed light: the quiet fallback', html: `<p>Pointing a small lamp toward a light-colored wall can create soft ambient illumination with less screen glare. This is useful when the desk edge cannot accept a clamp. It is less efficient than direct task lighting and depends on wall color and distance, but it can make a dark corner more comfortable.</p>` },
      { id: 'glare', title: 'Run a glare test', html: `<ol><li>Display a dark screen.</li><li>Sit in your normal position.</li><li>Move the lamp through its intended angles.</li><li>Check reflections from the screen, glasses, glossy desk, and framed art.</li><li>Repeat during daytime if a window is nearby.</li></ol><p>Move the source to the side, raise it, or bounce it away from the screen until the work surface is lit without a visible hotspot.</p>` },
      { id: 'controls', title: 'Prioritize useful controls', html: `<p>Brightness adjustment usually matters more than a long feature list. A warm-to-neutral range can help the same light serve evening and daytime use, but color labels differ across products. Controls should be reachable without destabilizing the monitor or leaning behind the desk.</p>` },
      { id: 'choose', title: 'Choose by constraint', html: `<table><thead><tr><th>Constraint</th><th>Start with</th></tr></thead><tbody><tr><td>No spare desk corner</td><td>Clamp lamp or compatible monitor light</td></tr><tr><td>Blocked desk edge</td><td>Monitor light or wall-directed lamp</td></tr><tr><td>Frequent handwriting</td><td>Adjustable side task lamp</td></tr><tr><td>Screen glare</td><td>Indirect wall light plus careful task-light angle</td></tr></tbody></table>` }
    ]
  },
  {
    slug: 'small-desk-layout-guide',
    category: 'Small-space layout',
    title: 'A small-desk layout that protects working space',
    description: 'Plan a compact desk around reach, depth, screen position, charging, and storage instead of filling every available surface.',
    dek: 'Build the layout from the work zone outward: input space first, screen second, storage last.',
    image: images.layout,
    alt: 'Compact desk with open work surface, monitor arm, pegboard, and organized cables',
    readTime: '8 min read',
    sections: [
      { id: 'clear', title: 'Define the clear work rectangle', html: `<p>Before placing accessories, reserve the area your hands and current task need. For computer work, that means enough depth for the keyboard and pointing device without crowding your forearms. For mixed work, reserve a notebook or document zone as well.</p><p>Mark the rectangle with removable tape, then keep storage, speakers, chargers, and décor outside it. The exact dimensions depend on your body and tools; the principle is to protect one usable surface instead of scattering small gaps.</p>` },
      { id: 'anchor', title: 'Choose one anchor', html: `<p>The monitor is usually the anchor because it determines sightline and depth. Place it first, then center the keyboard to the screen rather than to the furniture. If you primarily use a laptop, decide whether it is the main screen or a secondary screen before adding a stand.</p><p>A riser, monitor arm, or laptop stand should solve a specific height or depth problem. Each one also creates cable and mounting constraints.</p>` },
      { id: 'reach', title: 'Arrange by reach frequency', html: `<ul><li><strong>Primary reach:</strong> keyboard, pointing device, active notebook, daily charging lead.</li><li><strong>Secondary reach:</strong> headphones, pen cup, dock controls, frequently used drive.</li><li><strong>Storage reach:</strong> spare cables, reference books, camera gear, archived notes.</li></ul><p>Items in the wrong reach zone create repeated clutter. Move weekly items vertically or away from the desk.</p>` },
      { id: 'depth', title: 'Recover depth before width', html: `<p>On a shallow desk, screen stands and cable loops consume the same front-to-back dimension your arms need. Route cables behind the screen, move the power strip below the surface, and consider a compatible arm only after checking rear clearance. A keyboard that can park under a shallow riser can also restore a writing zone after computer work.</p>` },
      { id: 'charging', title: 'Give charging a boundary', html: `<p>Choose one charging side and park the cable ends there. Avoid running a phone cable diagonally across the work rectangle. A small tray or vertical pocket can hold the device while it charges, but keep heat-producing devices ventilated.</p>` },
      { id: 'recipes', title: 'Three useful layout recipes', html: `<h3>Laptop-first</h3><p>Laptop centered on a stable stand, external keyboard below, pointing device beside it, dock and adapters off the surface.</p><h3>Single-monitor focus</h3><p>Monitor centered, laptop closed or placed vertically only if the device maker supports the operating setup, one clear note zone, and daily charger parked at the side.</p><h3>Mixed work</h3><p>Monitor shifted slightly to preserve a paper zone, keyboard easy to move or park, task light placed opposite the writing hand.</p>` },
      { id: 'reset', title: 'Finish with a reset test', html: `<p>Work normally for one day, then try to reset the desk in 60 seconds. Anything without a home will remain on the surface. Add storage only for those specific leftovers, using the <a href="/articles/vertical-storage-for-small-desks.html">vertical storage hierarchy</a> before increasing the desk footprint.</p>` }
    ]
  },
  {
    slug: 'renter-friendly-desk-upgrades',
    category: 'Renter guide',
    title: 'Renter-friendly desk upgrades worth doing first',
    description: 'Prioritize reversible desk upgrades for cables, lighting, layout, storage, and screen position without assuming wall or desk modifications.',
    dek: 'Fix the friction you feel every day, starting with changes that are easy to inspect, reverse, and move.',
    image: images.layout,
    alt: 'Bright renter-friendly compact desk with monitor, lamp, and pegboard storage',
    readTime: '8 min read',
    sections: [
      { id: 'order', title: 'Use this upgrade order', html: `<ol><li>Remove unused items and protect a clear work area.</li><li>Move power and cable weight off the floor safely.</li><li>Correct the screen and input position.</li><li>Add task light without consuming the last corner.</li><li>Move low-frequency storage vertically.</li><li>Add décor only after the daily reset works.</li></ol><p>This order solves function before appearance and prevents buying organizers for items you do not need.</p>` },
      { id: 'cables', title: '1. Reversible cable control', html: `<p>If the desk has a suitable edge, a padded clamp tray can be easier to remove and inspect than adhesive. If the edge is blocked, lightweight clips or a sleeve may create enough improvement without mounting a loaded tray. Use the <a href="/articles/no-drill-cable-management-for-renters.html">no-drill system guide</a> to match the installation to the desk.</p>` },
      { id: 'position', title: '2. Screen and input position', html: `<p>Start with free adjustments: move the desk, change chair height, reposition the monitor stand, and center the keyboard to the working screen. A riser or arm comes after compatibility. For an arm, record the monitor model, weight, VESA pattern, desk material, and clamp geometry.</p>` },
      { id: 'lighting', title: '3. Light that does not occupy the surface', html: `<p>A clamp lamp, compatible monitor light, or small wall-directed lamp can improve a dark corner without a large base. The reversible choice depends on the desk edge and screen. Test glare from the seated position before committing to cable routes or adhesive controls.</p>` },
      { id: 'storage', title: '4. Vertical and movable storage', html: `<p>Prefer freestanding shelves, mobile carts, and desk-clamped panels when wall anchors are not allowed. Their footprint and stability still matter: heavy objects stay low, and nothing enters a standing desk’s travel path. Ask the landlord before using wall anchors or high-bond adhesives.</p>` },
      { id: 'surfaces', title: 'Treat every surface as unknown', html: `<p>Paint, veneer, laminate, powder coat, and unfinished wood respond differently to adhesive, pressure, heat, and cleaning products. Follow the accessory and furniture makers’ instructions. Test only where an inconspicuous test is allowed, and stop if the finish changes.</p><div class="callout"><h3>“No drill” is not the same as “damage-free”</h3><p>Clamps can mark soft material; adhesive can lift a finish; freestanding storage can tip. Reversibility comes from compatibility and careful removal, not the marketing label.</p></div>` },
      { id: 'budget', title: 'Spend on constraints, not sets', html: `<p>One correctly fitted mount or light is usually more useful than a matching accessory bundle. Measure first, buy one change, use it for a week, and only then decide what still causes friction. This also makes returns and troubleshooting simpler.</p>` },
      { id: 'move', title: 'Build for the next move', html: `<p>Keep original hardware, instructions, and a photo of each installation. Use reusable ties, avoid cutting cables to exact furniture dimensions, and label small parts. A renter-friendly setup should pack into a few known pieces and work on more than one desk.</p>` }
    ]
  },
  {
    slug: 'how-to-route-desk-cables',
    category: 'Cable management',
    title: 'How to route desk cables from outlet to device',
    description: 'Plan one inspectable cable route from the wall outlet to the power strip, desk, monitor, and daily-use devices.',
    dek: 'A good route is short, supported, movable where necessary, and easy to reopen when one device changes.',
    image: images.routing,
    alt: 'Visible cable route from a wall outlet to a mounted power strip and desk devices',
    readTime: '7 min read',
    sections: [
      { id: 'map', title: 'Draw the route before attaching anything', html: `<p>Mark the wall outlet, desk entry point, power-strip location, fixed devices, and moving devices. The route should avoid doorways, heat sources, sharp edges, chair casters, and the travel path of drawers or lift columns.</p><p>Whenever possible, create one main transition from the fixed room to the desk, then branch near the devices.</p>` },
      { id: 'power', title: 'Place power where it can be reached', html: `<p>The power strip switch and plug should remain accessible. Do not bury the strip under paper or inside an unventilated enclosure, and do not daisy-chain power strips. Support heavy adapters so their weight is not carried by a plug or device port.</p>` },
      { id: 'signal', title: 'Keep the route understandable', html: `<p>Power and signal cables can share a general route, but do not crush them into an over-tight bundle. Keep delicate connectors and excess cable from resting on warm adapters. Label similar leads at the power-strip or dock end so one device can be isolated without dismantling everything.</p>` },
      { id: 'movement', title: 'Add slack only where it is useful', html: `<p>Leave a controlled service loop at monitor-arm pivots, laptop docks, and the transition to a standing desk. Fixed devices do not need large hidden coils. Use reusable ties so each loop can be resized.</p>` },
      { id: 'attach', title: 'Attach from heavy to light', html: `<ol><li>Support the power strip and adapters.</li><li>Guide the main run from outlet to desk.</li><li>Secure fixed device cables.</li><li>Add service loops for moving parts.</li><li>Park daily charging ends with small clips.</li><li>Contain the final visible bundle if needed.</li></ol><p>This sequence prevents small adhesive clips from carrying weight they were never meant to support.</p>` },
      { id: 'test', title: 'Inspect under real use', html: `<p>Sit, stand, rotate the screen, open drawers, pull the chair in, and charge every daily device. Look for tension, rubbing, heat, and inaccessible switches. Recheck after a week because adhesives settle, ties shift, and the practical charging route may differ from the one you imagined.</p>` },
      { id: 'next', title: 'Choose the support method', html: `<p>If the route needs a power-strip tray, compare <a href="/articles/clamp-vs-adhesive-cable-management.html">clamp and adhesive attachment</a>. If the desk moves, use the <a href="/articles/cable-management-for-standing-desks.html">full-height standing-desk test</a>. For a compact fixed desk, finish with the <a href="/articles/small-desk-cable-management-checklist.html">small-desk checklist</a>.</p>` }
    ]
  }
];

const relatedGuideSlugs = Object.freeze({
  'clamp-vs-adhesive-cable-management': ['no-drill-cable-management-for-renters', 'measure-desk-for-clamp-accessories', 'how-to-route-desk-cables'],
  'measure-desk-for-clamp-accessories': ['no-drill-cable-management-for-renters', 'monitor-arm-compatibility-small-desk', 'compact-desk-lighting-guide'],
  'vertical-storage-for-small-desks': ['small-desk-layout-guide', 'renter-friendly-desk-upgrades', 'monitor-arm-compatibility-small-desk'],
  'monitor-arm-compatibility-small-desk': ['measure-desk-for-clamp-accessories', 'small-desk-layout-guide', 'vertical-storage-for-small-desks'],
  'compact-desk-lighting-guide': ['small-desk-layout-guide', 'vertical-storage-for-small-desks', 'measure-desk-for-clamp-accessories'],
  'renter-friendly-desk-upgrades': ['no-drill-cable-management-for-renters', 'vertical-storage-for-small-desks', 'small-desk-layout-guide']
});

function relatedArticles(article) {
  const categoryPeers = articles.filter((candidate) => candidate.slug !== article.slug && candidate.category === article.category).map((candidate) => candidate.slug);
  const fallbackSlugs = ['no-drill-cable-management-for-renters', 'measure-desk-for-clamp-accessories', 'small-desk-layout-guide'];
  const orderedSlugs = [...(relatedGuideSlugs[article.slug] || []), ...categoryPeers, ...fallbackSlugs, ...articles.map((candidate) => candidate.slug)];
  const uniqueSlugs = [...new Set(orderedSlugs)].filter((slug) => slug !== article.slug);
  return uniqueSlugs.map((slug) => articles.find((candidate) => candidate.slug === slug)).filter(Boolean).slice(0, 3);
}

function articleSchema(article) {
  const canonical = `${siteUrl}/articles/${article.slug}.html`;
  const dates = datesFor(`/articles/${article.slug}.html`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: article.title,
        description: article.description,
        image: `${siteUrl}${article.image}`,
        datePublished: dates.published,
        dateModified: dates.modified,
        inLanguage: 'en-US',
        author: { '@type': 'Organization', name: 'Best Desk Setup Editorial', url: `${siteUrl}/about.html` },
        publisher: {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Best Desk Setup',
          url: `${siteUrl}/`,
          logo: { '@type': 'ImageObject', url: `${siteUrl}/apple-touch-icon.png`, width: 180, height: 180 }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guides.html` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
        ]
      }
    ]
  };
}

function articlePage(article) {
  const canonical = `${siteUrl}/articles/${article.slug}.html`;
  const toc = article.sections.map((section) => `<a href="#${section.id}">${section.title}</a>`).join('');
  const body = article.sections.map((section) => `<section id="${section.id}"><h2>${section.title}</h2>${section.html}</section>`).join('\n');
  const related = relatedArticles(article);
  const relatedHtml = related.map((item) => `<li><a href="/articles/${item.slug}.html">${item.title}</a></li>`).join('');
  return `${head({ title: `${article.title} | Best Desk Setup`, description: article.description, canonical, image: article.image, schema: articleSchema(article) })}
<body class="article-page">
${header}
  <main id="main">
    <article>
      <header class="article-header">
        <div class="article-wrap">
          <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides.html">Guides</a><span>/</span><span>${article.category}</span></nav>
          <h1>${article.title}</h1>
          <p class="article-dek">${article.dek}</p>
          <div class="article-meta"><span>By Best Desk Setup Editorial</span><span>Reviewed ${displayDate(datesFor(`/articles/${article.slug}.html`).modified)}</span><span>${article.readTime}</span></div>
          <p class="article-disclosure"><strong>Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases. Product links are clearly marked; our fit guidance is independent of whether a link pays us.</p>
          <figure class="article-hero"><img src="${article.image}" alt="${article.alt}" width="1448" height="1086"></figure>
        </div>
      </header>
      <div class="article-wrap article-layout">
        <div class="article-content">${body}
          <section class="related-guides"><h2>Continue fixing the setup</h2><ul>${relatedHtml}</ul></section>
        </div>
        <aside class="article-aside" aria-label="On this page"><h2>On this page</h2><nav>${toc}</nav><p class="aside-note">Fit and availability can change. Confirm current product dimensions and instructions before buying or mounting anything.</p></aside>
      </div>
    </article>
  </main>
${footer}
</body>
</html>`;
}

function guideIndexPage() {
  const rows = articles.map((article) => `<article class="guide-list-item" data-guide-category="${article.category}">
    <img src="${article.image}" alt="" width="160" height="120" loading="lazy">
    <div><p class="section-label">${article.category}</p><h2><a href="/articles/${article.slug}.html">${article.title}</a></h2><p>${article.description}</p></div>
    <a class="text-link" href="/articles/${article.slug}.html">Read guide <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
  </article>`).join('\n');
  return `${head({ title: 'Small-Space Desk Guides | Best Desk Setup', description: 'Practical guides for cable clutter, cramped desk layouts, monitor placement, task lighting, and renter-friendly upgrades.', canonical: `${siteUrl}/guides.html`, type: 'website' })}
<body>
${header}
  <main id="main">
    <section class="page-hero"><div class="shell"><p class="section-label">The guide library</p><h1>Choose the problem before the product.</h1><p>Browse ${articles.length} separate guides for cables, space, screen position, and lighting. Every guide prioritizes fit, reversibility, and the smallest useful change.</p></div></section>
    <section class="section"><div class="shell guide-index"><aside><h2>Guide library</h2><p>Each row is a separate article built around one desk constraint—not another version of the same product.</p><a class="text-link" href="/method.html">How we research <i class="ph ph-arrow-right" aria-hidden="true"></i></a></aside><div class="guide-list">${rows}</div></div></section>
  </main>
${footer}
</body>
</html>`;
}

function methodPage() {
  return `${head({ title: 'Our Editorial and Product Research Method | Best Desk Setup', description: 'How Best Desk Setup defines desk problems, verifies specifications, compares trade-offs, uses affiliate links, and corrects errors.', canonical: `${siteUrl}/method.html`, type: 'website' })}
<body>
${header}
  <main id="main">
    <section class="page-hero"><div class="shell"><p class="section-label">Our method</p><h1>Evidence first. Fit before hype.</h1><p>We are building a useful decision library for small desks. Here is what we check, what we do not claim, and how affiliate links fit into the work.</p></div></section>
    <section class="section"><div class="article-wrap article-layout"><div class="article-content">
      <section id="scope"><h2>1. Start with a real constraint</h2><p>Each guide begins with a desk problem: a blocked edge, limited depth, a moving desktop, a screen that cannot reach the right position, or lighting that creates glare. We define the conditions that change the answer before collecting products.</p></section>
      <section id="sources"><h2>2. Prefer primary specifications</h2><p>For fit and installation, we look for manufacturer manuals, dimensions, materials, mounting instructions, and compatibility statements. Retail listings help us confirm that a product is currently discoverable, but they do not override the maker’s safety guidance or the furniture maker’s restrictions.</p></section>
      <section id="research"><h2>3. Use marketplace data carefully</h2><p>We may use automated research tools to find relevant US Amazon listings and spot product categories worth examining. That discovery data is not published as a live price, rating, or stock feed. Listings change, so readers are asked to confirm current details on the destination page.</p></section>
      <section id="testing"><h2>4. Say what kind of evidence we have</h2><p>We do not claim hands-on testing unless we can document the product, procedure, date, and observations. Current guides are research-led. Recommendations are based on fit conditions and trade-offs, not a fictional test lab.</p></section>
      <section id="affiliate"><h2>5. Separate usefulness from payment</h2><p>Best Desk Setup participates in the Amazon Services LLC Associates Program. When a marked link leads to a qualifying purchase, we may earn a commission. This does not change the price paid by the reader. We do not accept payment to hide a material fit problem or turn an incompatible product into a recommendation.</p></section>
      <section id="updates"><h2>6. Recheck and correct</h2><p>Articles show a review date. Because listings and specifications can change, we periodically recheck linked products and remove broken or misleading paths. If you find an error, email <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a> with the page and the detail that needs correction.</p></section>
      <section id="standards"><h2>What every buying guide should tell you</h2><ul><li>Who the installation style suits.</li><li>What to measure or verify first.</li><li>The main trade-off, not just the benefit.</li><li>Whether a link is an affiliate link.</li><li>When a lower-cost or no-purchase fix is enough.</li></ul></section>
    </div><aside class="article-aside" aria-label="On this page"><h2>On this page</h2><nav><a href="#scope">Start with the constraint</a><a href="#sources">Primary sources</a><a href="#research">Marketplace research</a><a href="#testing">Evidence labels</a><a href="#affiliate">Affiliate model</a><a href="#updates">Corrections</a><a href="#standards">Guide standard</a></nav></aside></div></section>
  </main>
${footer}
</body>
</html>`;
}

function aboutPage() {
  return `${head({ title: 'About Best Desk Setup', description: 'Best Desk Setup publishes research-led, fit-first guides for small desks, renter-friendly workspaces, cables, monitors, and lighting.', canonical: `${siteUrl}/about.html`, type: 'website' })}
<body>
${header}
  <main id="main">
    <section class="page-hero"><div class="shell"><p class="section-label">About</p><h1>Small-space desk fixes, without the fantasy showroom.</h1><p>Best Desk Setup helps people make a real desk work better when space, mounting, rental rules, and budget all matter.</p></div></section>
    <section class="section"><div class="article-wrap article-layout"><div class="article-content">
      <section><h2>Why this site exists</h2><p>Many desk roundups begin with a long product list. We begin with the constraint: what fits the furniture, what can be reversed, what needs to move, and what can be fixed without buying anything.</p><p>The current editorial focus is compact home-office desks, renter-friendly cable management, vertical storage, monitor placement, and useful task lighting.</p></section>
      <section><h2>How the site is funded</h2><p>Some product links are Amazon affiliate links. If a reader buys through one of those links, the site may earn a commission. The disclosure appears before buying guidance and affiliate buttons are marked in the page code. See the full <a href="/disclosure.html">affiliate disclosure</a>.</p></section>
      <section><h2>What “research-led” means here</h2><p>We compare product roles, installation methods, desk geometry, current listing availability, and manufacturer information. We do not imply that every product has been physically tested. The full standard is on our <a href="/method.html">method page</a>.</p></section>
      <section><h2>Contact and corrections</h2><p>Questions, corrections, and fit details that could improve a guide are welcome at <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a>.</p></section>
    </div><aside class="article-aside"><h2>Start here</h2><nav><a href="/guides.html">Browse all guides</a><a href="/articles/no-drill-cable-management-for-renters.html">No-drill cable guide</a><a href="/articles/small-desk-layout-guide.html">Small-desk layout</a><a href="/method.html">Our method</a></nav></aside></div></section>
  </main>
${footer}
</body>
</html>`;
}

function informationPage({ slug, title, description, intro, sections }) {
  const sectionHtml = sections.map((section) => `<section><h2>${section.title}</h2>${section.html}</section>`).join('');
  return `${head({ title: `${title} | Best Desk Setup`, description, canonical: `${siteUrl}/${slug}.html`, type: 'website' })}
<body>
${header}
  <main id="main">
    <section class="page-hero"><div class="shell"><p class="section-label">Site information</p><h1>${title}</h1><p>${intro}</p></div></section>
    <section class="section"><div class="article-wrap article-layout"><article class="article-content">${sectionHtml}<p class="policy-date">Last updated: ${displayDate(datesFor(`/${slug}.html`).modified)}</p></article><aside class="article-aside"><h2>Site information</h2><nav><a href="/about.html">About</a><a href="/method.html">Our Method</a><a href="/disclosure.html">Affiliate Disclosure</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Service</a><a href="/contact.html">Contact</a></nav></aside></div></section>
  </main>
${footer}
</body>
</html>`;
}

const informationPages = [
  {
    slug: 'disclosure',
    title: 'Affiliate Disclosure',
    description: 'Affiliate disclosure for Best Desk Setup, including participation in the Amazon Services LLC Associates Program.',
    intro: 'A plain-language explanation of how marked product links fund this site.',
    sections: [
      { title: 'Amazon Associates participation', html: '<div class="callout"><p><strong>As an Amazon Associate, we earn from qualifying purchases.</strong></p></div><p>Best Desk Setup participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>' },
      { title: 'How affiliate links work', html: '<p>Some product links on this website are affiliate links. If you follow one and make a qualifying purchase, we may earn a commission. This does not add a separate fee to your order. Affiliate buttons are marked in the page and use the required sponsored-link attribute.</p>' },
      { title: 'Editorial independence', html: '<p>Affiliate eligibility does not remove a fit problem or turn an incompatible product into a recommendation. Our guides explain who an installation style suits, what to verify, and the primary trade-off. We do not publish copied Amazon prices or ratings as static facts.</p>' },
      { title: 'Questions', html: '<p>For questions about this disclosure, email <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a>.</p>' }
    ]
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'Privacy policy for Best Desk Setup, including analytics, cookies, affiliate attribution, contact information, and user choices.',
    intro: 'What information this site may receive, why it is used, and which third parties are involved.',
    sections: [
      { title: 'Information we receive', html: '<p>Our hosting and analytics services may receive technical information such as IP address, browser and device type, referring page, visited pages, approximate location, timestamps, and interactions. If you email us, we receive the information you choose to include in that message.</p>' },
      { title: 'Analytics and cookies', html: '<p>We use Google Analytics to understand aggregate traffic and on-site actions such as guide selections, fit-checker completion, and outbound affiliate clicks. Google may use cookies or similar technologies according to its own policies. Browser settings and privacy tools can limit cookies, although some measurement may become less accurate.</p>' },
      { title: 'Affiliate attribution', html: '<p>When you follow a marked Amazon link, Amazon may receive referral and device information and use its own cookies or attribution technologies. Amazon controls its destination site and privacy practices; review the privacy notice shown there before purchasing.</p>' },
      { title: 'Use and retention', html: '<p>We use information to operate, secure, measure, and improve the website; respond to messages; and understand whether content paths are useful. We retain contact messages and analytics data only as long as reasonably needed for those purposes or legal obligations.</p>' },
      { title: 'Your choices', html: '<p>You can block or delete cookies through your browser, use available analytics opt-out tools, and avoid sending personal information by email. Depending on where you live, privacy law may provide additional rights to access, correct, or delete certain information.</p>' },
      { title: 'Contact', html: '<p>For a privacy question or request, email <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a>. Please do not send passwords, payment details, or other sensitive information.</p>' }
    ]
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'Terms for using Best Desk Setup, including informational content, external links, intellectual property, and liability limits.',
    intro: 'These terms apply when you access or use Best Desk Setup.',
    sections: [
      { title: 'Use of the website', html: '<p>Use this website only for lawful purposes and in a way that does not interfere with the site or another person’s use. Do not attempt to bypass security, overload the service, or reuse content in a misleading way.</p>' },
      { title: 'Informational content', html: '<p>Guides are provided for general informational purposes. Furniture, electrical equipment, mounting surfaces, product specifications, prices, and availability can change. Confirm current manufacturer instructions and use qualified professional help when a task requires it.</p>' },
      { title: 'External and affiliate links', html: '<p>The site links to third-party services, including Amazon. We do not control their content, availability, checkout, warranties, returns, terms, or privacy practices. A marked affiliate link may generate a commission for Best Desk Setup.</p>' },
      { title: 'Intellectual property', html: '<p>Unless otherwise indicated, original text, layout, branding, and commissioned imagery on this site belong to Best Desk Setup and are protected by applicable law. Limited linking and quotation are welcome when they accurately attribute the source.</p>' },
      { title: 'No warranties and limitation', html: '<p>The site is provided on an “as available” basis without guarantees that every page, link, or recommendation will always be complete or current. To the extent permitted by law, Best Desk Setup is not liable for indirect or consequential loss arising from reliance on the site or a third-party product.</p>' },
      { title: 'Changes and contact', html: '<p>We may update these terms as the site changes. Continued use after an update means the revised terms apply. Questions can be sent to <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a>.</p>' }
    ]
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Contact Best Desk Setup with corrections, desk-fit questions, editorial inquiries, or business messages.',
    intro: 'Send a correction, a fit question that could improve a guide, or an editorial inquiry.',
    sections: [
      { title: 'Email', html: '<p>Email <a href="mailto:contact@bestdesksetup.com">contact@bestdesksetup.com</a>. Include the page URL and the exact detail if you are reporting an error.</p>' },
      { title: 'Useful fit questions', html: '<p>For a desk-fit question, include the desk material, desktop thickness, flat underside depth, nearby obstructions, and the exact accessory or monitor model. Do not send order numbers, payment details, passwords, or other sensitive information.</p>' },
      { title: 'Editorial and business inquiries', html: '<p>Use the same address for editorial, legal, or business messages. Product samples do not guarantee coverage or a positive conclusion, and any material relationship must be disclosed.</p>' }
    ]
  }
];

const redirects = {
  'macbook-multi-monitor-displaylink-guide.html': 'monitor-arm-compatibility-small-desk.html',
  '5k2k-oled-monitor.html': 'monitor-arm-compatibility-small-desk.html',
  'monitor-height-neck-strain-ergonomics-guide.html': 'monitor-arm-compatibility-small-desk.html',
  'best-walking-pads-home-office-2026.html': 'small-desk-layout-guide.html',
  'benq-screenbar-halo-vs-quntis-screen-bar.html': 'compact-desk-lighting-guide.html',
  'ergonomic-chair-coding.html': 'small-desk-layout-guide.html',
  'best-thunderbolt-4-dock-macbook-pro.html': 'small-desk-layout-guide.html',
  'lg-32gs95ue-vs-samsung-oled-g8.html': 'monitor-arm-compatibility-small-desk.html',
  'logitech-mx-master-3s-vs-apple-magic-mouse.html': 'small-desk-layout-guide.html',
  'best-silent-mechanical-keyboard-coding.html': 'small-desk-layout-guide.html',
  'best-desk-decor-aesthetic-accessories-2026.html': 'renter-friendly-desk-upgrades.html',
  'desk-setup-dupes-under-30.html': 'renter-friendly-desk-upgrades.html',
  'best-budget-desk-setup-home-office-2026.html': 'renter-friendly-desk-upgrades.html',
  'standing-desk-wrist-pain.html': 'cable-management-for-standing-desks.html',
  'macbook-dual-monitor-120hz.html': 'monitor-arm-compatibility-small-desk.html'
};

function redirectPage(from, target) {
  const destination = `/articles/${target}`;
  const redirectHead = head({ title: 'Guide moved | Best Desk Setup', description: 'This guide has moved to a more focused Best Desk Setup resource.', canonical: `${siteUrl}${destination}`, robots: 'noindex,follow' })
    .replace('\n</head>', `\n  <meta http-equiv="refresh" content="0; url=${destination}">\n</head>`);
  return `${redirectHead}
<body><main class="redirect-page" id="main"><div><a class="wordmark" href="/">Best <span>Desk</span> Setup</a><h1>This guide has moved.</h1><p>We replaced the older page with a more focused, fit-first guide.</p><a class="button button-primary" href="${destination}">Open the updated guide <i class="ph ph-arrow-right" aria-hidden="true"></i></a><p class="redirect-note">Old path: ${from}</p></div></main><script>window.location.replace('${destination}');</script></body></html>`;
}

function sitemap() {
  const urls = [
    { url: '/', priority: '1.0' }, { url: '/guides.html', priority: '.9' }, { url: '/method.html', priority: '.7' }, { url: '/about.html', priority: '.5' },
    { url: '/disclosure.html', priority: '.3' }, { url: '/privacy.html', priority: '.3' }, { url: '/terms.html', priority: '.3' }, { url: '/contact.html', priority: '.3' },
    ...articles.map((article) => ({ url: `/articles/${article.slug}.html`, priority: article.slug === 'no-drill-cable-management-for-renters' ? '.9' : '.8' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ url, priority }) => `  <url><loc>${siteUrl}${url}</loc><lastmod>${datesFor(url).modified}</lastmod><priority>${priority}</priority></url>`).join('\n')}\n</urlset>\n`;
}

await mkdir(articleDir, { recursive: true });
for (const article of articles) {
  await writeFile(path.join(articleDir, `${article.slug}.html`), articlePage(article));
}
for (const [from, target] of Object.entries(redirects)) {
  await writeFile(path.join(articleDir, from), redirectPage(from, target));
}
await writeFile(path.join(root, 'guides.html'), guideIndexPage());
await writeFile(path.join(root, 'method.html'), methodPage());
await writeFile(path.join(root, 'about.html'), aboutPage());
for (const page of informationPages) {
  await writeFile(path.join(root, `${page.slug}.html`), informationPage(page));
}
await writeFile(path.join(root, 'sitemap.xml'), sitemap());
await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Built ${articles.length} guides, ${Object.keys(redirects).length} redirect stubs, and supporting pages.`);
