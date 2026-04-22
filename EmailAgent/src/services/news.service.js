import dotenv from 'dotenv';
dotenv.config();

const apikey = process.env.NEWS_API_KEY;

export async function getNews(query = "India") {
    try {
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${apikey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            console.log("No articles found");
            return [];
        }

        // ✅ Clean + normalize data for your PDF system
        const articles = data.articles.map(article => ({
            title: article.title || "No title",
            description: article.description || "No description available",
            url: article.url || "#",
            urlToImage: article.image || "https://via.placeholder.com/600x300?text=No+Image",
            source: article.source?.name || "Unknown",
            publishedAt: article.publishedAt || ""
        }));

        return articles;

    } catch (error) {
        console.error("❌ Error fetching news:", error.message);
        return [];
    }
}