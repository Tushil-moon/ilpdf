import type { JobResult, ProcessOptions } from "@/types";

export async function encryptPdfFile(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const password = (options?.password as string) ?? "";
  const confirmPassword = (options?.confirmPassword as string) ?? password;

  if (!password || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  try {
    const { encryptPDF } = await import("cryptpdf");

    const encrypted = await encryptPDF(file, password, password, {
      encryptMetadata: true,
    });

    return {
      success: true,
      data: encrypted,
      fileName: "protected.pdf",
      mimeType: "application/pdf",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to encrypt PDF",
    };
  }
}

export async function decryptPdfFile(
  file: Uint8Array,
  options?: ProcessOptions
): Promise<JobResult> {
  const password = (options?.password as string) ?? "";

  if (!password) {
    return { success: false, error: "Please enter the PDF password." };
  }

  try {
    const { decryptPDF } = await import("cryptpdf");
    const decrypted = await decryptPDF(file, password);
    return {
      success: true,
      data: decrypted,
      fileName: "unlocked.pdf",
      mimeType: "application/pdf",
    };
  } catch {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(file, { ignoreEncryption: true });
      const data = await pdf.save();
      return {
        success: true,
        data,
        fileName: "unlocked.pdf",
        mimeType: "application/pdf",
      };
    } catch {
      return {
        success: false,
        error:
          "Could not unlock PDF. Verify the password is correct. PDFs encrypted with other tools may require the original password.",
      };
    }
  }
}
