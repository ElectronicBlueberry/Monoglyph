import { parseArgs } from "@std/cli";
import { ensureFile } from "@std/fs";
import { layout } from "./layout.ts";
import { printHelp } from "./help.ts";
import { getSupportedLanguagesText } from "./hyphenatorLoader.ts";

const parsed = parseArgs(Deno.args);

if (Deno.args.length === 0 || parsed["help"]) {
	printHelp();
	Deno.exit();
}

if (parsed["lang-codes"] || parsed["lc"]) {
	console.log(getSupportedLanguagesText());
	Deno.exit();
}

const lang = (parsed["lang"] ?? parsed["l"] ?? "en-us").trim();

const alignValues = ["left", "right", "center", "justify"] as const;
let align =
	(parsed["align"] ?? parsed["a"] ?? "justify") as (typeof alignValues)[number];
align = align.trim() as (typeof alignValues)[number];

if (!alignValues.includes(align)) {
	throw new Error(
		`${align} is not a valid value for align. Valid values are: ${
			alignValues.join(", ")
		}`,
	);
}

const inPath = (parsed["in"] ?? parsed["i"]).trim();

if (!inPath) {
	throw new Error(`No input file supplied with -in`);
}

await ensureFile(inPath);

const text = await Deno.readTextFile(inPath);

const width = parsed["width"] ?? parsed["w"] ?? 80;

const hyphenateValues = ["true", "false", "adaptive"] as const;
const hyphenate = (parsed["hyphenate"] ?? parsed["h"] ?? "adaptive").trim() as (typeof hyphenateValues)[number];

if (!hyphenateValues.includes(hyphenate)) {
	throw new Error(
		`${hyphenate} is not a valid value for hyphenate. Valid values are: ${
			hyphenateValues.join(", ")
		}`,
	);
}

const addSpacesOnRight = parsed["fill-spaces"] ?? parsed["s"] ?? false;

const output = await layout({
	align,
	hyphenate,
	lang,
	text,
	width,
	addSpacesOnRight,
});

const outPath: string | null = parsed["out"] ?? parsed["o"] ?? null;

if (outPath === null) {
	console.log(output);
} else {
	await Deno.writeTextFile(outPath.trim(), output + "\n");
}
