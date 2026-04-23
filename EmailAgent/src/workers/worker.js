import "dotenv/config"
import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, tool, createAgent } from "langchain";
import { sendEmail } from "../services/mail.service.js";
import * as z from "zod";
import { tavily } from "@tavily/core";
import { getNews } from "../services/news.service.js";
import cron from "node-cron";
import puppeteer from "puppeteer";
import fs from "fs";

export function worker() {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

    const emailTool = tool(
        sendEmail,
        {
            name: "emailTool",
            description: "Use this tool to send an email",
            schema: z.object({
                to: z.string().describe("The recipient's email address"),
                html: z.string().describe("The HTML content of the email"),
                subject: z.string().describe("The subject of the email"),
            })
        }
    )

    const tavilyTool = tool(
        async ({ query }) => {
            const result = await tvly.search(query);

            return result.results
                ?.map(r => r.content)
                .join("\n\n") || "No results found";
        },
        {
            name: "tavilySearch",
            description:
                "Use this tool for current events, news, real-time data, or recent information from the internet.",
            schema: z.object({
                query: z.string().describe("The search query"),
            }),
        }
    );


    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    // });

    const model = new ChatMistralAI({
        model: "mistral-small-latest",
    })


    const agent = createAgent({
        model,
        tools: [emailTool, tavilyTool],
        systemPrompt: `
    You are a smart assistant.

    - If the user asks about current events, news, latest updates, or real-time information → ALWAYS use tavilySearch tool.
    - If the question is general knowledge, coding, or explanation → answer directly.
    - Use tools only when necessary.
    `,
    });

    const isProduction = true

    async function generatePDF(htmlContent) {

        // const browser = await puppeteer.launch(isProduction
        //     ? {
        //         headless: true,
        //         args: ["--no-sandbox", "--disable-setuid-sandbox"],
        //     }
        //     : {
        //         executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        //         headless: true,
        //     });

        const browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "domcontentloaded", // ✅ faster & safe
            timeout: 0 // ✅ disable timeout
        });

        await page.emulateMediaType("screen");

        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map(img => {
                    if (img.complete) return;
                    return new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    });
                })
            );
        });


        const filePath = "/tmp/news.pdf";

        await page.pdf({
            path: filePath,
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        return filePath;
        
    }

    // ==============================
    // FUNCTION: SEND DAILY NEWS
    // ==============================
    async function sendDailyNews(email) {
        try {
            const articles = await getNews();

            if (!Array.isArray(articles) || !articles.length) {
                console.log("No news found");
                return;
            }

            const newsText = articles.map((a, i) => `
${i + 1}.
Title: ${a.title}
Description: ${a.description}
Image: ${a.urlToImage || "https://via.placeholder.com/600x300?text=No+Image"}
Link: ${a.url}
`).join("\n");

            // 1. Get HTML from AI
            const response = await agent.invoke({
                messages: [
                    new HumanMessage(`
You are a professional news analyst.

From the following news:

${newsText}

Tasks:
1. Select top 5 important news
2. Summarize each in 2 lines
3. Assign category
4. Convert into BEAUTIFUL HTML

STRICT REQUIREMENTS:
- Each news must include:
  ✅ Title
  ✅ Summary
  ✅ Category
  ✅ Image (use <img src="IMAGE_URL" />)
  ✅ Clickable link (use <a href="URL">Read more</a>)
- Make it visually appealing (cards, spacing, clean layout)
- Images should be properly sized (not too big)

Return ONLY HTML.
`)
                ]
            });

            const rawHtml = response.messages[response.messages.length - 1].content;

            // ✅ remove markdown if present
            const htmlContent = rawHtml.replace(/```html|```/g, "").trim();
            console.log(htmlContent)
            // 2. Convert HTML → PDF
            const pdfPath = await generatePDF(htmlContent);
            // console.log(pdfPath)
            // 3. Send PDF using your email service
            await sendEmail({
                to: email,
                subject: "📰 Daily News Digest PDF",
                html: "<p>Please find attached your daily news digest.</p>",
                attachments: [
                    {
                        filename: "news.pdf",
                        path: pdfPath,
                    },
                ],
            });

            console.log("✅ PDF sent successfully");

        } catch (err) {
            console.error("❌ Error:", err);
        }
    }


    // ==============================
    // RUN FUNCTION
    // ==============================
    cron.schedule("11 17 * * *", async () => {
        console.log("⏰ Running Daily News Job (1:50 PM)");
        await sendDailyNews("ravindertiwari373@gmail.com");
    }, {
        timezone: "Asia/Kolkata"
    });

}
