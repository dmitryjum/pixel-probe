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

export default function Home() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<null | {
    hasGTM: boolean
<<<<<<< HEAD
=======
    gtmRequests?: string[],
    obfuscatedRequests?: string[],
>>>>>>> 269efa8 (WIP: need to fix the issue with chromium-min)
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
      // This will be replaced with your actual API endpoint
      const response = await fetch("/api/check-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        hasGTM: false,
        message: `Error checking URL: ${error}. Please try again.`,
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
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full mt-16 text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Pixel Probe</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Detect Google Tag Manager implementations and identify custom domain analytics
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
                <Button type="submit" className="flex-1 h-12 text-lg" disabled={isLoading || !url}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Website"
                  )}
                </Button>

                {result && (
                  <Button type="button" variant="outline" className="flex-1 h-12 text-lg" onClick={handleClear}>
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
                  <div className="mt-4">
                    <h4 className="text-lg font-medium mb-2">GTM Requests</h4>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                      {result.gtmRequests.map((url, index) => (
                        <li key={index} className="break-words">{url}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.obfuscatedRequests && result.obfuscatedRequests.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-2">Obfuscated Requests</h4>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                      {result.obfuscatedRequests.map((url, index) => (
                        <li key={index} className="break-words">{url}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}