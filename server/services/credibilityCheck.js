const axios = require('axios');

class CredibilityChecker {
    constructor() {
        this.API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
        this.API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    }

    async analyzeCredibility(article) {
        try {
            // Prepare the input for classification
            const input = {
                inputs: [
                    {
                        text: `${article.title} ${article.description}`,
                        candidate_labels: [
                            "credible news",
                            "factual reporting",
                            "opinion piece",
                            "misleading content",
                            "false information"
                        ]
                    }
                ]
            };

            // Make API request to Hugging Face
            const response = await axios.post(this.API_URL, input, {
                headers: {
                    'Authorization': `Bearer ${this.API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            // Process the results
            const result = response.data[0];
            const scores = result.scores;
            const labels = result.labels;

            // Calculate credibility score (0-100)
            const credibilityScore = this.calculateCredibilityScore(scores, labels);

            // Get trust label
            const trustLabel = this.getTrustLabel(credibilityScore);

            // Generate explanation
            const explanation = this.generateExplanation(scores, labels, credibilityScore);

            return {
                score: credibilityScore,
                label: trustLabel,
                explanation,
                confidence: Math.max(...scores),
                details: {
                    scores,
                    labels
                }
            };
        } catch (error) {
            console.error('Error analyzing credibility:', error);
            return {
                score: null,
                label: 'Unable to verify',
                explanation: 'Could not analyze the credibility of this article.',
                confidence: 0,
                details: null
            };
        }
    }

    calculateCredibilityScore(scores, labels) {
        // Convert model outputs to a 0-100 score
        const credibleIndex = labels.indexOf("credible news");
        const factualIndex = labels.indexOf("factual reporting");
        const misleadingIndex = labels.indexOf("misleading content");
        const falseIndex = labels.indexOf("false information");

        const positiveScore = (
            (credibleIndex !== -1 ? scores[credibleIndex] : 0) +
            (factualIndex !== -1 ? scores[factualIndex] : 0)
        ) / 2;

        const negativeScore = (
            (misleadingIndex !== -1 ? scores[misleadingIndex] : 0) +
            (falseIndex !== -1 ? scores[falseIndex] : 0)
        ) / 2;

        return Math.round((positiveScore - negativeScore + 1) * 50);
    }

    getTrustLabel(score) {
        if (score >= 80) return 'Highly Credible';
        if (score >= 60) return 'Credible';
        if (score >= 40) return 'Mixed';
        if (score >= 20) return 'Low Credibility';
        return 'Not Credible';
    }

    generateExplanation(scores, labels, credibilityScore) {
        const highestIndex = scores.indexOf(Math.max(...scores));
        const dominantLabel = labels[highestIndex];

        const explanations = {
            'credible news': 'This article appears to be from a reliable source with factual reporting.',
            'factual reporting': 'The content is primarily fact-based with verifiable information.',
            'opinion piece': 'This appears to be an opinion piece rather than straight news reporting.',
            'misleading content': 'This article may contain misleading or unverified claims.',
            'false information': 'This content contains claims that may be false or unsubstantiated.'
        };

        return {
            main: explanations[dominantLabel] || 'Credibility analysis is inconclusive.',
            score: `Credibility Score: ${credibilityScore}/100`,
            confidence: `Analysis Confidence: ${Math.round(scores[highestIndex] * 100)}%`
        };
    }
}

module.exports = new CredibilityChecker(); 