import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { isValidUrl, sanitizeUrl } from "@/lib/utils";

export async function POST(request: Request) {
  let browser;
  try {
    const { url } = await request.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const sanitizedUrl = sanitizeUrl(url);

    console.log('Launching Playwright Chromium...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const gtmRequests: string[] = [];
    const obfuscatedRequests: string[] = [];

    // Intercept network requests
    await page.route('**/*', async (route) => {
      try {
        const requestUrl = route.request().url();
        const resourceType = route.request().resourceType();

        // Block unnecessary resources
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
          route.abort();
          return;
        }

        // Capture GTM-related requests
        if (requestUrl.includes('/collect') || requestUrl.includes('googletagmanager.com')) {
          gtmRequests.push(requestUrl);
          console.log("urls: ", gtmRequests)
          // Identify obfuscated requests (custom domains)
          if (!requestUrl.includes('google-analytics.com') && !requestUrl.includes('googletagmanager.com') && requestUrl.includes('/g/collect')) {
            obfuscatedRequests.push(requestUrl);
          }
        }

        route.continue();
      } catch (err) {
        console.error('Error handling request:', err);
        route.continue();
      }
    });

    console.log('Navigating to URL:', sanitizedUrl);
    await page.goto(sanitizedUrl, { waitUntil: 'load' });
    console.log('Page loaded successfully.');

    const hasGTM = gtmRequests.length > 0;
    const message = hasGTM
      ? `GTM detected. ${obfuscatedRequests.length} obfuscated requests found.`
      : 'No Google Tag Manager implementation detected on this website.';

    console.log('Intercepted GTM requests:', gtmRequests);
    console.log('Intercepted obfuscated requests:', obfuscatedRequests);

    return NextResponse.json({
      hasGTM,
      gtmRequests,
      obfuscatedRequests,
      message,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
}