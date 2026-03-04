// ---------------------------------------------------------------------------
// Static data for all 66 books of the Bible
// ---------------------------------------------------------------------------

export type Testament = "OT" | "NT";

export interface BibleBookMeta {
  id: string;
  name: string;
  testament: Testament;
  chapters: number;
  order: number;
  aliases: string[];
}

/**
 * Complete list of 66 canonical Bible books with their standard three-letter
 * IDs (matching bible.helloao.org), full names, testament, chapter counts,
 * canonical order, and common spoken / written aliases useful for voice input.
 */
export const BIBLE_BOOKS: BibleBookMeta[] = [
  // -- Old Testament --------------------------------------------------------
  { id: "GEN", name: "Genesis", testament: "OT", chapters: 50, order: 1, aliases: ["gen", "genesis"] },
  { id: "EXO", name: "Exodus", testament: "OT", chapters: 40, order: 2, aliases: ["exo", "exod", "exodus"] },
  { id: "LEV", name: "Leviticus", testament: "OT", chapters: 27, order: 3, aliases: ["lev", "leviticus"] },
  { id: "NUM", name: "Numbers", testament: "OT", chapters: 36, order: 4, aliases: ["num", "numbers"] },
  { id: "DEU", name: "Deuteronomy", testament: "OT", chapters: 34, order: 5, aliases: ["deu", "deut", "deuteronomy"] },
  { id: "JOS", name: "Joshua", testament: "OT", chapters: 24, order: 6, aliases: ["jos", "josh", "joshua"] },
  { id: "JDG", name: "Judges", testament: "OT", chapters: 21, order: 7, aliases: ["jdg", "judg", "judges"] },
  { id: "RUT", name: "Ruth", testament: "OT", chapters: 4, order: 8, aliases: ["rut", "ruth"] },
  { id: "1SA", name: "1 Samuel", testament: "OT", chapters: 31, order: 9, aliases: ["1sa", "1 sam", "1 samuel", "first samuel", "1st samuel"] },
  { id: "2SA", name: "2 Samuel", testament: "OT", chapters: 24, order: 10, aliases: ["2sa", "2 sam", "2 samuel", "second samuel", "2nd samuel"] },
  { id: "1KI", name: "1 Kings", testament: "OT", chapters: 22, order: 11, aliases: ["1ki", "1 kings", "first kings", "1st kings"] },
  { id: "2KI", name: "2 Kings", testament: "OT", chapters: 25, order: 12, aliases: ["2ki", "2 kings", "second kings", "2nd kings"] },
  { id: "1CH", name: "1 Chronicles", testament: "OT", chapters: 29, order: 13, aliases: ["1ch", "1 chr", "1 chronicles", "first chronicles", "1st chronicles"] },
  { id: "2CH", name: "2 Chronicles", testament: "OT", chapters: 36, order: 14, aliases: ["2ch", "2 chr", "2 chronicles", "second chronicles", "2nd chronicles"] },
  { id: "EZR", name: "Ezra", testament: "OT", chapters: 10, order: 15, aliases: ["ezr", "ezra"] },
  { id: "NEH", name: "Nehemiah", testament: "OT", chapters: 13, order: 16, aliases: ["neh", "nehemiah"] },
  { id: "EST", name: "Esther", testament: "OT", chapters: 10, order: 17, aliases: ["est", "esther"] },
  { id: "JOB", name: "Job", testament: "OT", chapters: 42, order: 18, aliases: ["job"] },
  { id: "PSA", name: "Psalms", testament: "OT", chapters: 150, order: 19, aliases: ["psa", "psalm", "psalms", "ps"] },
  { id: "PRO", name: "Proverbs", testament: "OT", chapters: 31, order: 20, aliases: ["pro", "prov", "proverbs"] },
  { id: "ECC", name: "Ecclesiastes", testament: "OT", chapters: 12, order: 21, aliases: ["ecc", "eccl", "ecclesiastes", "qoheleth"] },
  { id: "SNG", name: "Song of Solomon", testament: "OT", chapters: 8, order: 22, aliases: ["sng", "song", "song of solomon", "song of songs", "sos"] },
  { id: "ISA", name: "Isaiah", testament: "OT", chapters: 66, order: 23, aliases: ["isa", "isaiah"] },
  { id: "JER", name: "Jeremiah", testament: "OT", chapters: 52, order: 24, aliases: ["jer", "jeremiah"] },
  { id: "LAM", name: "Lamentations", testament: "OT", chapters: 5, order: 25, aliases: ["lam", "lamentations"] },
  { id: "EZK", name: "Ezekiel", testament: "OT", chapters: 48, order: 26, aliases: ["ezk", "ezek", "ezekiel"] },
  { id: "DAN", name: "Daniel", testament: "OT", chapters: 12, order: 27, aliases: ["dan", "daniel"] },
  { id: "HOS", name: "Hosea", testament: "OT", chapters: 14, order: 28, aliases: ["hos", "hosea"] },
  { id: "JOL", name: "Joel", testament: "OT", chapters: 3, order: 29, aliases: ["jol", "joel"] },
  { id: "AMO", name: "Amos", testament: "OT", chapters: 9, order: 30, aliases: ["amo", "amos"] },
  { id: "OBA", name: "Obadiah", testament: "OT", chapters: 1, order: 31, aliases: ["oba", "obad", "obadiah"] },
  { id: "JON", name: "Jonah", testament: "OT", chapters: 4, order: 32, aliases: ["jon", "jonah"] },
  { id: "MIC", name: "Micah", testament: "OT", chapters: 7, order: 33, aliases: ["mic", "micah"] },
  { id: "NAM", name: "Nahum", testament: "OT", chapters: 3, order: 34, aliases: ["nam", "nah", "nahum"] },
  { id: "HAB", name: "Habakkuk", testament: "OT", chapters: 3, order: 35, aliases: ["hab", "habakkuk"] },
  { id: "ZEP", name: "Zephaniah", testament: "OT", chapters: 3, order: 36, aliases: ["zep", "zeph", "zephaniah"] },
  { id: "HAG", name: "Haggai", testament: "OT", chapters: 2, order: 37, aliases: ["hag", "haggai"] },
  { id: "ZEC", name: "Zechariah", testament: "OT", chapters: 14, order: 38, aliases: ["zec", "zech", "zechariah"] },
  { id: "MAL", name: "Malachi", testament: "OT", chapters: 4, order: 39, aliases: ["mal", "malachi"] },

  // -- New Testament --------------------------------------------------------
  { id: "MAT", name: "Matthew", testament: "NT", chapters: 28, order: 40, aliases: ["mat", "matt", "matthew"] },
  { id: "MRK", name: "Mark", testament: "NT", chapters: 16, order: 41, aliases: ["mrk", "mark"] },
  { id: "LUK", name: "Luke", testament: "NT", chapters: 24, order: 42, aliases: ["luk", "luke"] },
  { id: "JHN", name: "John", testament: "NT", chapters: 21, order: 43, aliases: ["jhn", "john", "joh"] },
  { id: "ACT", name: "Acts", testament: "NT", chapters: 28, order: 44, aliases: ["act", "acts", "acts of the apostles"] },
  { id: "ROM", name: "Romans", testament: "NT", chapters: 16, order: 45, aliases: ["rom", "romans"] },
  { id: "1CO", name: "1 Corinthians", testament: "NT", chapters: 16, order: 46, aliases: ["1co", "1 cor", "1 corinthians", "first corinthians", "1st corinthians"] },
  { id: "2CO", name: "2 Corinthians", testament: "NT", chapters: 13, order: 47, aliases: ["2co", "2 cor", "2 corinthians", "second corinthians", "2nd corinthians"] },
  { id: "GAL", name: "Galatians", testament: "NT", chapters: 6, order: 48, aliases: ["gal", "galatians"] },
  { id: "EPH", name: "Ephesians", testament: "NT", chapters: 6, order: 49, aliases: ["eph", "ephesians"] },
  { id: "PHP", name: "Philippians", testament: "NT", chapters: 4, order: 50, aliases: ["php", "phil", "philippians"] },
  { id: "COL", name: "Colossians", testament: "NT", chapters: 4, order: 51, aliases: ["col", "colossians"] },
  { id: "1TH", name: "1 Thessalonians", testament: "NT", chapters: 5, order: 52, aliases: ["1th", "1 thess", "1 thessalonians", "first thessalonians", "1st thessalonians"] },
  { id: "2TH", name: "2 Thessalonians", testament: "NT", chapters: 3, order: 53, aliases: ["2th", "2 thess", "2 thessalonians", "second thessalonians", "2nd thessalonians"] },
  { id: "1TI", name: "1 Timothy", testament: "NT", chapters: 6, order: 54, aliases: ["1ti", "1 tim", "1 timothy", "first timothy", "1st timothy"] },
  { id: "2TI", name: "2 Timothy", testament: "NT", chapters: 4, order: 55, aliases: ["2ti", "2 tim", "2 timothy", "second timothy", "2nd timothy"] },
  { id: "TIT", name: "Titus", testament: "NT", chapters: 3, order: 56, aliases: ["tit", "titus"] },
  { id: "PHM", name: "Philemon", testament: "NT", chapters: 1, order: 57, aliases: ["phm", "philemon", "phlm"] },
  { id: "HEB", name: "Hebrews", testament: "NT", chapters: 13, order: 58, aliases: ["heb", "hebrews"] },
  { id: "JAS", name: "James", testament: "NT", chapters: 5, order: 59, aliases: ["jas", "james"] },
  { id: "1PE", name: "1 Peter", testament: "NT", chapters: 5, order: 60, aliases: ["1pe", "1 pet", "1 peter", "first peter", "1st peter"] },
  { id: "2PE", name: "2 Peter", testament: "NT", chapters: 3, order: 61, aliases: ["2pe", "2 pet", "2 peter", "second peter", "2nd peter"] },
  { id: "1JN", name: "1 John", testament: "NT", chapters: 5, order: 62, aliases: ["1jn", "1 john", "first john", "1st john"] },
  { id: "2JN", name: "2 John", testament: "NT", chapters: 1, order: 63, aliases: ["2jn", "2 john", "second john", "2nd john"] },
  { id: "3JN", name: "3 John", testament: "NT", chapters: 1, order: 64, aliases: ["3jn", "3 john", "third john", "3rd john"] },
  { id: "JUD", name: "Jude", testament: "NT", chapters: 1, order: 65, aliases: ["jud", "jude"] },
  { id: "REV", name: "Revelation", testament: "NT", chapters: 22, order: 66, aliases: ["rev", "revelation", "revelations", "apocalypse"] },
];

// -- Pre-built lookup maps --------------------------------------------------

const bookByIdMap = new Map<string, BibleBookMeta>(
  BIBLE_BOOKS.map((b) => [b.id, b]),
);

const bookByAliasMap = new Map<string, BibleBookMeta>();
for (const book of BIBLE_BOOKS) {
  for (const alias of book.aliases) {
    bookByAliasMap.set(alias.toLowerCase(), book);
  }
  // Also index by the full name (lowercased)
  bookByAliasMap.set(book.name.toLowerCase(), book);
}

// -- Helper functions -------------------------------------------------------

/**
 * Look up a book by its three-letter ID (e.g. "GEN", "1CO").
 * Case-insensitive.
 */
export function getBookById(id: string): BibleBookMeta | undefined {
  return bookByIdMap.get(id.toUpperCase());
}

/**
 * Look up a book by any known name or alias.
 * Useful for mapping voice-recognition output to a book ID.
 * Case-insensitive.
 */
export function getBookByName(name: string): BibleBookMeta | undefined {
  return bookByAliasMap.get(name.toLowerCase().trim());
}

/**
 * Return all books belonging to the given testament.
 */
export function getTestamentBooks(testament: Testament): BibleBookMeta[] {
  return BIBLE_BOOKS.filter((b) => b.testament === testament);
}
