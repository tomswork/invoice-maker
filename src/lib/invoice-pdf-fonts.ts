import { Font } from "@react-pdf/renderer";
import path from "node:path";

let registered = false;

export function registerInvoicePdfFonts() {
	if (registered) {
		return;
	}

	Font.register({
		family: "Raleway",
		fonts: [
			{
				src: path.join(process.cwd(), "public/fonts/Raleway-Bold.woff"),
				fontWeight: 700,
			},
		],
	});

	registered = true;
}
