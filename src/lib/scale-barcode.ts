'use client';

export type ParsedScaleBarcode = {
	format: 'EAN13';
	type: 'weight' | 'price';
	itemCode: string; // código interno de 5 dígitos
	amount: number; // kg (weight) ou total em moeda (price)
	raw: string;
};

function isDigits(value: string): boolean {
	return /^\d+$/.test(value);
}

// Heurística comum (GS1/retail): EAN-13 iniciando com 20-29 para itens de peso/valor variável
// Estrutura típica: PP CCCCC VVVVV D
//  - PP: prefixo (20-29 => geralmente preço; 25/26 frequentemente peso)
//  - CCCCC: código do item (5 dígitos)
//  - VVVVV: valor (5 dígitos). Para peso: kg com 3 casas (ex: 00125 => 0,125 kg). Para preço: moeda com 2 casas (ex: 01234 => 123,4)
//  - D: dígito verificador (ignorado aqui)
export function parseScaleEan13(barcode: string): ParsedScaleBarcode | null {
	const code = (barcode || '').trim();
	if (code.length !== 13 || !isDigits(code)) return null;

	const prefix = code.slice(0, 2);
	const variablePrefixes = [
		'20','21','22','23','24','25','26','27','28','29',
	];
	if (!variablePrefixes.includes(prefix)) return null;

	const itemCode = code.slice(2, 7);
	const valueDigits = code.slice(7, 12);

	if (!isDigits(itemCode) || !isDigits(valueDigits)) return null;

	const valueNum = parseInt(valueDigits, 10);
	// Heurística: trate 25/26 como peso; demais como preço
	const isWeight = prefix === '25' || prefix === '26';

	if (isWeight) {
		// 5 dígitos com 3 casas decimais (kg)
		const kg = valueNum / 1000;
		return { format: 'EAN13', type: 'weight', itemCode, amount: kg, raw: code };
	}

	// Preço: 5 dígitos com 2 casas decimais (moeda)
	const total = valueNum / 100;
	return { format: 'EAN13', type: 'price', itemCode, amount: total, raw: code };
}

export function parseScaleBarcode(barcode: string): ParsedScaleBarcode | null {
	return parseScaleEan13(barcode);
}


