"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { isValidUrl } from "@/lib/utils"
import { RequestList } from "@/components/requestList"

export default function Home() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<null | {
    hasGTM: boolean
    gtmRequests?: string[],
    obfuscatedRequests?: string[],
    message: string
  }>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) return

    try {
      if (!isValidUrl(url)) {
        setResult({
          hasGTM: false,
          message: "Invalid URL. Please use http or https.",
        });
        return;
      }
    } catch {
      setResult({
        hasGTM: false,
        message: "Invalid URL format. Please enter a valid URL.",
      });
      return;
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      if (!response.ok) {
        // Handle non-200 responses
        console.error("Error:", data.error)
        setResult({
          hasGTM: false,
          message: "An error occurred. Please check the URL and try again.",
        });
        return;
      }

      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({
        hasGTM: false,
        message: "An error occurred. The requested site may not be responsive. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setUrl("")
    setResult(null)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full mt-16 text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Bold Spark Media Detector</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Detect Google Tag Manager implementations and identify primary domain analytics
        </p>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-2">
                <Input
                  type="url"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 text-lg"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 h-12 text-lg cursor-pointer" disabled={isLoading || !url}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing... Please be patient, it may take a few minutes...
                    </>
                  ) : (
                    "Analyze Website"
                  )}
                </Button>

                {result && (
                  <Button type="button" variant="outline" className="flex-1 h-12 text-lg cursor-pointer" onClick={handleClear}>
                    Clear
                  </Button>
                )}
              </div>
            </form>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Analysis Results</h3>
                  <Badge variant={result.hasGTM ? "default" : "destructive"}>
                    {result.hasGTM ? "GTM Detected" : "No GTM Detected"}
                  </Badge>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-lg">{result.message}</p>

                {result.gtmRequests && result.gtmRequests.length > 0 && (
                  <RequestList
                    title="GTM Requests"
                    requests={result.gtmRequests}
                    idPrefix="gtm-url"
                  />
                )}

                {result.obfuscatedRequests && result.obfuscatedRequests.length > 0 && (
                  <RequestList
                    title="Obfuscated Requests"
                    requests={result.obfuscatedRequests}
                    idPrefix="obfuscated-url"
                  />
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}