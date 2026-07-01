"use client";

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

let configurePromise: Promise<void> | null = null;

async function configurePdfWorker() {
  if (typeof window === "undefined") return;

  const workerUrl = `${window.location.origin}/pdf.worker.min.mjs`;
  const response = await fetch(workerUrl);

  if (!response.ok) {
    throw new Error(`PDF worker not found (${response.status})`);
  }

  const blob = await response.blob();
  pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
}

export async function getBrowserPdfJs() {
  if (!configurePromise) {
    configurePromise = configurePdfWorker().catch((error) => {
      configurePromise = null;
      throw error;
    });
  }
  await configurePromise;
  return pdfjs;
}
