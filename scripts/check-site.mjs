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
  if (!html.includes('<link rel="canonical"')) errors.push(`${relative}: missing canonical`);
  if (!html.includes('site-v3.css') && !relative.startsWith('articles/') && relative !== 'index.html') errors.push(`${relative}: missing current stylesheet`);

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
const indexedGuides = [...sitemapText.matchAll(/<loc>https:\/\/bestdesksetup\.com\/articles\/([^<]+)<\/loc>/g)].map((match) => match[1]);
if (indexedGuides.length < 10) errors.push(`sitemap: expected at least 10 article URLs, found ${indexedGuides.length}`);
for (const guide of indexedGuides) {
  if (!(await exists(path.join(root, 'articles', guide)))) errors.push(`sitemap: missing ${guide}`);
}

const core = await readFile(path.join(root, 'articles/no-drill-cable-management-for-renters.html'), 'utf8');
const affiliateLinks = [...core.matchAll(/data-affiliate/g)].length;
if (affiliateLinks !== 4) errors.push(`core guide: expected 4 affiliate links, found ${affiliateLinks}`);

if (errors.length) {
  console.error(`Site checks failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Site checks passed: ${checked.size} HTML files, ${indexedGuides.length} indexed guides, ${affiliateLinks} tracked affiliate links.`);
