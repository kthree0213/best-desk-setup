import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const checked = new Set();

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function inspectFile(filePath) {
  const relative = path.relative(root, filePath);
  if (checked.has(relative)) return;
  checked.add(relative);
  const html = await readFile(filePath, 'utf8');
  if (!html.includes('<meta name="viewport"')) errors.push(`${relative}: missing viewport meta`);
  if (!html.includes('<meta name="robots"')) errors.push(`${relative}: missing robots meta`);
  if (!html.includes('<link rel="canonical"')) errors.push(`${relative}: missing canonical`);
  if (!html.includes("ga-disable-G-SPN9T63MYG")) errors.push(`${relative}: local Analytics traffic is not disabled`);
  if (!html.includes('site-v3.css') && !relative.startsWith('articles/') && relative !== 'index.html') errors.push(`${relative}: missing current stylesheet`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) errors.push(`${relative}: duplicate ids ${duplicateIds.join(', ')}`);

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const urlPath = match[1].split(/[?#]/)[0];
    if (!urlPath || urlPath === '/') continue;
    const target = path.join(root, urlPath.replace(/^\//, ''));
    if (!(await exists(target))) errors.push(`${relative}: broken internal asset/link ${urlPath}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*href="https:\/\/www\.amazon\.com\/dp\/([^?"/]+)\?tag=([^"&]+)"[^>]*>/g)) {
    const [tag, asin, associate] = match;
    if (associate !== 'bestdeskweb-20') errors.push(`${relative}: wrong associate tag for ${asin}`);
    if (!/rel="[^"]*sponsored[^"]*"/.test(tag)) errors.push(`${relative}: affiliate link ${asin} missing sponsored rel`);
    if (!/data-affiliate/.test(tag) || !new RegExp(`data-asin="${asin}"`).test(tag)) errors.push(`${relative}: affiliate link ${asin} missing tracking data`);
    if (!/data-product="[^"]+"/.test(tag) || !/data-position="[^"]+"/.test(tag)) errors.push(`${relative}: affiliate link ${asin} missing product or position data`);
  }

  if (/\$\s?\d/.test(html)) errors.push(`${relative}: contains a static dollar price`);
  if (/\b(?:we|our team) (?:personally )?(?:tested|used)\b/i.test(html)) errors.push(`${relative}: contains an undocumented hands-on claim`);
  if (html.includes('<title>Guide moved | Best Desk Setup</title>') && !/<meta http-equiv="refresh" content="0; url=\/articles\/[^"]+">/.test(html)) {
    errors.push(`${relative}: legacy handoff is missing a zero-delay meta refresh`);
  }
}

const rootHtml = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => path.join(root, entry.name));
const articleFiles = (await readdir(path.join(root, 'articles'), { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => path.join(root, 'articles', entry.name));
await Promise.all([...rootHtml, ...articleFiles].map(inspectFile));

const sitemapText = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapEntries = [...sitemapText.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><priority>([^<]+)<\/priority><\/url>/g)].map((match) => ({ loc: match[1], lastmod: match[2], priority: match[3] }));
const sitemapLocations = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapEntries.length !== sitemapLocations.length) errors.push('sitemap: every URL must have lastmod and priority metadata');
if (new Set(sitemapLocations).size !== sitemapLocations.length) errors.push('sitemap: contains duplicate URLs');
for (const entry of sitemapEntries) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod) || Number.isNaN(Date.parse(`${entry.lastmod}T00:00:00Z`))) {
    errors.push(`sitemap: invalid lastmod for ${entry.loc}`);
  }
}
const lastmodByUrl = new Map(sitemapEntries.map((entry) => [entry.loc, entry.lastmod]));
const indexedGuides = [...sitemapText.matchAll(/<loc>https:\/\/bestdesksetup\.com\/articles\/([^<]+)<\/loc>/g)].map((match) => match[1]);
if (indexedGuides.length < 14) errors.push(`sitemap: expected at least 14 article URLs, found ${indexedGuides.length}`);
for (const guide of indexedGuides) {
  if (!(await exists(path.join(root, 'articles', guide)))) errors.push(`sitemap: missing ${guide}`);
}

const home = await readFile(path.join(root, 'index.html'), 'utf8');
const homeSchemas = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => {
  try { return JSON.parse(match[1]); } catch { errors.push('index.html: invalid JSON-LD'); return null; }
}).filter(Boolean);
const homeSchemaNodes = homeSchemas.flatMap((schema) => schema['@graph'] || [schema]);
const websiteSchema = homeSchemaNodes.find((node) => node['@type'] === 'WebSite');
const organizationSchema = homeSchemaNodes.find((node) => node['@type'] === 'Organization');
if (!websiteSchema || websiteSchema.name !== 'Best Desk Setup' || websiteSchema.alternateName !== 'BestDeskSetup') {
  errors.push('index.html: missing canonical WebSite brand schema');
}
if (!organizationSchema || organizationSchema.url !== 'https://bestdesksetup.com/') errors.push('index.html: missing Organization schema');
if (!home.includes('href="/guides.html"') || !home.includes('href="/articles/no-drill-cable-management-for-renters.html"')) {
  errors.push('index.html: missing guide-library or core-guide internal link');
}

const guideIndex = await readFile(path.join(root, 'guides.html'), 'utf8');
let totalAffiliateLinks = 0;
for (const guide of indexedGuides) {
  if (!guideIndex.includes(`href="/articles/${guide}"`)) errors.push(`guides.html: missing indexed guide link ${guide}`);
  const articleHtml = await readFile(path.join(root, 'articles', guide), 'utf8');
  totalAffiliateLinks += [...articleHtml.matchAll(/\bdata-affiliate\b/g)].length;
  const relatedSection = articleHtml.match(/<section class="related-guides">([\s\S]*?)<\/section>/)?.[1] || '';
  const relatedLinks = [...relatedSection.matchAll(/<li><a href="\/articles\//g)].length;
  if (relatedLinks !== 3) errors.push(`articles/${guide}: expected 3 related guide links, found ${relatedLinks}`);
  if (!articleHtml.includes('<nav class="breadcrumbs"') || !articleHtml.includes('<a href="/guides.html">Guides</a>')) {
    errors.push(`articles/${guide}: missing guide-library breadcrumb`);
  }

  const schemas = [...articleHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => {
    try { return JSON.parse(match[1]); } catch { errors.push(`articles/${guide}: invalid JSON-LD`); return null; }
  }).filter(Boolean);
  const schemaNodes = schemas.flatMap((schema) => schema['@graph'] || [schema]);
  const articleSchema = schemaNodes.find((node) => node['@type'] === 'Article');
  const breadcrumbSchema = schemaNodes.find((node) => node['@type'] === 'BreadcrumbList');
  const canonical = `https://bestdesksetup.com/articles/${guide}`;
  if (!articleSchema || articleSchema.dateModified !== lastmodByUrl.get(canonical)) errors.push(`articles/${guide}: Article dateModified must match sitemap lastmod`);
  if (!articleSchema?.datePublished || !breadcrumbSchema || breadcrumbSchema.itemListElement?.length !== 3) {
    errors.push(`articles/${guide}: incomplete Article or BreadcrumbList schema`);
  }
}

const purchaseIntentGuides = new Map([
  ['cable-management-for-desks-with-back-apron.html', ['B09J5HH2LR', 'B071FXZBMV', 'B015HWXG4M']],
  ['monitor-arm-for-desk-against-wall.html', ['B00B21TLQU', 'B08FB7WFCT', 'B07Q8TJ2KL']],
  ['monitor-light-bar-vs-clamp-lamp.html', ['B08DKQ3JG1', 'B0C4JTPPYY', 'B0DK59YKRS']]
]);
for (const [guide, expectedAsins] of purchaseIntentGuides) {
  if (!indexedGuides.includes(guide)) errors.push(`purchase guide: ${guide} is not indexed`);
  if (!home.includes(`href="/articles/${guide}"`)) errors.push(`index.html: missing purchase-guide link ${guide}`);
  const articleHtml = await readFile(path.join(root, 'articles', guide), 'utf8');
  const actualAsins = [...articleHtml.matchAll(/data-asin="([^"]+)"/g)].map((match) => match[1]);
  if (actualAsins.length !== 3) errors.push(`articles/${guide}: expected 3 affiliate choices, found ${actualAsins.length}`);
  if (new Set(actualAsins).size !== actualAsins.length) errors.push(`articles/${guide}: contains duplicate affiliate choices`);
  for (const asin of expectedAsins) {
    if (!actualAsins.includes(asin)) errors.push(`articles/${guide}: missing verified ASIN ${asin}`);
  }
}

const core = await readFile(path.join(root, 'articles/no-drill-cable-management-for-renters.html'), 'utf8');
const affiliateLinks = [...core.matchAll(/data-affiliate/g)].length;
if (affiliateLinks !== 4) errors.push(`core guide: expected 4 affiliate links, found ${affiliateLinks}`);

const siteScript = await readFile(path.join(root, 'assets/site-v3.js'), 'utf8');
const affiliateEventPayload = siteScript.match(/track\('affiliate_click', \{([\s\S]*?)\n\s*\}\);/)?.[1] || '';
for (const parameter of ['affiliate_id', 'asin', 'item_id', 'item_name', 'product_name', 'link_position', 'link_url', 'link_domain', 'link_text', 'outbound']) {
  if (!new RegExp(`\\b${parameter}\\b\\s*(?::|,)`).test(affiliateEventPayload)) errors.push(`site-v3.js: affiliate_click missing ${parameter}`);
}
if (!affiliateEventPayload) errors.push('site-v3.js: missing affiliate_click event');

if (errors.length) {
  console.error(`Site checks failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Site checks passed: ${checked.size} HTML files, ${indexedGuides.length} indexed guides, ${totalAffiliateLinks} tracked affiliate links, brand and article schemas verified.`);
