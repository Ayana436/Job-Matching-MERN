import natural from "natural";
import { removeStopwords } from "stopword";

const tokenizer = new natural.WordTokenizer();

export const preprocessText = (text = "") => {

    // lowercase
    let processed = text.toLowerCase();

    // remove symbols/numbers
    processed = processed.replace(/[^a-zA-Z\s]/g, " ");

    // tokenize
    let tokens = tokenizer.tokenize(processed);

    // remove stopwords
    tokens = removeStopwords(tokens);

    return tokens;
};

export const calculateSimilarity = (
    resumeText,
    jobText
) => {

    const tfidf = new natural.TfIdf();

    const processedResume =
        preprocessText(resumeText).join(" ");

    const processedJob =
        preprocessText(jobText).join(" ");

    tfidf.addDocument(processedResume);
    tfidf.addDocument(processedJob);

    // cosine-like similarity using TF-IDF terms
    const resumeTerms = {};
    const jobTerms = {};

    tfidf.listTerms(0).forEach(item => {
        resumeTerms[item.term] = item.tfidf;
    });

    tfidf.listTerms(1).forEach(item => {
        jobTerms[item.term] = item.tfidf;
    });

    const allTerms = new Set([
        ...Object.keys(resumeTerms),
        ...Object.keys(jobTerms)
    ]);

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const term of allTerms) {

        const a = resumeTerms[term] || 0;
        const b = jobTerms[term] || 0;

        dotProduct += a * b;

        magnitudeA += a * a;
        magnitudeB += b * b;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    const similarity =
        dotProduct / (magnitudeA * magnitudeB);

    return Math.round(similarity * 100);
};