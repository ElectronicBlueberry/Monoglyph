Monspace text layout engine.

This was a fun side project for me, not likely something I'll develop much further.

Requires Deno to run, currently no standalone compiled release, though I'll fis that in a bit.
Run `deno install`, then `deno main.ts` to view all available commands.

Supports left, center, right, and justify alignment.
Hyphenates text at syllables when the whitespace to text ratio of a line becomes too much whitespace.
Can also be forced to always or never hyphenate.

Prints output to console by default, to output to a file use `-o path_to_file.txt`

`-i` specifies the path to the input file. This is required.

`-w` specifies the desired width of the output text

`-a` sets the alignment to "left", "right", "center" or "justify" (default)

`-h` sets hyphenation to "true", "false" or "adaptive" (default)

`-l` sets the language for correct syllable hyphenation. Use `--lc` to view all available languages.

`--s` fills all remaining whitespace with space characters.
