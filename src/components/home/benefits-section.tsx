"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Gift, UserX } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Secure",
    description: "256-bit SSL encryption. Files auto-deleted after processing.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process PDFs in seconds with our optimized infrastructure.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Gift,
    title: "100% Free",
    description: "All tools free with no watermarks or hidden fees.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: UserX,
    title: "No Registration",
    description: "Start using tools immediately. No account needed.",
    color: "from-purple-500 to-violet-600",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24" aria-labelledby="benefits-heading">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="benefits-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Why choose ILPDF?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The most trusted free PDF toolkit on the web
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl border border-border/50 bg-card p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${benefit.color}`}
              >
                <benefit.icon className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
