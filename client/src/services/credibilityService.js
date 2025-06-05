import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const analyzeArticleCredibility = async (article) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/credibility/analyze`, {
            article: {
                title: article.title,
                description: article.description,
                content: article.content,
                source: article.source.name,
                url: article.url
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error analyzing article credibility:', error);
        return {
            score: null,
            label: 'Unable to verify',
            explanation: {
                main: 'Could not analyze the credibility of this article.',
                score: 'Score: N/A',
                confidence: 'Confidence: N/A'
            }
        };
    }
};

// Cache credibility results to avoid repeated API calls
const credibilityCache = new Map();

export const getCachedCredibility = (articleId) => {
    return credibilityCache.get(articleId);
};

export const setCachedCredibility = (articleId, result) => {
    credibilityCache.set(articleId, result);
};

// Clear old cache entries periodically
setInterval(() => {
    credibilityCache.clear();
}, 30 * 60 * 1000); // Clear cache every 30 minutes 