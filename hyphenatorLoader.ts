import type hyphen from "npm:@types/hyphen";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export const supportedLanguages = {
	afrikaans: "af",
	assamese: "as",
	belarusian: "be",
	bulgarian: "bg",
	bengali: "bn",
	catalan: "ca",
	coptic: "cop",
	czech: "cs",
	welsh: "cy",
	church_slavonic: "cu",
	danish: "da",
	german_old: "de-1901",
	german_new: "de-1996",
	german_swiss: "de-CH-1901",
	modern_greek_monotonic: "el-monoton",
	modern_greek_polytonic: "hyphen/el-polyton",
	british_english: "en-gb",
	american_english: "en-us",
	spanish: "es",
	estonian: "et",
	basque: "eu",
	finnish: "fi",
	french: "fr",
	friulan: "fur",
	irish: "ga",
	galician: "gl",
	ancient_greek: "grc",
	gujarati: "gu",
	hindi: "hi",
	croatian: "hr",
	upper_sorbian: "hsb",
	hungarian: "hu",
	armenian: "hy",
	interlingua: "ia",
	bahasa_indonesian: "id",
	icelandic: "is",
	italian: "it",
	georgian: "ka",
	kurmanji: "kmr",
	kannada: "kn",
	classic_latin: "la-x-classic",
	liturgical_latin: "la-x-liturgic",
	latin: "la",
	lithuanian: "lt",
	latvian: "lv",
	malayalam: "ml",
	mongolian: "mn-cyrl",
	mongolian_alternative_patterns: "mn-cyrl-x-lmc",
	marathi: "mr",
	multi_language_ethiopic_scripts: "mul-ethi",
	norwegian_bokmal: "nb",
	dutch: "nl",
	norwegian_norsk: "no",
	occitan: "oc",
	odia_oriya: "or",
	panjabi_punjabi: "pa",
	pali: "pi",
	polish: "pl",
	piedmontese: "pms",
	portuguese: "pt",
	romansh: "rm",
	romanian: "ro",
	russian: "ru",
	sanskrit: "sa",
	serbocroatian_cyrillic: "sh-cyrl",
	serbocroatian_latin: "sh-latn",
	slovak: "sk",
	slovenian: "sl",
	serbian: "sr-cyrl",
	swedish: "sv",
	tamil: "ta",
	telugu: "te",
	thai: "th",
	turkmen: "tk",
	turkish: "tr",
	ukrainian: "uk",
	mandarin_pinyin: "zh-latn-pinyin",
	german_new_alias: "de",
	modern_greek_alias: "el",
	us_english_alias: "en",
	multi_ethiopic_scripts_alias: "ethi",
	mongolian_alias: "mn",
	serbocroatian_alias: "sh",
	serbian_alias: "sr",
	mandarin_pinyin_alias: "zh",
} as const;

export type Hyphenator = hyphen.HyphenationFunctionAsync;

export async function loadHyphenator(languageCode: string) {
	const codes = new Set(Object.values(supportedLanguages) as string[]);

	if (!codes.has(languageCode)) {
		throw new Error(
			`"${languageCode}" is not a valid language code.\n${getSupportedLanguagesText()}`,
		);
	}

	const { hyphenate } = require(`hyphen/${languageCode}`);

	return hyphenate as Hyphenator;
}

export function getSupportedLanguagesText() {
	const supportedLanguagesString = Object.entries(supportedLanguages).map((
		[name, key],
	) => `${name}: ${key}`).join("\n");

	return `Supported languages:\n\n${supportedLanguagesString}`;
}
