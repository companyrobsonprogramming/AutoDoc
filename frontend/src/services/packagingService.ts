import { LocalFileInfo, PackageInput } from '../types/domain';

export interface PackagingOptions {
  maxFilesPerPackage?: number;
  maxBytesPerPackage?: number;
}

export const buildPackages = (
  files: LocalFileInfo[],
  options: PackagingOptions
): PackageInput[] => {
  const maxFiles = options.maxFilesPerPackage ?? 10;
  const maxBytes = options.maxBytesPerPackage ?? 512 * 1024; // 512 KB por pacote

  const packages: PackageInput[] = [];
  let current: LocalFileInfo[] = [];
  let currentSize = 0;
  let index = 0;

  for (const file of files) {
    const fileSize = file.size;
    const wouldExceedFiles = current.length + 1 > maxFiles;
    const wouldExceedBytes = currentSize + fileSize > maxBytes;

    if (current.length > 0 && (wouldExceedFiles || wouldExceedBytes)) {
      packages.push({
        id: `pkg-${index}`,
        index,
        files: current,
        totalSizeBytes: currentSize,
        status: 'pending'
      });
      index++;
      current = [];
      currentSize = 0;
    }

    current.push(file);
    currentSize += fileSize;
  }

  if (current.length > 0) {
    packages.push({
      id: `pkg-${index}`,
      index,
      files: current,
      totalSizeBytes: currentSize,
      status: 'pending'
    });
  }

  return packages;
};
