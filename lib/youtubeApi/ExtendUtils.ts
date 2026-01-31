export class TriState {
	public static Yes: number = 1;
	public static Default: number = 0;
	public static No: number = -1;

	public static toString(value: TriState): string {
		switch (value) {
			case TriState.Yes:
				return "Yes";
			case TriState.No:
				return "No";
			default:
				return "Default";
		}
	}

	public static condition(value: TriState, defaultValue: boolean = false): boolean {
		return value === TriState.Default ? defaultValue : value === TriState.Yes;
	}
}

export function randomInt(max: number): number {
	return Math.floor(Math.random() * max);
}

export type Locales =
	| "ja-JP" | "ja-JP-x-dialect-kansai" | "ja-JP-x-dialect-northkyushu"
	| "en-GB" | "en-US"
	| "de-DE"
	| "es-ES" | "es-MX"
	| "fr-FR"
	| "ko-KR"
	| "pt-PT" | "pt-BR"
	| "ru-RU"
	| "ryu"
	| "yue-Hant-HK"
	| "zh-Hans-CN" | "zh-Hant-TW"

//export function randomBytes(length: number): Uint8Array {}

export function localeFixer(locale: string): string {
	switch (locale) {
		case "ja-JP":
		case "ja-JP-x-dialect-kansai":
		case "ja-JP-x-dialect-northkyushu":
		case "ryu":
			return "ja-JP";
	}
	return locale;
}

export class ExtendedArrayTools {
	public static initFill<T>(item: T, count?: number): T[] {
		const array: T[] = Array<T>(count ?? 0);
		array.fill(item, 0, count ?? 0);
		return array;
	}

	public static fillEx<T>(array: T[], item: T, start?: number, end?: number): T[] {
		const len = array.length;

		// 1. 開始インデックスの解決
		// (Array.prototype.fill のロジックを参考にしつつ、拡張用に調整)
		const relativeStart = start === undefined ? 0 : Math.trunc(start);

		// fillEx の変更点:
		// 標準の fill は Math.min(relativeStart, len) を行い、配列長で丸めるが、
		// fillEx では丸めない (ただし負のインデックスは解決する)
		const actualStart = relativeStart < 0
			? Math.max(len + relativeStart, 0)
			: relativeStart;

		// 2. 終了インデックスの解決
		const relativeEnd = end === undefined ? len : Math.trunc(end);

		// fillEx の変更点:
		// 標準の fill は Math.min(relativeEnd, len) を行うが、
		// fillEx では正の数の場合に丸めない
		const actualEnd = relativeEnd < 0
			? Math.max(len + relativeEnd, 0)
			: relativeEnd;

		// 3. 値の充填
		// 開始が終了を上回っている場合は何もしない (fill の標準動作)
		if (actualStart >= actualEnd) {
			return array;
		}

		// ループで値を代入
		for (let i = actualStart; i < actualEnd; i++) {
			array[i] = item;
		}

		return array;
	}
}
