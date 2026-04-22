# 📰 Daily News AI Agent (Automated PDF Emailer)

An intelligent backend service that fetches the latest news, summarizes it using AI, converts it into a beautiful PDF, and sends it via email — automatically every day using a cron job.

---

## 🚀 Features

* 🧠 AI-powered news summarization (LangChain + Mistral)
* 🌐 Fetches real-time news using News API
* 📄 Converts formatted HTML into PDF (Puppeteer)
* 📧 Sends daily email with PDF attachment
* ⏰ Automated scheduling using Cron jobs
* 🔍 Real-time search capability via Tavily

---

**##IMAGES** 
   https://github.com/user-attachments/assets/646254a7-b20c-4afb-9779-d27629403e5b
   https://github.com/user-attachments/assets/c1bcafcb-8e19-4142-8382-b570b8936471
## 🏗️ Project Structure

```
src/
├── workers/
│   └── worker.js          # Cron job (main entry for Render worker)
│
├── services/
│   └── mail.service.js    # Email sending logic
│
├── utils/
│   └── script.js          # News fetching logic
│
├── agents/
│   └── agent.js           # AI agent setup (optional separation)
│
└── config/
    └── env.js             # Environment variables (optional)
```

---

## ⚙️ Tech Stack

* Node.js
* LangChain + Mistral AI
* Puppeteer
* Node-cron
* Tavily Search API
* Nodemailer

---

## 📦 Installation

```bash
git clone https://github.com/Ravinder-Tiwari/COHORT-2.0-Backend.git
cd COHORT-2.0-Backend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the root:

```
TAVILY_API_KEY=your_tavily_api_key
EMAIL=your_email@gmail.com
APP_PASSWORD=your_app_password
NEWS_API_KEY=your_news_api_key
```

---

## ▶️ Running Locally

```bash
node src/workers/worker.js
```

---

## ⏰ Cron Schedule

The job runs daily at **11:00 PM (Asia/Kolkata)**:

```js
cron.schedule("0 23 * * *", ...)
```

---

## ☁️ Deployment (Render)

### Recommended: Background Worker

* **Build Command:**

```
npm install
```

* **Start Command:**

```
node src/workers/worker.js
```

---

## 📄 How It Works

1. Fetch latest news articles
2. AI selects top 5 and summarizes
3. Converts output into clean HTML
4. Generates PDF using Puppeteer
5. Sends email with attachment
6. Runs automatically every day

---

## 🔗 Useful Links

* 📰 News API: https://newsapi.org/
* 🤖 Puppeteer Docs: https://pptr.dev/
* ⏰ Node-cron Docs: https://www.npmjs.com/package/node-cron
* 🔍 Tavily Search: https://tavily.com/
* 🧠 LangChain: https://js.langchain.com/

---

## ⚠️ Important Notes

* Use **App Password** for Gmail (not your actual password)
* Puppeteer must run in **headless mode on production**
* Use `puppeteer` (NOT puppeteer-core) for cloud deployment
* Ensure correct timezone for cron jobs

---

## 💡 Future Improvements

* Add user subscription system
* Dashboard for managing emails
* Store PDFs in cloud (S3, Firebase)
* Add multiple categories (Tech, Sports, Finance)

---

## 👨‍💻 Author

**Ravinder Tiwari**

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
