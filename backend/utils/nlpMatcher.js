const natural = require("natural");

const {
    extractKeywords
} = require("./nlpPreprocessor");

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const calculateCosineSimilarity = (
    text1 = "",
    text2 = ""
) => {

    const tfidf = new TfIdf();

    tfidf.addDocument(text1);
    tfidf.addDocument(text2);

    const terms = new Set([
        ...tokenizer.tokenize(text1),
        ...tokenizer.tokenize(text2)
    ]);

    let dotProduct = 0;

    let magnitude1 = 0;
    let magnitude2 = 0;

    terms.forEach(term => {

        const tfidf1 = tfidf.tfidf(term, 0);

        const tfidf2 = tfidf.tfidf(term, 1);

        dotProduct += tfidf1 * tfidf2;

        magnitude1 += tfidf1 * tfidf1;

        magnitude2 += tfidf2 * tfidf2;
    });

    magnitude1 = Math.sqrt(magnitude1);

    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
};

const generateMatchScore = (
    resumeText = "",
    jobText = ""
) => {

    const resumeKeywords = extractKeywords(resumeText);

    const jobKeywords = extractKeywords(jobText);

    const processedResume =
        resumeKeywords.join(" ");

    const processedJob =
        jobKeywords.join(" ");

    const similarity =
        calculateCosineSimilarity(
            processedResume,
            processedJob
        );

    const score =
        Math.round(similarity * 100);

const matchedSkills =
    resumeKeywords.filter(
        skill => jobKeywords.includes(skill)
    );

const missingSkills =
    jobKeywords.filter(
        skill => !resumeKeywords.includes(skill)
    );

let rankingReason = "";

if (score >= 80) {
    rankingReason =
        "Excellent skill alignment with this role.";
}
else if (score >= 60) {
    rankingReason =
        "Good match with most required skills.";
}
else if (score >= 40) {
    rankingReason =
        "Partial skill match. Some important skills are missing.";
}
else {
    rankingReason =
        "Low relevance for this role based on current resume.";
}

return {
    score: Math.min(score, 100),

    matchedSkills,

    missingSkills,

    rankingReason
};
};

module.exports = {
    generateMatchScore
};