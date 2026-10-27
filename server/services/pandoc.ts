import fs from 'fs';
import {promisify} from 'util';
import {execFile as _execFile} from 'child_process';
import tmp from 'tmp';

const execFile = promisify(_execFile);
const unlink = promisify(fs.unlink);

// Filtre Lua : supprime images et figures (avec leurs légendes) et séparateurs (« * * * », « --- »),
// garde seulement le texte des liens
const STRIP_MEDIA_FILTER = `
function Image() return {} end
function Figure() return {} end
function HorizontalRule() return {} end
function Link(el) return el.content end
`;

// Traitements de texte (ODT, DOCX) : un vers = un paragraphe, et les strophes sont séparées par des
// paragraphes décoratifs (« * », « *** », « --- »…). Sans traitement, Pandoc met une ligne vide entre
// chaque vers et l'IA ne peut plus distinguer vers et strophes. Quand le document contient de tels
// séparateurs, on regroupe les paragraphes entre deux séparateurs en une strophe (vers = retours à la ligne).
const STANZA_FILTER = `
local function is_separator(block)
  if block.t == 'HorizontalRule' then return true end
  if block.t ~= 'Para' and block.t ~= 'Plain' then return false end
  return pandoc.utils.stringify(block):match('^[%s%*~%-_]+$') ~= nil
end

function Pandoc(doc)
  local has_separator = false
  for _, block in ipairs(doc.blocks) do
    if is_separator(block) then has_separator = true break end
  end
  if not has_separator then return nil end

  local blocks, verses = {}, {}
  local function flush()
    if #verses == 0 then return end
    local inlines = {}
    for i, verse in ipairs(verses) do
      if i > 1 then table.insert(inlines, pandoc.LineBreak()) end
      for _, inline in ipairs(verse) do table.insert(inlines, inline) end
    end
    table.insert(blocks, pandoc.Para(inlines))
    verses = {}
  end
  for _, block in ipairs(doc.blocks) do
    if is_separator(block) then
      flush()
    elseif block.t == 'Para' or block.t == 'Plain' then
      table.insert(verses, block.content)
    else
      flush()
      table.insert(blocks, block)
    end
  end
  flush()
  doc.blocks = blocks
  return doc
end
`;
const STANZA_FORMATS = ['odt', 'docx'];

// Extension du fichier → lecteur Pandoc, quand ils diffèrent.
// Markdown : un retour à la ligne reste un retour à la ligne (vers) et les apostrophes ne sont pas modifiées.
const PANDOC_READERS: Record<string, string> = {
    md: 'markdown+hard_line_breaks-smart',
    markdown: 'markdown+hard_line_breaks-smart',
};

export async function extractWithPandoc(file: Buffer, fromFormat: string): Promise<string> {
    // Texte brut : Pandoc n'a pas de lecteur « txt », et il n'y a rien à convertir
    if (fromFormat === 'txt') {
        return file.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    }

    // 1. On crée deux fichiers temporaires : l'ODT d'entrée et le MD intermédiaire
    const tmpIn = tmp.fileSync({postfix: `.${fromFormat}`});
    const tmpMd = tmp.fileSync({postfix: `.md`});
    const tmpFilter = tmp.fileSync({postfix: `.lua`});
    const tmpStanzaFilter = tmp.fileSync({postfix: `.lua`});
    const inPath = tmpIn.name;
    const mdPath = tmpMd.name;
    const filterPath = tmpFilter.name;
    const stanzaFilterPath = tmpStanzaFilter.name;

    try {
        // 2. On écrit le buffer ODT et le filtre Lua
        await fs.promises.writeFile(inPath, file);
        await fs.promises.writeFile(filterPath, STRIP_MEDIA_FILTER);
        await fs.promises.writeFile(stanzaFilterPath, STANZA_FILTER);

        // 3. Étape 1 : ODT → Markdown avec hard_line_breaks et wrap=preserve, sans images ni liens
        await execFile('pandoc', [
            `--from=${PANDOC_READERS[fromFormat] ?? fromFormat}`, // ex. odt
            '--to=markdown+hard_line_breaks',
            // Avant le filtre des médias, qui supprime les séparateurs « --- »
            ...(STANZA_FORMATS.includes(fromFormat) ? [`--lua-filter=${stanzaFilterPath}`] : []),
            `--lua-filter=${filterPath}`,
            '--wrap=preserve',
            '--columns=4096',
            inPath,
            '-o', mdPath
        ]);

        // 4. Étape 2 : Markdown → plain, wrap=preserve
        const {stdout, stderr} = await execFile('pandoc', [
            '--from=markdown+hard_line_breaks',
            '--to=plain',
            '--wrap=preserve',
            '--columns=4096',
            mdPath
        ]);

        // Avertissements seulement (une vraie erreur fait échouer execFile) : le texte reste exploitable
        if (stderr) {
            console.warn('pandoc stderr:', stderr);
        }

        return stdout;
    } finally {
        // 5. Nettoyage : on supprime les fichiers temporaires
        for (const path of [inPath, mdPath, filterPath, stanzaFilterPath]) {
            try {
                await unlink(path);
            } catch (e) {
                console.warn(`rm ${path}:`, e);
            }
        }
    }
}
