// Your local API endpoint
const API_URL = '/api/news';

async function fetchNews() {
    try {
        // Fetch from your Python server
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        
        // Display the news headlines
        displayNews(data.news);
        
    } catch (error) {
        console.error('Error fetching news:', error);
        document.getElementById('news-container').innerHTML = 
            '<p>Error loading news. Please try again later.</p>';
    }
}

function displayNews(newsArray) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    
    newsArray.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'news-item';
        
        if (article.topline) {
            const topline = document.createElement('p');
            topline.className = 'topline';
            topline.textContent = article.topline;
            articleDiv.appendChild(topline);
        }
        
        const headline = document.createElement('h2');
        headline.textContent = article.title;
        articleDiv.appendChild(headline);
        
        const link = document.createElement('a');
        link.href = article.shareURL;
        link.textContent = 'Read more';
        link.target = '_blank';
        articleDiv.appendChild(link);
        
        container.appendChild(articleDiv);
    });
}

// Fetch news when page loads
fetchNews();
