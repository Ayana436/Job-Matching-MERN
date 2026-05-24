// Basic Stop Words List
const stopWords = [
    "the", "a", "an", "and", "or",
    "is", "are", "to", "for",
    "of", "in", "on", "with",
    "at", "by", "from"
];

// Text Cleaning Logic
export const cleanText = (text = "") => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

// Tokenizing Logic
export const tokenizeText = (text = "") => {
    return cleanText(text)
        .split(" ")
        .filter(word => word.length > 1);
};

// Stop Word Removal Logic
export const removeStopWords = (tokens = []) => {
    return tokens.filter(
        word => !stopWords.includes(word)
    );
};

// Keyword Extraction Logic
export const extractKeywords = (text = "") => {
    const tokens = tokenizeText(text);

    const filtered = removeStopWords(tokens);

    return [...new Set(filtered)];
};

