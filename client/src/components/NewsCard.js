import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CredibilityScore from './CredibilityScore';
import { analyzeArticleCredibility } from '../services/credibilityService';

const NewsCard = ({ article }) => {
    const [credibility, setCredibility] = useState(null);

    useEffect(() => {
        const checkCredibility = async () => {
            try {
                const result = await analyzeArticleCredibility(article);
                setCredibility(result);
            } catch (error) {
                console.error('Error checking credibility:', error);
            }
        };

        checkCredibility();
    }, [article]);

    return (
        <div className="article-card">
            <div className="article-meta">
                <span className="article-category">{article.source.name}</span>
                <span className="read-time">{formatDate(article.publishedAt)}</span>
                {credibility && (
                    <CredibilityScore
                        score={credibility.score}
                        label={credibility.label}
                        explanation={credibility.explanation}
                    />
                )}
            </div>
            {article.urlToImage && (
                <img src={article.urlToImage} alt={article.title} className="article-image" />
            )}
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="article-footer">
                <Link to={`/article/${encodeURIComponent(article.title)}`} className="read-more">
                    Read More
                </Link>
            </div>
        </div>
    );
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

export default NewsCard; 