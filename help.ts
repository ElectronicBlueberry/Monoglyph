export function printHelp() {
	const helpText = `Available command line options:

   -in (-i) required. path to input file
   -out (-o) path to output file
   -align (-a) default: "justify". values: "left", "right", "center", "justify"
   -width (-w) how many chars the result should be wide
   -lang (-l) language code for input file. needed for hyphenation
   -hyphenate (-h) default: "adaptive". values: "true", "false", "adaptive"
   --fill-spaces (--s) if specified, fills all gaps with spaces
   --help view this text
   --lang-codes (--lc) show all available language codes
   `;

	console.log(helpText);
}
