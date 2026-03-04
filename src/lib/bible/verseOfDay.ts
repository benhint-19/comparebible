// ---------------------------------------------------------------------------
// Verse of the Day -- deterministic daily selection from a curated list
// ---------------------------------------------------------------------------

interface VerseOfDay {
  bookId: string;
  chapter: number;
  verse: number;
  reference: string;
}

/**
 * Curated list of ~100 well-known and meaningful Bible verses (mix of OT & NT).
 */
const CURATED_VERSES: VerseOfDay[] = [
  // -- Old Testament --
  { bookId: "GEN", chapter: 1, verse: 1, reference: "Genesis 1:1" },
  { bookId: "GEN", chapter: 12, verse: 2, reference: "Genesis 12:2" },
  { bookId: "GEN", chapter: 28, verse: 15, reference: "Genesis 28:15" },
  { bookId: "EXO", chapter: 14, verse: 14, reference: "Exodus 14:14" },
  { bookId: "DEU", chapter: 31, verse: 6, reference: "Deuteronomy 31:6" },
  { bookId: "DEU", chapter: 31, verse: 8, reference: "Deuteronomy 31:8" },
  { bookId: "JOS", chapter: 1, verse: 9, reference: "Joshua 1:9" },
  { bookId: "1SA", chapter: 16, verse: 7, reference: "1 Samuel 16:7" },
  { bookId: "2CH", chapter: 7, verse: 14, reference: "2 Chronicles 7:14" },
  { bookId: "NEH", chapter: 8, verse: 10, reference: "Nehemiah 8:10" },
  { bookId: "JOB", chapter: 19, verse: 25, reference: "Job 19:25" },
  { bookId: "PSA", chapter: 1, verse: 1, reference: "Psalm 1:1" },
  { bookId: "PSA", chapter: 16, verse: 11, reference: "Psalm 16:11" },
  { bookId: "PSA", chapter: 19, verse: 1, reference: "Psalm 19:1" },
  { bookId: "PSA", chapter: 23, verse: 1, reference: "Psalm 23:1" },
  { bookId: "PSA", chapter: 23, verse: 4, reference: "Psalm 23:4" },
  { bookId: "PSA", chapter: 27, verse: 1, reference: "Psalm 27:1" },
  { bookId: "PSA", chapter: 34, verse: 8, reference: "Psalm 34:8" },
  { bookId: "PSA", chapter: 37, verse: 4, reference: "Psalm 37:4" },
  { bookId: "PSA", chapter: 46, verse: 1, reference: "Psalm 46:1" },
  { bookId: "PSA", chapter: 46, verse: 10, reference: "Psalm 46:10" },
  { bookId: "PSA", chapter: 51, verse: 10, reference: "Psalm 51:10" },
  { bookId: "PSA", chapter: 56, verse: 3, reference: "Psalm 56:3" },
  { bookId: "PSA", chapter: 91, verse: 1, reference: "Psalm 91:1" },
  { bookId: "PSA", chapter: 91, verse: 11, reference: "Psalm 91:11" },
  { bookId: "PSA", chapter: 100, verse: 4, reference: "Psalm 100:4" },
  { bookId: "PSA", chapter: 107, verse: 1, reference: "Psalm 107:1" },
  { bookId: "PSA", chapter: 118, verse: 24, reference: "Psalm 118:24" },
  { bookId: "PSA", chapter: 119, verse: 105, reference: "Psalm 119:105" },
  { bookId: "PSA", chapter: 121, verse: 1, reference: "Psalm 121:1" },
  { bookId: "PSA", chapter: 139, verse: 14, reference: "Psalm 139:14" },
  { bookId: "PSA", chapter: 145, verse: 18, reference: "Psalm 145:18" },
  { bookId: "PRO", chapter: 3, verse: 5, reference: "Proverbs 3:5" },
  { bookId: "PRO", chapter: 3, verse: 6, reference: "Proverbs 3:6" },
  { bookId: "PRO", chapter: 4, verse: 23, reference: "Proverbs 4:23" },
  { bookId: "PRO", chapter: 16, verse: 3, reference: "Proverbs 16:3" },
  { bookId: "PRO", chapter: 16, verse: 9, reference: "Proverbs 16:9" },
  { bookId: "PRO", chapter: 22, verse: 6, reference: "Proverbs 22:6" },
  { bookId: "PRO", chapter: 27, verse: 17, reference: "Proverbs 27:17" },
  { bookId: "ECC", chapter: 3, verse: 1, reference: "Ecclesiastes 3:1" },
  { bookId: "ISA", chapter: 9, verse: 6, reference: "Isaiah 9:6" },
  { bookId: "ISA", chapter: 26, verse: 3, reference: "Isaiah 26:3" },
  { bookId: "ISA", chapter: 40, verse: 29, reference: "Isaiah 40:29" },
  { bookId: "ISA", chapter: 40, verse: 31, reference: "Isaiah 40:31" },
  { bookId: "ISA", chapter: 41, verse: 10, reference: "Isaiah 41:10" },
  { bookId: "ISA", chapter: 43, verse: 2, reference: "Isaiah 43:2" },
  { bookId: "ISA", chapter: 53, verse: 5, reference: "Isaiah 53:5" },
  { bookId: "ISA", chapter: 55, verse: 8, reference: "Isaiah 55:8" },
  { bookId: "JER", chapter: 17, verse: 7, reference: "Jeremiah 17:7" },
  { bookId: "JER", chapter: 29, verse: 11, reference: "Jeremiah 29:11" },
  { bookId: "JER", chapter: 33, verse: 3, reference: "Jeremiah 33:3" },
  { bookId: "LAM", chapter: 3, verse: 22, reference: "Lamentations 3:22" },
  { bookId: "DAN", chapter: 2, verse: 20, reference: "Daniel 2:20" },
  { bookId: "MIC", chapter: 6, verse: 8, reference: "Micah 6:8" },
  { bookId: "NAM", chapter: 1, verse: 7, reference: "Nahum 1:7" },
  { bookId: "HAB", chapter: 2, verse: 4, reference: "Habakkuk 2:4" },
  { bookId: "ZEP", chapter: 3, verse: 17, reference: "Zephaniah 3:17" },

  // -- New Testament --
  { bookId: "MAT", chapter: 5, verse: 14, reference: "Matthew 5:14" },
  { bookId: "MAT", chapter: 5, verse: 16, reference: "Matthew 5:16" },
  { bookId: "MAT", chapter: 6, verse: 33, reference: "Matthew 6:33" },
  { bookId: "MAT", chapter: 7, verse: 7, reference: "Matthew 7:7" },
  { bookId: "MAT", chapter: 11, verse: 28, reference: "Matthew 11:28" },
  { bookId: "MAT", chapter: 19, verse: 26, reference: "Matthew 19:26" },
  { bookId: "MAT", chapter: 28, verse: 19, reference: "Matthew 28:19" },
  { bookId: "MAT", chapter: 28, verse: 20, reference: "Matthew 28:20" },
  { bookId: "MRK", chapter: 10, verse: 27, reference: "Mark 10:27" },
  { bookId: "MRK", chapter: 11, verse: 24, reference: "Mark 11:24" },
  { bookId: "LUK", chapter: 1, verse: 37, reference: "Luke 1:37" },
  { bookId: "LUK", chapter: 6, verse: 31, reference: "Luke 6:31" },
  { bookId: "JHN", chapter: 1, verse: 1, reference: "John 1:1" },
  { bookId: "JHN", chapter: 3, verse: 16, reference: "John 3:16" },
  { bookId: "JHN", chapter: 8, verse: 32, reference: "John 8:32" },
  { bookId: "JHN", chapter: 10, verse: 10, reference: "John 10:10" },
  { bookId: "JHN", chapter: 13, verse: 34, reference: "John 13:34" },
  { bookId: "JHN", chapter: 14, verse: 6, reference: "John 14:6" },
  { bookId: "JHN", chapter: 14, verse: 27, reference: "John 14:27" },
  { bookId: "JHN", chapter: 15, verse: 13, reference: "John 15:13" },
  { bookId: "JHN", chapter: 16, verse: 33, reference: "John 16:33" },
  { bookId: "ACT", chapter: 1, verse: 8, reference: "Acts 1:8" },
  { bookId: "ROM", chapter: 5, verse: 8, reference: "Romans 5:8" },
  { bookId: "ROM", chapter: 8, verse: 1, reference: "Romans 8:1" },
  { bookId: "ROM", chapter: 8, verse: 28, reference: "Romans 8:28" },
  { bookId: "ROM", chapter: 10, verse: 9, reference: "Romans 10:9" },
  { bookId: "ROM", chapter: 12, verse: 2, reference: "Romans 12:2" },
  { bookId: "ROM", chapter: 15, verse: 13, reference: "Romans 15:13" },
  { bookId: "1CO", chapter: 10, verse: 13, reference: "1 Corinthians 10:13" },
  { bookId: "1CO", chapter: 13, verse: 4, reference: "1 Corinthians 13:4" },
  { bookId: "1CO", chapter: 16, verse: 13, reference: "1 Corinthians 16:13" },
  { bookId: "2CO", chapter: 5, verse: 7, reference: "2 Corinthians 5:7" },
  { bookId: "2CO", chapter: 5, verse: 17, reference: "2 Corinthians 5:17" },
  { bookId: "2CO", chapter: 12, verse: 9, reference: "2 Corinthians 12:9" },
  { bookId: "GAL", chapter: 2, verse: 20, reference: "Galatians 2:20" },
  { bookId: "GAL", chapter: 5, verse: 22, reference: "Galatians 5:22" },
  { bookId: "EPH", chapter: 2, verse: 8, reference: "Ephesians 2:8" },
  { bookId: "EPH", chapter: 3, verse: 20, reference: "Ephesians 3:20" },
  { bookId: "EPH", chapter: 4, verse: 32, reference: "Ephesians 4:32" },
  { bookId: "EPH", chapter: 6, verse: 10, reference: "Ephesians 6:10" },
  { bookId: "PHP", chapter: 1, verse: 6, reference: "Philippians 1:6" },
  { bookId: "PHP", chapter: 4, verse: 6, reference: "Philippians 4:6" },
  { bookId: "PHP", chapter: 4, verse: 8, reference: "Philippians 4:8" },
  { bookId: "PHP", chapter: 4, verse: 13, reference: "Philippians 4:13" },
  { bookId: "COL", chapter: 3, verse: 23, reference: "Colossians 3:23" },
  { bookId: "1TH", chapter: 5, verse: 16, reference: "1 Thessalonians 5:16" },
  { bookId: "2TI", chapter: 1, verse: 7, reference: "2 Timothy 1:7" },
  { bookId: "HEB", chapter: 4, verse: 16, reference: "Hebrews 4:16" },
  { bookId: "HEB", chapter: 11, verse: 1, reference: "Hebrews 11:1" },
  { bookId: "HEB", chapter: 12, verse: 1, reference: "Hebrews 12:1" },
  { bookId: "HEB", chapter: 13, verse: 8, reference: "Hebrews 13:8" },
  { bookId: "JAS", chapter: 1, verse: 5, reference: "James 1:5" },
  { bookId: "JAS", chapter: 4, verse: 8, reference: "James 4:8" },
  { bookId: "1PE", chapter: 5, verse: 7, reference: "1 Peter 5:7" },
  { bookId: "1JN", chapter: 1, verse: 9, reference: "1 John 1:9" },
  { bookId: "1JN", chapter: 4, verse: 19, reference: "1 John 4:19" },
  { bookId: "REV", chapter: 3, verse: 20, reference: "Revelation 3:20" },
  { bookId: "REV", chapter: 21, verse: 4, reference: "Revelation 21:4" },
];

/**
 * Return the day-of-year (0-based) for a given date.
 */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Get today's verse of the day. Deterministic -- same verse all day.
 */
export function getVerseOfDay(): VerseOfDay {
  const today = new Date();
  const index = dayOfYear(today) % CURATED_VERSES.length;
  return CURATED_VERSES[index];
}
