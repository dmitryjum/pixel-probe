import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import { isValidUrl, sanitizeUrl } from "@/lib/utils"
import path from "path";

export const maxDuration = 60

type CombinedHTTPRequest =
  | import("puppeteer-core").HTTPRequest
  | import("puppeteer").HTTPRequest;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }
    
    const sanitizedUrl = sanitizeUrl(url);

    let browser;
    const chromiumPath = path.join(process.cwd(), "chromium");
    if (process.env.NODE_ENV === "production")  {
      browser = await puppeteerCore.launch({
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(chromiumPath),
        args: chromium.args,
        headless: chromium.headless
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
    }

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    const gtmRequests: string[] = [];
    const obfuscatedRequests: string[] = [];
    const gtmDomains: string[] = [
      "google-analytics.com",
      "googletagmanager.com",
      "google.com",
      "doubleclick.net",
    ];

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    );

    page.on("request", (req: CombinedHTTPRequest) => {
      const requestUrl: string = req.url();
      const resourceType: string = req.resourceType();

      // Block unnecessary resources
      if (["image", "stylesheet", "font", "media", "other"].includes(resourceType)) {
        req.abort();
        return;
      }

      const isGtmRequest: boolean = gtmDomains.some((domain: string) => requestUrl.includes(domain));
      if (isGtmRequest) gtmRequests.push(requestUrl); // Capture GTM-related requests
      if (!isGtmRequest && requestUrl.includes('/g/collect')) obfuscatedRequests.push(requestUrl); // Identify obfuscated requests (custom domains)

      req.continue();
    });

    await page.goto(sanitizedUrl, { waitUntil: "networkidle2" });
    const pageContent = await page.content();
    const gtmDetectedInHtml = pageContent.includes("https://www.googletagmanager.com/gtm.js") ||
                              pageContent.includes("dataLayer");
    await browser.close();

    const hasGTM: boolean = gtmRequests.length > 0 || gtmDetectedInHtml;
    let message: string = "";
    if (hasGTM) {
      if (gtmRequests.length > 0) {
        message = `GTM or GA detected. ${obfuscatedRequests.length} obfuscated requests found.`;
      } else {
        message = "GTM detected in the HTML, but no requests were captured. The site may be blocking bot traffic.";
      }
    } else {
      message = "No Google Tag Manager or Google Analytics implementation detected on this website. The detection may be prevented by the site";
    }

    return NextResponse.json({
      hasGTM,
      gtmRequests,
      obfuscatedRequests,
      message,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: `Error processing request: ${error}` }, { status: 500 });
  }
}