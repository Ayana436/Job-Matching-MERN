const stopWords = [
    "the", "a", "an", "and", "or",
    "is", "are", "to", "for",
    "of", "in", "on", "with",
    "at", "by", "from"
];

const cleanText = (text = "") => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const tokenizeText = (text = "") => {
    return cleanText(text)
        .split(" ")
        .filter(word => word.length > 1);
};

const removeStopWords = (tokens = []) => {
    return tokens.filter(
        word => !stopWords.includes(word)
    );
};

const extractKeywords = (text = "") => {
    const tokens = tokenizeText(text);

    const filtered = removeStopWords(tokens);

    return [...new Set(filtered)];
};

module.exports = {
    cleanText,
    tokenizeText,
    removeStopWords,
    extractKeywords
};