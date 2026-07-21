import {
  calcNfeAccessKeyDv,
  expandNfeAccessKeyCandidates,
  extractNfeAccessKey,
  normalizeNfeAccessKeyDigits,
} from './nfe-access-key';

function buildValidKey(partialWithoutDv: {
  uf: string;
  aamm: string;
  cnpj: string;
  modelo: string;
  serie: string;
  nNF: string;
  tpEmis: string;
  cNF: string;
}): string {
  const body =
    partialWithoutDv.uf +
    partialWithoutDv.aamm +
    partialWithoutDv.cnpj +
    partialWithoutDv.modelo +
    partialWithoutDv.serie +
    partialWithoutDv.nNF +
    partialWithoutDv.tpEmis +
    partialWithoutDv.cNF;
  expect(body).toHaveLength(43);
  return `${body}${calcNfeAccessKeyDv(body)}`;
}

const KEY_55 = buildValidKey({
  uf: '35',
  aamm: '2407',
  cnpj: '14200166000187',
  modelo: '55',
  serie: '001',
  nNF: '000000001',
  tpEmis: '1',
  cNF: '00000001',
});
const INVALID_READER_PREFIX = '23422607008426020001550040002413571704147317';

describe('extractNfeAccessKey', () => {
  it('retorna null para entrada vazia ou curta demais', () => {
    expect(extractNfeAccessKey('')).toBeNull();
    expect(extractNfeAccessKey('12345')).toBeNull();
  });

  it('aceita chave com exatamente 44 dígitos', () => {
    expect(extractNfeAccessKey(KEY_55)).toBe(KEY_55);
  });

  it('aceita chave formatada em blocos de 4', () => {
    const formatted = KEY_55.match(/.{1,4}/g)!.join(' ');
    expect(extractNfeAccessKey(formatted)).toBe(KEY_55);
  });

  it('ignora prefixo AIM de leitores de código de barras (ex.: ]C1)', () => {
    expect(extractNfeAccessKey(`]C1${KEY_55}`)).toBe(KEY_55);
  });

  it('extrai chave de URL/QR Code com parâmetro chNFe', () => {
    const url = `https://www.nfe.fazenda.gov.br/portal/consulta.aspx?chNFe=${KEY_55}&nVersao=100&tpAmb=1`;
    expect(extractNfeAccessKey(url)).toBe(KEY_55);
  });

  it('extrai chave de QR NFC-e com parâmetro p=', () => {
    const qr = `https://www.fazenda.sp.gov.br/nfce/qrcode?p=${KEY_55}|2|1|1|ABCDEF`;
    expect(extractNfeAccessKey(qr)).toBe(KEY_55);
  });

  it('quando há dígitos extras, prefere a janela com modelo 55/65', () => {
    expect(extractNfeAccessKey(`9${KEY_55}123`)).toBe(KEY_55);
  });

  it('ignora janela inválida antes da chave completa enviada pelo leitor', () => {
    expect(extractNfeAccessKey(`${INVALID_READER_PREFIX}${KEY_55}`)).toBe(KEY_55);
  });

  it('não aceita uma sequência de 44 dígitos com período inválido', () => {
    expect(extractNfeAccessKey(INVALID_READER_PREFIX)).toBeNull();
    expect(expandNfeAccessKeyCandidates(INVALID_READER_PREFIX)).toEqual([]);
  });

  it('não acrescenta UF a uma leitura com 42 dígitos', () => {
    const withoutUf = KEY_55.slice(2);
    expect(extractNfeAccessKey(withoutUf)).toBeNull();
  });

  it('não expande leitura com 42 dígitos', () => {
    const withoutUf = KEY_55.slice(2);
    expect(expandNfeAccessKeyCandidates(withoutUf)).toEqual([]);
  });

  it('não acrescenta DV a uma leitura com 43 dígitos', () => {
    const withoutDv = KEY_55.slice(0, 43);
    expect(normalizeNfeAccessKeyDigits(withoutDv)).toBeNull();
  });
});
