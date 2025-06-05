// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const NEWS_CACHE_KEY = 'tech_news_cache';

class NewsService {
    constructor() {
        this.apiKey = 'c3caa51240bd45e899b68ea495c6679b';
        this.baseUrl = 'https://newsapi.org/v2/everything';
        this.isLoading = false;
        console.log('NewsService initialized');
    }

    async getNews(page = 1, category = 'technology') {
        try {
            // Check if we're already loading data
            if (this.isLoading) {
                console.log('Request in progress, please wait...');
                return null;
            }

            // Try to get cached data first
            const cachedData = this.getCachedData();
            if (cachedData) {
                console.log('Found valid cache, returning cached data');
                return cachedData;
            } else {
                console.log('No valid cache found, fetching fresh data');
            }

            this.isLoading = true;
            console.log('Starting API request...');

            // Construct the API URL
            const url = new URL(this.baseUrl);
            url.searchParams.append('q', category);
            url.searchParams.append('sortBy', 'publishedAt');
            url.searchParams.append('pageSize', '20');
            url.searchParams.append('page', page);
            url.searchParams.append('apiKey', this.apiKey);

            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API request successful, caching data');

            // Cache the fresh data
            this.cacheData(data);

            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            // Try to return cached data as fallback
            const fallbackData = this.getCachedData();
            if (fallbackData) {
                console.log('Using cached data as fallback');
                return fallbackData;
            }
            console.log('No fallback data available');
            return null;
        } finally {
            this.isLoading = false;
        }
    }

    getCachedData() {
        const cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (!cached) {
            console.log('No cache found in localStorage');
            return null;
        }

        try {
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            console.log(`Cache age: ${Math.round(age / 1000)} seconds`);
            
            // Check if cache is still valid
            if (age < CACHE_DURATION) {
                console.log('Cache is valid');
                return data;
            }

            // Clear expired cache
            console.log('Cache has expired, clearing');
            localStorage.removeItem(NEWS_CACHE_KEY);
            return null;
        } catch (error) {
            console.error('Error parsing cache:', error);
            localStorage.removeItem(NEWS_CACHE_KEY);
            return null;
        }
    }

    cacheData(data) {
        try {
            const cacheObject = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cacheObject));
            console.log('Data successfully cached');
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }

    clearCache() {
        localStorage.removeItem(NEWS_CACHE_KEY);
        console.log('Cache cleared');
    }
}

// Initialize the service
const newsService = new NewsService();

// Function to format the date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to create article HTML
function createArticleHTML(article) {
    const articleId = encodeURIComponent(article.title); // Use title as ID
    return `
        <a href="article.html?id=${articleId}" class="article-card">
            <div class="article-meta">
                <span class="article-category">${article.source.name}</span>
                <span class="read-time">${formatDate(article.publishedAt)}</span>
            </div>
            ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="article-image">` : ''}
            <h2>${article.title}</h2>
            <p>${article.description || ''}</p>
        </a>
    `;
}

// Function to get trending news
async function getTrendingNews() {
    try {
        const url = new URL(newsService.baseUrl);
        url.searchParams.append('q', 'technology');
        url.searchParams.append('sortBy', 'popularity'); // Sort by popularity for trending
        url.searchParams.append('pageSize', '5');
        url.searchParams.append('apiKey', newsService.apiKey);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching trending news:', error);
        return null;
    }
}

// Function to create trending item HTML
function createTrendingItemHTML(article, index) {
    return `
        <div class="trending-item">
            <span class="trending-number">${index + 1}</span>
            <a href="article.html?id=${encodeURIComponent(article.title)}" class="trending-title">
                ${article.title}
            </a>
        </div>
    `;
}

// Function to update trending section
async function updateTrendingSection() {
    const trendingList = document.querySelector('.trending-list');
    if (!trendingList) return;

    try {
        let trendingArticles = await getTrendingNews();

        // If no trending news, get random tech news as fallback
        if (!trendingArticles || trendingArticles.length === 0) {
            const randomNews = await newsService.getNews(1, 'technology');
            trendingArticles = randomNews.articles.slice(0, 5);
        }

        if (trendingArticles && trendingArticles.length > 0) {
            trendingList.innerHTML = trendingArticles
                .map((article, index) => createTrendingItemHTML(article, index))
                .join('');
        } else {
            trendingList.innerHTML = '<div class="error-message">Unable to load trending news</div>';
        }
    } catch (error) {
        console.error('Error updating trending section:', error);
        trendingList.innerHTML = '<div class="error-message">Error loading trending news</div>';
    }
}

// Function to update the UI with news
async function updateNewsUI(page = 1) {
    const articleGrid = document.querySelector('.article-grid');
    if (!articleGrid) return;

    try {
        const newsData = await newsService.getNews(page);
        if (!newsData || !newsData.articles) return;

        // Update featured article
        const featuredArticle = newsData.articles[0];
        const featuredSection = document.querySelector('.featured-article');
        if (featuredSection && featuredArticle) {
            const articleId = encodeURIComponent(featuredArticle.title);
            featuredSection.innerHTML = `
                <a href="article.html?id=${articleId}" class="featured-article-link">
                    <div class="article-meta">
                        <span class="article-category">${featuredArticle.source.name}</span>
                        <span class="read-time">${formatDate(featuredArticle.publishedAt)}</span>
                    </div>
                    ${featuredArticle.urlToImage ? `<img src="${featuredArticle.urlToImage}" alt="${featuredArticle.title}" class="featured-image">` : ''}
                    <h1>${featuredArticle.title}</h1>
                    <p>${featuredArticle.description || ''}</p>
                </a>
            `;
        }

        // Update article grid
        articleGrid.innerHTML = newsData.articles
            .slice(1) // Skip the first article as it's used as featured
            .map(createArticleHTML)
            .join('');

        // Update trending section
        await updateTrendingSection();

    } catch (error) {
        console.error('Error updating UI:', error);
        articleGrid.innerHTML = '<div class="error-message">Error loading news. Please try again later.</div>';
    }
}

// Initialize news on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNewsUI();

    // Refresh news every 5 minutes
    setInterval(() => {
        newsService.clearCache();
        updateNewsUI();
    }, CACHE_DURATION);
}); 