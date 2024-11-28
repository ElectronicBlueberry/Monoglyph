type Setting = {
	name: string;
	flag: `-${string}`;
	values?: string[];
	value: string | null;
	description?: string;
};

function getDefaultSettings(): Setting[] {
	return [
		{
			name: "Align",
			flag: "-a",
			values: ["left", "center", "right", "justify"],
			value: "justify",
			description: "How to align the output text",
		},
		{
			name: "Text",
			flag: "-t",
			value: "",
			description:
				"Text to process. Alternatively, use an input file by supplying a '-i' argument",
		},
		{
			name: "Input File",
			flag: "-i",
			value: "",
			description: "Path to input text file to process",
		},
		{
			name: "Output File",
			flag: "-o",
			value: "",
			description:
				"Where to save the output. If no path is provided, output is printed to the console",
		},
		{
			name: "Width",
			flag: "-w",
			value: "80",
			description:
				"How many chars the formatted text should take up horizontally",
		},
	];
}

export function parseArgs(args: string[]): Setting[] {
	const defaultSettings = getDefaultSettings();

	const parsed = defaultSettings.map((setting) => {
		const index = args.findIndex((s) => s.toLowerCase() === setting.flag);
		const parsedSetting = { ...setting };

		if (index !== -1) {
			const value = args[index + 1];

			if (!value) {
				console.error(`No value provided for argument flag ${setting.flag}`);
			} else {
				if (setting.values && !setting.values.includes(value)) {
					console.error(`"${value}" is not a valid value for ${setting.flag}`);
				} else {
					parsedSetting.value = value;
				}
			}
		}

		return parsedSetting;
	});

	return parsed;
}
