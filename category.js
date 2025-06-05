// Function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to format category title
function formatCategoryTitle(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Function to update the UI with category-specific news
async function updateCategoryUI(page = 1) {
    const category = getUrlParameter('category') || 'technology';
    const articleGrid = document.querySelector('.article-grid');
    const categoryTitle = document.getElementById('categoryTitle');
    
    if (categoryTitle) {
        categoryTitle.textContent = `${formatCategoryTitle(category)} News`;
    }

    if (!articleGrid) return;

    try {
        const newsData = await newsService.getNews(page, category);
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

        // Update trending section with category-specific trending news
        await updateTrendingSection(category);

    } catch (error) {
        console.error('Error updating category UI:', error);
        articleGrid.innerHTML = '<div class="error-message">Error loading news. Please try again later.</div>';
    }
}

// Function to get category-specific trending news
async function getCategoryTrendingNews(category) {
    try {
        const url = new URL(newsService.baseUrl);
        url.searchParams.append('q', category);
        url.searchParams.append('sortBy', 'popularity');
        url.searchParams.append('pageSize', '5');
        url.searchParams.append('apiKey', newsService.apiKey);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching category trending news:', error);
        return null;
    }
}

// Function to update trending section with category-specific news
async function updateTrendingSection(category) {
    const trendingList = document.querySelector('.trending-list');
    if (!trendingList) return;

    try {
        let trendingArticles = await getCategoryTrendingNews(category);

        if (!trendingArticles || trendingArticles.length === 0) {
            const randomNews = await newsService.getNews(1, category);
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

// Initialize category page
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryUI();

    // Add active class to current category in navigation
    const currentCategory = getUrlParameter('category') || 'technology';
    document.querySelectorAll('.category-link').forEach(link => {
        if (link.href.includes(`category=${currentCategory}`)) {
            link.classList.add('active');
        }
    });

    // Refresh news every 5 minutes
    setInterval(() => {
        newsService.clearCache();
        updateCategoryUI();
    }, CACHE_DURATION);
}); 