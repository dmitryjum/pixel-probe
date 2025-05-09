import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import { isValidUrl, sanitizeUrl } from "@/lib/utils"
import * as cheerio from "cheerio";
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
      "analytics.google.com",
    ];

    const blockedDomains = [
      "doubleclick.net",
      "googleadservices.com",
      "static.doubleclick.net",
      "play.google.com",
      "cdn-cgi/scripts",
      "youtube.com/s/player",
      "google.com/js",
    ];

    const blockedResourcTypes = [
      "image",
      "stylesheet",
      "font",
      "media",
      "other"
    ];

    const blockedPaths = [
      "/wp-content/plugins/",
      "/wp-content/themes/",
      "/wp-includes/js/mediaelement/",
    ];

    page.on("request", (req: CombinedHTTPRequest) => {
      const requestUrl: string = req.url();
      const resourceType: string = req.resourceType();

      // Block unnecessary resources
      if (blockedResourcTypes.includes(resourceType) ||
        blockedDomains.some((domain: string) => requestUrl.includes(domain)) ||
        blockedPaths.some((path: string) => requestUrl.includes(path))) {
        req.abort();
        return;
      }
      
      const isGtmRequest: boolean = gtmDomains.some((domain: string) => requestUrl.includes(domain));
      if (isGtmRequest) gtmRequests.push(requestUrl); // Capture GTM-related requests
      if (!isGtmRequest && requestUrl.includes('/g/collect')) obfuscatedRequests.push(requestUrl); // Identify obfuscated requests (custom domains)

      req.continue();
    });
    const html = await fetch(sanitizedUrl).then(res => res.text());
    const $ = cheerio.load(html);
    const gtmDetectedInHtml: boolean = $("script").filter((_, el) => {
      const scriptContent = $(el).html() || "";

      return ["dataLayer", "analytics", "gtag"].some((keyword) => scriptContent.includes(keyword))
    }).length > 0;

    await page.goto(sanitizedUrl, { waitUntil: "networkidle2" });
    await browser.close();

    const hasGTM: boolean = gtmRequests.length > 0 || gtmDetectedInHtml;
    let message: string = "";
    const contactUs = "The detection may be prevented by the site. Please contact us so we can check manually for you."
    if (hasGTM) {
      if (gtmRequests.length > 0) {
        message = `GTM or GA detected. ${obfuscatedRequests.length} obfuscated requests found.`;
      } else {
        message = `GTM detected in the HTML, but no requests were captured. ${contactUs}`;
      }
    } else {
      message = `No GTM or Google Analytics implementation detected on this website. ${contactUs}`;
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