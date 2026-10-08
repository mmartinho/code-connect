import { FileValidator } from '@nestjs/common';

type Signature = (bytes: Buffer) => boolean;

const signatures: Record<string, Signature> = {
  'image/png': (b) =>
    b
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/webp': (b) =>
    b.subarray(0, 4).toString('ascii') === 'RIFF' &&
    b.subarray(8, 12).toString('ascii') === 'WEBP',
};

/** The declared mimetype must be allowed AND match the file's real bytes. */
export class ThumbnailValidator extends FileValidator<Record<string, never>> {
  constructor() {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    const matches = file && signatures[file.mimetype];
    return !!matches && !!file.buffer && matches(file.buffer);
  }

  buildErrorMessage(): string {
    return 'Thumbnail must be a jpeg, png or webp image';
  }
}
