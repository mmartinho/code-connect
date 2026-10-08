import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

export const uploadsDir = () => join(process.cwd(), 'uploads');

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const allowedThumbnailTypes = Object.keys(extensions);

@Injectable()
export class ThumbnailStorage {
  async save(file: Express.Multer.File): Promise<string> {
    const name = `${randomUUID()}.${extensions[file.mimetype]}`;
    await mkdir(uploadsDir(), { recursive: true });
    await writeFile(join(uploadsDir(), name), file.buffer);
    return name;
  }

  async remove(name: string): Promise<void> {
    await unlink(join(uploadsDir(), name)).catch(() => undefined);
  }
}
