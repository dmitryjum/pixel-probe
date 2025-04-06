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
    console.log("Chromium path:", chromiumPath);
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
    await browser.close();

    const hasGTM = gtmRequests.length > 0;
    const message = hasGTM
      ? `GTM detected. ${obfuscatedRequests.length} obfuscated requests found.`
      : "No Google Tag Manager implementation detected on this website.";

    return NextResponse.json({
      hasGTM,
      gtmRequests,
      obfuscatedRequests,
      message,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}