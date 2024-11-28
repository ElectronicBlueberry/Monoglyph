import { HyphenationFunctionAsync } from "npm:@types/hyphen";
import { loadHyphenator } from "./hyphenatorLoader.ts";
import { assert } from "@std/assert";

interface LayoutSettings {
	hyphenate: "true" | "false" | "adaptive";
	lang: string;
	text: string;
	width: number;
	align: "left" | "right" | "center" | "justify";
	addSpacesOnRight: boolean;
}

const space = " ";
const empty = "";
const separator = "-";
const paragraphSeparator = "\n\n";

export async function layout(settings: LayoutSettings) {
	const paragraphs = settings.text.split(paragraphSeparator).map((p) =>
		p.trim().replace(/\n/g, space)
	);

	const layoutedParagraphs = [] as string[];

	for (let index = 0; index < paragraphs.length; index++) {
		const paragraph = paragraphs[index];
		layoutedParagraphs.push(await layoutParagraph(paragraph, settings));
	}

	let paragraphJoiner = paragraphSeparator;

	if (settings.addSpacesOnRight) {
		paragraphJoiner = `\n${space.repeat(settings.width)}\n`;
	}

	return layoutedParagraphs.join(paragraphJoiner);
}

function stringArrayLength(arr: string[]) {
	return arr.join(empty).length;
}

const hyphenationFunctionForLanguage: Map<string, HyphenationFunctionAsync> =
	new Map();

async function hyphenate(text: string, language: string): Promise<string> {
	let hyphenationFunction = hyphenationFunctionForLanguage.get(language);

	if (!hyphenationFunction) {
		hyphenationFunction = await loadHyphenator(language);
		hyphenationFunctionForLanguage.set(language, hyphenationFunction);
	}

	return await hyphenationFunction(text, { hyphenChar: separator });
}

const adaptiveHyphenateBias = 1.2;

async function layoutParagraph(paragraph: string, settings: LayoutSettings) {
	const words = paragraph.split(space);
	words.reverse();

	const outputLines: string[] = [];
	let currentLine = empty;
	let lineWordCount = 0;
	
	while (words.length > 0) {
		const nextWord = words.pop();
		
		assert(nextWord !== undefined, "Infinite loop. Invalid array length. This state should not be reachable");

		const isStartOfLine = currentLine === empty;
		const spaceToInsert = isStartOfLine ? empty : space;
		const remainingLineSpace = settings.width - currentLine.length -
			spaceToInsert.length;

		if (nextWord.length <= remainingLineSpace) {
			currentLine += spaceToInsert + nextWord;
			lineWordCount += 1;
		} else {
			let result;

			let hyphenate = settings.hyphenate === "true";
			
			if (settings.hyphenate === "adaptive") {
				hyphenate = remainingLineSpace * adaptiveHyphenateBias > lineWordCount;
			}
			
			if ((hyphenate || isStartOfLine) && remainingLineSpace > 0) {
				result = await hyphenateToFit(
					nextWord,
					remainingLineSpace,
					settings.lang,
				);

				if (result.thisLine === empty && currentLine === empty) {
					result = splitToFit(nextWord, remainingLineSpace);
				}
			} else {
				result = {
					thisLine: empty,
					nextLine: nextWord,
				} as FittedHyphenationResult;
			}

			if (result.thisLine) {
				currentLine += spaceToInsert + result.thisLine;
			}

			switch (settings.align) {
				case "left":
					currentLine = alignLeft(currentLine, settings);
					break;

				case "right":
					currentLine = alignRight(currentLine, settings);
					break;

				case "center":
					currentLine = alignCenter(currentLine, settings);
					break;

				case "justify":
					currentLine = alignJustify(currentLine, settings);
					break;
			}

			outputLines.push(currentLine);
			currentLine = empty;
			lineWordCount = 0;
			
			if (result.nextLine !== empty) {
				words.push(result.nextLine);
			}
		}
	}

	switch (settings.align) {
		case "right":
			currentLine = alignRight(currentLine, settings);
			break;

		case "center":
			currentLine = alignCenter(currentLine, settings);
			break;

		default:
			currentLine = alignLeft(currentLine, settings);
			break;
	}

	outputLines.push(currentLine);

	return outputLines.join("\n");
}

interface FittedHyphenationResult {
	thisLine: string;
	nextLine: string;
}

/**
 * Fits a word into a given length, splitting it between syllables
 * @param word word to split
 * @param length how long the first part is allowed to be (including separator symbol)
 * @param language language flag for hyphenator
 * @returns result containing both split parts
 */
async function hyphenateToFit(
	word: string,
	length: number,
	language: string,
): Promise<FittedHyphenationResult> {
	const hyphenated = await hyphenate(word, language);
	const syllables = hyphenated.split(separator);

	for (
		let splitPosition = syllables.length - 1;
		splitPosition >= 0;
		splitPosition--
	) {
		const remainingWord = syllables.slice(0, splitPosition);
		const lengthOfRemaining = stringArrayLength(remainingWord) +
			separator.length;

		if (lengthOfRemaining <= length) {
			const otherPart = syllables.slice(splitPosition);

			let thisLine = "";

			if (remainingWord.length !== 0) {
				thisLine = remainingWord.join(empty) + separator;
			}

			return {
				thisLine,
				nextLine: otherPart.join(empty),
			};
		}
	}

	return {
		thisLine: "",
		nextLine: word,
	};
}

/**
 * Fits a word into a given length ignoring syllables
 * @param word
 * @param length
 */
function splitToFit(word: string, length: number): FittedHyphenationResult {
	const splitPosition = Math.max(Math.max(length, 1) - separator.length, 1);

	return {
		thisLine: word.slice(0, splitPosition) + separator.length,
		nextLine: word.slice(splitPosition),
	};
}

function alignLeft(text: string, settings: LayoutSettings): string {
	if (settings.addSpacesOnRight) {
		const gap = settings.width - text.length;
		return text + space.repeat(gap);
	} else {
		return text;
	}
}

function alignRight(text: string, settings: LayoutSettings): string {
	const gap = settings.width - text.length;
	return space.repeat(gap) + text;
}

function alignCenter(text: string, settings: LayoutSettings): string {
	const gap = settings.width - text.length;
	const halfGap = Math.floor(gap / 2);

	if (settings.addSpacesOnRight) {
		const rightGap = Math.ceil(gap / 2);
		return space.repeat(halfGap) + text + space.repeat(rightGap);
	} else {
		return space.repeat(halfGap) + text;
	}
}

const justifySpaceWeight = 4;
const edgeScoreMultiplier = 2;

function alignJustify(text: string, settings: LayoutSettings): string {
	const { width } = settings;
	let totalGap = width - text.length;

	const splitText = text.split(space);

	if (splitText.length === 1) {
		return text;
	}

	interface SplitTextWithMeta {
		text: string;
		addedSpaces: number;
	}

	const metaSplitText: Array<SplitTextWithMeta> = splitText.map((
		text,
	) => ({
		text,
		addedSpaces: 0,
	}));

	const findShortest = () => {
		let lowestScore = Infinity;
		let shortest: SplitTextWithMeta | null = null;

		metaSplitText.forEach((textWithMeta, index) => {
			const isFirstOrLast = index === 0 || index === metaSplitText.length - 1;
			let score = textWithMeta.text.length +
				textWithMeta.addedSpaces * justifySpaceWeight;

			if (isFirstOrLast) {
				score = score * edgeScoreMultiplier;
			}

			if (score < lowestScore) {
				lowestScore = score;
				shortest = textWithMeta;
			}
		});

		assert(
			shortest !== null,
			"No shortest word found. This state should be unreachable",
		);
		return shortest as SplitTextWithMeta;
	};

	while (totalGap > 0) {
		const shortest = findShortest();
		shortest.addedSpaces += 1;
		totalGap -= 1;
	}

	const textWithExtraSpaces = metaSplitText.map((textWithMeta, index) => {
		const isFirst = index === 0;
		const isLast = index === metaSplitText.length - 1;

		let spacesBefore = 0;
		let spacesAfter = 0;

		if (isFirst) {
			spacesAfter = textWithMeta.addedSpaces;
		} else if (isLast) {
			spacesBefore = textWithMeta.addedSpaces;
		} else {
			spacesBefore = Math.ceil(textWithMeta.addedSpaces / 2);
			spacesAfter = Math.floor(textWithMeta.addedSpaces / 2);
		}

		return space.repeat(spacesBefore) + textWithMeta.text +
			space.repeat(spacesAfter);
	});

	return textWithExtraSpaces.join(space);
}
