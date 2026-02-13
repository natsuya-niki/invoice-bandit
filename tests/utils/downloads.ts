import { execFile } from 'child_process';
import type { Download } from '@playwright/test';

const OPEN_ENV = 'OPEN_DOWNLOADS';

const execFileAsync = (file: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    execFile(file, args, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

export const logDownloadedFile = async (filePath: string) => {
  console.log(`Downloaded: ${filePath}`);

  if (process.env[OPEN_ENV] !== '1') return;

  if (process.platform !== 'darwin') {
    console.warn(`OPEN_DOWNLOADS=1 ですが、この環境では open をスキップします: ${process.platform}`);
    return;
  }

  try {
    await execFileAsync('open', [filePath]);
  } catch (error) {
    console.warn(`open に失敗しました: ${filePath}`);
    console.warn(error);
  }
};

export const saveAndLogDownload = async (download: Download, filePath: string) => {
  await download.saveAs(filePath);
  await logDownloadedFile(filePath);
};
