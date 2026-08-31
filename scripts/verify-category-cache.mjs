/**
 * Post-deploy check for the CDN query-param cache bug.
 *
 * Verifies that /api/products returns DIFFERENT responses for different
 * ?category= values, and that the netlify-vary header includes `category`.
 * Run after every deploy:  node scripts/verify-category-cache.mjs
 */

const BASE = process.env.SITE_URL || 'https://www.giaromart.com';

async function main() {
    const catsRes = await fetch(`${BASE}/api/categories`);
    const { categories } = await catsRes.json();
    if (!categories || categories.length < 2) {
        console.error('Need at least 2 categories to verify; got', categories?.length);
        process.exit(1);
    }

    const [c1, c2] = categories;
    const url = (name) =>
        `${BASE}/api/products?limit=5&category=${encodeURIComponent(name)}`;

    const r1 = await fetch(url(c1.name));
    const varyHeader = r1.headers.get('netlify-vary') || '';
    const body1 = await r1.text();
    const body2 = await (await fetch(url(c2.name))).text();

    const varyOk = /query=[^,]*\bcategory\b/.test(varyHeader);
    console.log(`netlify-vary: ${varyHeader || '(none)'}`);
    console.log(`vary includes category: ${varyOk ? 'YES' : 'NO'}`);

    if (body1 === body2) {
        console.error(
            `FAIL: "${c1.name}" and "${c2.name}" returned identical bodies — ` +
            'the CDN is still collapsing category queries into one cache entry.',
        );
        process.exit(1);
    }
    if (!varyOk) {
        console.warn(
            'WARN: bodies differ but netlify-vary does not list `category` — ' +
            'responses may only differ because the cache is cold. Re-run in a minute.',
        );
        process.exit(2);
    }
    console.log('PASS: category responses are distinct and cache key varies on category.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
