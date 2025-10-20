// Lista de 20 versículos bíblicos famosos em português
export const VERSES: Array<{ reference: string; text: string }> = [
  { reference: 'João 3:16', text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...' },
  { reference: 'Salmos 23:1', text: 'O Senhor é o meu pastor; nada me faltará.' },
  { reference: 'Filipenses 4:13', text: 'Posso todas as coisas naquele que me fortalece.' },
  { reference: 'Jeremias 29:11', text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor...' },
  { reference: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem...' },
  { reference: 'Provérbios 3:5-6', text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento...' },
  { reference: 'Mateus 11:28', text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.' },
  { reference: 'Isaías 40:31', text: 'Mas os que esperam no Senhor renovarão as suas forças...' },
  { reference: 'Salmos 46:1', text: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.' },
  { reference: '1 Coríntios 13:4-7', text: 'O amor é paciente, o amor é bondoso; não inveja, não se vangloria...' },
  { reference: 'Salmos 119:105', text: 'Lâmpada para os meus pés é tua palavra e luz para o meu caminho.' },
  { reference: 'Mateus 6:33', text: 'Buscai primeiro o reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.' },
  { reference: 'João 14:6', text: 'Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.' },
  { reference: 'Romanos 12:2', text: 'E não vos conformeis com este mundo, mas transformai-vos pela renovação do vosso entendimento...' },
  { reference: 'Salmos 27:1', text: 'O Senhor é a minha luz e a minha salvação; a quem temerei?' },
  { reference: 'Hebreus 11:1', text: 'Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem.' },
  { reference: 'Josué 1:9', text: 'Não te ordenei eu? Sê forte e corajoso; não temas, nem te espantes...' },
  { reference: 'Salmos 37:4', text: 'Deleita-te também no Senhor, e ele concederá os desejos do teu coração.' },
  { reference: '1 Pedro 5:7', text: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.' },
  { reference: 'Efésios 2:8-9', text: 'Porque pela graça sois salvos, mediante a fé; e isto não vem de vós, é dom de Deus...' },
];

export function getRandomVerse() {
  const idx = Math.floor(Math.random() * VERSES.length);
  return VERSES[idx];
}
