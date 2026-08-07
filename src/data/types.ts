export type Language = "hu" | "de" | "en";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type EntryType =
  | "word"
  | "verb"
  | "sentence"
  | "grammar"
  | "number";

export type Category =
  | "basic"
  | "electrician"
  | "tools"
  | "materials"
  | "measurements"
  | "safety"
  | "workplace"
  | "grammar"
  | "numbers"
  | "pronouns"
  | "verbs"
  | "sentences";

export interface DictionaryItem {

  id: number;

  hu: string;

  de: string;

  en: string;

  type: EntryType;

  category: Category;

  subcategory: string;

  difficulty: Difficulty;

  tags: string[];

  lesson?: number;

  favorite?: boolean;

}