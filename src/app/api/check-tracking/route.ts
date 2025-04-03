import { NextResponse } from "next/server"
import * as cheerio from 'cheerio';
// This is a placeholder API route that will be replaced with your actual implementation
export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const gtmSnippetRegex = /\(function\(w,d,s,l,i\)\{w\[l\]=w\[l\]\|\|\[\];w\[l\]\.push\(\{'gtm\.start':/
    let hasGTM = false

    $('script').each((_, script) => {
      const scriptContent = $(script).html() // Get the inner content of the script tag
      if (scriptContent && gtmSnippetRegex.test(scriptContent)) {
        hasGTM = true
      }
    })

    console.log("hasGTM", hasGTM);
    let message = ""
    // const usesCustomDomain = hasGTM && Math.random() > 0.5

    if (!hasGTM) {
      message = "No Google Tag Manager implementation detected on this website."
    } else {
      message = "GTM detected. This website is sending analytics data directly to Google Analytics."
    }

    return NextResponse.json({
      hasGTM,
      message,
    })
  } catch (error) {
    return NextResponse.json({ error: `Failed to process request: ${error}` }, { status: 500 })
  }
}