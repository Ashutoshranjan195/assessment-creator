import { promises as fs } from 'fs';
import path from 'path';
import puppeteer, { type Browser } from 'puppeteer';
import { config } from './config';
import { logger } from './logger';

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

export async function shutdownBrowser(): Promise<void> {
  if (!browserPromise) return;
  const b = await browserPromise;
  browserPromise = null;
  await b.close();
}

/**
 * Renders the frontend's print-friendly route and saves a PDF to disk.
 *
 * In production replace the disk write with an S3 (or other object store)
 * upload — see README "Deploy" section.
 */
export async function generatePdf(assignmentId: string): Promise<string> {
  await fs.mkdir(config.pdfStorageDir, { recursive: true });
  const outPath = path.resolve(config.pdfStorageDir, `${assignmentId}.pdf`);
  const url = `${config.frontendUrl.replace(/\/$/, '')}/assignments/${assignmentId}/print`;
  logger.info({ url, outPath }, 'rendering PDF');

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.emulateMediaType('print');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
    // Wait for the print marker that the frontend renders when fully loaded.
    await page.waitForSelector('[data-print-ready="true"]', { timeout: 30_000 });
    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
      preferCSSPageSize: true,
    });
  } finally {
    await page.close();
  }
  return outPath;
}
