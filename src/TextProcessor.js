export class TextProcessor {
    processText(text) {
        const tokens = text.split(/(\s+)/);
        const processedWords = [];

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].trim().length === 0) continue;

            const wordInfo = {
                word: tokens[i].replace(/\n/g, ' ').trim(),
                followedByNewline: /\n/.test(tokens[i + 1] || ''),
            };

            const matches = wordInfo.word.match(/^(\S*?)([.,!?;:]+)?$/);
            if (matches) {
                wordInfo.word = matches[1] || '';
                wordInfo.punctuation = matches[2] || '';
            }

            processedWords.push(wordInfo);
            if (tokens[i + 1]) i++;
        }
        return processedWords.filter(w => w.word.length > 0 || w.punctuation.length > 0);
    }
}