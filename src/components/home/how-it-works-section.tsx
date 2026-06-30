"use client";

import { motion } from "framer-motion";
import { MousePointerClick, Upload, Download } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "Choose a tool",
    description: "Select from 20+ PDF tools for any task you need.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload files",
    description: "Drag & drop or select files from your device.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download result",
    description: "Get your processed file instantly. It's that simple.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 py-24" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Three simple steps to process your PDFs
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="absolute top-12 left-[60%] hidden h-0.5 w-[80%] bg-gradient-to-r from-red-500/50 to-transparent md:block" />
              )}
              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/10" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                  <step.icon className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background text-xs font-bold text-red-500 ring-2 ring-red-500/20">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
