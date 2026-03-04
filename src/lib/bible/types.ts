// ---------------------------------------------------------------------------
// Types for the bible.helloao.org static JSON API
// ---------------------------------------------------------------------------

// -- Translation ------------------------------------------------------------

export interface Translation {
  id: string;
  name: string;
  shortName: string;
  englishName: string;
  language: string;
  languageName: string;
  languageEnglishName: string;
  textDirection: "ltr" | "rtl";
  website: string;
  licenseUrl: string;
  sha256: string;
  availableFormats: string[];
  listOfBooksApiLink: string;
  completeTranslationApiLink: string;
  numberOfBooks: number;
  totalNumberOfChapters: number;
  totalNumberOfVerses: number;
}

export interface AvailableTranslationsResponse {
  translations: Translation[];
}

// -- Book -------------------------------------------------------------------

export interface Book {
  id: string;
  translationId: string;
  name: string;
  commonName: string;
  title: string;
  order: number;
  numberOfChapters: number;
  sha256: string;
  firstChapterNumber: number;
  firstChapterApiLink: string;
  lastChapterNumber: number;
  lastChapterApiLink: string;
  totalNumberOfVerses: number;
}

export interface BooksResponse {
  translation: Translation;
  books: Book[];
}

// -- Chapter content --------------------------------------------------------

/** A plain text segment inside a verse's content array. */
export interface VerseTextSegment {
  text: string;
  poem?: number;
  lineBreak?: boolean;
}

/** A footnote reference inside a verse's content array. */
export interface VerseNoteRef {
  noteId: number;
}

/**
 * A single item in a verse's `content` array.
 * Can be a plain string, a structured text segment (poetry), or a footnote ref.
 */
export type VerseContentItem = string | VerseTextSegment | VerseNoteRef;

export interface ChapterVerse {
  type: "verse";
  number: number;
  content: VerseContentItem[];
}

export interface ChapterHeading {
  type: "heading";
  content: string[];
}

export interface ChapterLineBreak {
  type: "line_break";
}

export type ChapterElement = ChapterVerse | ChapterHeading | ChapterLineBreak;

export interface Footnote {
  noteId: number;
  caller: string;
  text: string;
  reference: {
    chapter: number;
    verse: number;
  };
}

export interface AudioLinks {
  [reader: string]: string;
}

export interface ChapterResponse {
  translation: Translation;
  book: Book;
  chapter: ChapterElement[];
  thisChapterLink: string;
  thisChapterAudioLinks: AudioLinks;
  nextChapterApiLink: string | null;
  nextChapterAudioLinks: AudioLinks | null;
  previousChapterApiLink: string | null;
  previousChapterAudioLinks: AudioLinks | null;
  footnotes?: Footnote[];
}

// -- Convenience types for the app ------------------------------------------

/** A simplified verse representation for display / comparison. */
export interface SimpleVerse {
  number: number;
  text: string;
}

/** A verse range used when comparing translations side-by-side. */
export interface VerseRange {
  translationId: string;
  bookId: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  verses: SimpleVerse[];
}
