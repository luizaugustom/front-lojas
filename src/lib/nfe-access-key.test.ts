import { extractNfeAccessKey } from './nfe-access-key';

/** Chave de acesso NF-e válida (modelo 55 nas posições 21-22). */
const KEY_55 =
  '35240714200166000187550010000000011000000015';

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
});
