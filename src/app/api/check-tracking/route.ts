import { NextResponse } from "next/server";
import puppeteerCore, { HTTPRequest }  from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import { isValidUrl, sanitizeUrl } from "@/lib/utils"
export const maxDuration = 45
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
    if (process.env.NODE_ENV === "production")  {
      browser = await puppeteerCore.launch({
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(process.env.CHROMIUM_URL),
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

    // Block unnecessary resources (images, stylesheets, fonts)
    await page.setRequestInterception(true);

    const gtmRequests: string[] = [];
    const obfuscatedRequests: string[] = [];

    page.on("request", (req: CombinedHTTPRequest) => {
      const requestUrl = req.url();
      const resourceType = req.resourceType();

      // Block unnecessary resources
      if (["image", "stylesheet", "font"].includes(resourceType)) {
        req.abort();
        return;
      }

      // Capture GTM-related requests
      if (requestUrl.includes("/collect") || requestUrl.includes("googletagmanager.com")) {
        gtmRequests.push(requestUrl);

        // Identify obfuscated requests (custom domains)
        if (!requestUrl.includes("google-analytics.com") && !requestUrl.includes("googletagmanager.com")) {
          obfuscatedRequests.push(requestUrl);
        }
      }

      req.continue();
    });

    // Navigate to the URL and wait for the page to load
    await page.goto(sanitizedUrl, { waitUntil: "networkidle2" });

    // Close the browser
    await browser.close();

    // Prepare the response
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