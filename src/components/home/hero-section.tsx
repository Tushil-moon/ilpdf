"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32" aria-labelledby="hero-heading">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              100% Free • No Registration Required
            </div>

            <h1 id="hero-heading" className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Every PDF tool you need —{" "}
              <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
                100% Free
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Merge, split, compress, convert, rotate, unlock and watermark PDFs
              with just a few clicks. Fast, secure, and no registration required.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/tools">
                  Choose a PDF Tool
                  <ArrowRight className="ml-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/tools/merge-pdf">Merge PDF Now</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
            aria-hidden="true"
          >
            <div className="relative mx-auto h-[400px] w-[400px]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-8 h-48 w-36 rounded-2xl border border-border/50 bg-card p-4 shadow-2xl"
              >
                <div className="mb-3 h-3 w-16 rounded bg-red-500/20" />
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-4/5 rounded bg-muted" />
                  <div className="h-2 w-3/5 rounded bg-muted" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-4 h-48 w-36 rounded-2xl border border-border/50 bg-card p-4 shadow-2xl"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-2/3 rounded bg-muted" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 h-52 w-40 rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-rose-500/5 p-4 shadow-2xl backdrop-blur-sm"
              >
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-sm font-semibold">Merged PDF</p>
                  <div className="h-1.5 w-20 rounded-full bg-green-500" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
