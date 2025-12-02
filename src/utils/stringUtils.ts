/**
 * String Utilities
 * Helper functions for string manipulation
 */

/**
 * Truncates a filename intelligently by keeping the beginning and extension visible
 * @param filename - The filename to truncate
 * @param maxLength - Maximum length before truncation (default: 25)
 * @returns Truncated filename with ellipsis in the middle
 *
 * @example
 * truncateFilename('hsdjkahdjksahjdkhjsndkjsahjkdhsajkdsakjdhsat.jpg', 20)
 * // Returns: 'hsdjkahdjk...at.jpg'
 */
export function truncateFilename(filename: string, maxLength: number = 25): string {
  if (!filename || filename.length <= maxLength) {
    return filename;
  }

  // Find the last dot to identify the extension
  const lastDotIndex = filename.lastIndexOf('.');

  // If no extension or extension is at the start, truncate from the end
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename.slice(0, maxLength - 3) + '...';
  }

  const extension = filename.slice(lastDotIndex);
  const nameWithoutExtension = filename.slice(0, lastDotIndex);

  // Calculate how many characters we can keep from the filename
  const extensionLength = extension.length;
  const ellipsisLength = 3; // '...'
  const availableChars = maxLength - extensionLength - ellipsisLength;

  // If the available space is too small, just truncate normally
  if (availableChars < 5) {
    return filename.slice(0, maxLength - 3) + '...';
  }

  // Keep the beginning of the filename + ellipsis + extension
  const truncatedName = nameWithoutExtension.slice(0, availableChars);
  return `${truncatedName}...${extension}`;
}
