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
		console.log(data);
        
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
        
        const headline = document.createElement('h2');
        headline.textContent = article.title;
        articleDiv.appendChild(headline);
        
        if (article.firstSentence) {
            const firstSentence = document.createElement('p');
            firstSentence.className = 'firstSentence';
            firstSentence.textContent = article.firstSentence;
            articleDiv.appendChild(firstSentence);
        }
        
        container.appendChild(articleDiv);
    });
}

// Fetch news when page loads
fetchNews();
