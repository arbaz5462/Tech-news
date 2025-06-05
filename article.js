// Cache configuration (same as news-service.js)
const CACHE_DURATION = 5 * 60 * 1000;
const ARTICLE_CACHE_KEY = 'article_cache_';

class ArticleService {
    constructor() {
        this.apiKey = 'c3caa51240bd45e899b68ea495c6679b';
        this.baseUrl = 'https://newsapi.org/v2/everything';
    }

    async getArticle(articleId) {
        try {
            // Try to get cached article first
            const cachedArticle = this.getCachedArticle(articleId);
            if (cachedArticle) {
                return cachedArticle;
            }

            // If not in cache, fetch from API
            const url = new URL(this.baseUrl);
            url.searchParams.append('q', articleId);
            url.searchParams.append('apiKey', this.apiKey);

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const article = data.articles[0]; // Get the first matching article

            if (article) {
                // Cache the article
                this.cacheArticle(articleId, article);
                return article;
            }

            throw new Error('Article not found');
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    }

    getCachedArticle(articleId) {
        const cached = localStorage.getItem(ARTICLE_CACHE_KEY + articleId);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }

        localStorage.removeItem(ARTICLE_CACHE_KEY + articleId);
        return null;
    }

    cacheArticle(articleId, data) {
        const cacheObject = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(ARTICLE_CACHE_KEY + articleId, JSON.stringify(cacheObject));
    }
}

// Initialize the service
const articleService = new ArticleService();

// Function to format the date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to share article
function shareArticle(platform) {
    const url = window.location.href;
    const title = document.querySelector('.article-title').textContent;
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
}

// Function to clean and format article content
function formatArticleContent(content, description) {
    if (!content) return description || 'No content available';

    // Remove the [+chars] suffix
    content = content.replace(/\[\+\d+ chars\]$/, '');

    // If content is too short, combine with description
    if (content.length < 200 && description) {
        content = `${description}\n\n${content}`;
    }

    // Split content into paragraphs and clean up
    const paragraphs = content
        .split('\n')
        .filter(p => p.trim().length > 0)
        .map(p => p.trim());

    // Format paragraphs with proper HTML
    return paragraphs
        .map(p => `<p>${p}</p>`)
        .join('');
}

// Function to extract and format article text
function extractArticleText(article) {
    let fullText = '';

    // Combine all available text content
    if (article.description) {
        fullText += article.description + '\n\n';
    }

    if (article.content) {
        // Remove the [+chars] suffix and any truncation
        const cleanContent = article.content.replace(/\[\+\d+ chars\]$/, '');
        fullText += cleanContent;
    }

    // Add source attribution
    fullText += `\n\nSource: ${article.source.name}`;
    if (article.url) {
        fullText += `\nOriginal article: ${article.url}`;
    }

    return fullText;
}

// Function to render article
async function renderArticle() {
    const container = document.querySelector('.article-detail-container');
    const template = document.getElementById('article-template');
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        container.innerHTML = '<div class="error-message">Article not found</div>';
        return;
    }

    try {
        const article = await articleService.getArticle(articleId);
        
        if (!article) {
            container.innerHTML = '<div class="error-message">Failed to load article</div>';
            return;
        }

        const content = template.content.cloneNode(true);

        // Update article content
        content.querySelector('.article-category').textContent = article.source.name;
        content.querySelector('.article-date').textContent = formatDate(article.publishedAt);
        content.querySelector('.article-title').textContent = article.title;
        content.querySelector('.source-name').textContent = article.author || article.source.name;
        
        if (article.urlToImage) {
            const mainImage = content.querySelector('.article-main-image');
            mainImage.src = article.urlToImage;
            mainImage.alt = article.title;
        }

        // Format and display the article content
        const articleDescription = content.querySelector('.article-description');
        const articleContent = content.querySelector('.article-full-content');
        
        articleDescription.innerHTML = `<p>${article.description || ''}</p>`;
        articleContent.innerHTML = formatArticleContent(article.content, article.description);

        // Add source link
        if (article.url) {
            const sourceLink = document.createElement('div');
            sourceLink.className = 'article-source-link';
            sourceLink.innerHTML = `
                <p class="read-more">
                    Read the full article at 
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.source.name}</a>
                </p>
            `;
            articleContent.appendChild(sourceLink);
        }

        // Add tags if available
        const tagsContainer = content.querySelector('.article-tags');
        const keywords = article.title
            .split(' ')
            .filter(word => word.length > 3) // Only use words longer than 3 characters
            .slice(0, 5); // Use up to 5 words as tags
        
        keywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'article-tag';
            tag.textContent = keyword;
            tagsContainer.appendChild(tag);
        });

        // Clear loading state and append content
        container.innerHTML = '';
        container.appendChild(content);

        // Update page title
        document.title = `${article.title} - TechNews Central`;

    } catch (error) {
        console.error('Error rendering article:', error);
        container.innerHTML = '<div class="error-message">Error loading article</div>';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderArticle); 