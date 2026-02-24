// sign-images.config.ts
// ═══════════════════════════════════════════════════════════════
// FILL IN YOUR GOOGLE DRIVE FILE IDs BELOW
// ═══════════════════════════════════════════════════════════════
//
// HOW TO GET FILE ID:
// 1. Open image in Google Drive
// 2. Look at URL: https://drive.google.com/file/d/FILE_ID_HERE/view
// 3. Copy the FILE_ID_HERE part
// 4. Paste below
//
// Make sure each image is shared as "Anyone with link can view"
// ═══════════════════════════════════════════════════════════════

const DRIVE_BASE = 'https://drive.google.com/uc?export=view&id=';

// 📝 REPLACE THESE WITH YOUR ACTUAL FILE IDs
const FILE_IDS: Record<string, string> = {
  A: '1bOrje2qofAPjv-6kSyNO1VTXJMnhc-_U',
  B: 'PASTE_YOUR_FILE_ID_HERE',
  C: 'PASTE_YOUR_FILE_ID_HERE',
  D: 'PASTE_YOUR_FILE_ID_HERE',
  E: 'PASTE_YOUR_FILE_ID_HERE',
  F: 'PASTE_YOUR_FILE_ID_HERE',
  G: 'PASTE_YOUR_FILE_ID_HERE',
  H: 'PASTE_YOUR_FILE_ID_HERE',
  I: 'PASTE_YOUR_FILE_ID_HERE',
  J: 'PASTE_YOUR_FILE_ID_HERE',
  K: 'PASTE_YOUR_FILE_ID_HERE',
  L: 'PASTE_YOUR_FILE_ID_HERE',
  M: 'PASTE_YOUR_FILE_ID_HERE',
  N: 'PASTE_YOUR_FILE_ID_HERE',
  O: 'PASTE_YOUR_FILE_ID_HERE',
  P: 'PASTE_YOUR_FILE_ID_HERE',
  Q: 'PASTE_YOUR_FILE_ID_HERE',
  R: 'PASTE_YOUR_FILE_ID_HERE',
  S: 'PASTE_YOUR_FILE_ID_HERE',
  T: 'PASTE_YOUR_FILE_ID_HERE',
  U: 'PASTE_YOUR_FILE_ID_HERE',
  V: 'PASTE_YOUR_FILE_ID_HERE',
  W: 'PASTE_YOUR_FILE_ID_HERE',
  X: 'PASTE_YOUR_FILE_ID_HERE',
  Y: 'PASTE_YOUR_FILE_ID_HERE',
  Z: 'PASTE_YOUR_FILE_ID_HERE',
};

// ═══════════════════════════════════════════════════════════════
// DON'T MODIFY BELOW THIS LINE
// ═══════════════════════════════════════════════════════════════

export function getSignImageUrl(letter: string): string {
  const fileId = FILE_IDS[letter.toUpperCase()];
  if (!fileId || fileId === 'PASTE_YOUR_FILE_ID_HERE') {
    console.warn(`Missing file ID for letter: ${letter}`);
    return '';
  }
  return DRIVE_BASE + fileId;
}

// Helper to check which letters are configured
export function getMissingLetters(): string[] {
  return Object.entries(FILE_IDS)
    .filter(([, id]) => id === 'PASTE_YOUR_FILE_ID_HERE')
    .map(([letter]) => letter);
}

// Check configuration on load
if (typeof window !== 'undefined') {
  const missing = getMissingLetters();
  if (missing.length > 0) {
    console.warn(`⚠️  Missing file IDs for: ${missing.join(', ')}`);
    console.warn(
      'Update sign-images.config.ts with your Google Drive file IDs',
    );
  } else {
    console.log('✅ All 26 sign images configured');
  }
}
