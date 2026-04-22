import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage, createAgent, tool } from "langchain"
import { ChatMistralAI } from "@langchain/mistralai";
import * as z from "zod"
import { searchInternet } from "./internet.service.js";
import { sendEmail } from "./mail.service.js"
import { de } from "zod/v4/locales";


const modelMistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
});

const modelGemini = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite-preview",
  apiKey: process.env.GEMINI_API_KEY
});

const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description: "Use this tool to get the latest information from the internet",
    schema: z.object({
      query: z.string().describe("The search query to find relevant information")
    })
  }
)

const emailTool = tool(
  sendEmail,
  {
    name: "sendEmail",
    description: "Use this tool to send an email",
    schema: z.object({
      to: z.string().describe("The recipient's email address"),
      html: z.string().describe("The HTML content of the email"),
      subject: z.string().describe("The subject of the email"),
    })
  }
)

const agent = createAgent({
  model: modelMistral,
  tools: [searchInternetTool, emailTool],
  systemPrompt: `
You are a smart AI assistant.

RULES:
- If the user asks for latest/current info → use searchInternet tool.
- If the user asks to send email → use sendEmail tool.
- If BOTH are needed:
  1. First use searchInternet
  2. Then summarize results
  3. Then send via sendEmail

- Always use tools when required.
- Do NOT guess current information.
`
});


export async function generateResponse(messages) {
  
  const response = await agent.invoke({
    messages: messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    })
  });

  console.log("FULL RESPONSE:", response);

  // ✅ DO NOT break structure inside agent flow
  const lastMessage = response.messages.at(-1);

  return lastMessage?.content || "No response";
}

export async function generateChatTitle(message) {

  const response = await modelMistral.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and relevant titles for chat conversations based on the user's message. The title should be 10-15 letters long and capture the essence of the conversation.`),
    new HumanMessage("Generate a title for a chat conversatio based of the following first message" + message)
  ])
  return response.text
}



// export async function testAi(){
//     model.invoke("explain the conflict of USa and iran")
//     .then((response)=>{
//         console.log(response.text)
//     })
// }

// import { ChatMistralAI } from "@langchain/mistralai";

// const model = new ChatMistralAI({
// model: "mistral-small-latest",
// });
// let messages = []
// export async function testAi(req,res){
//     const response = await model.invoke("what is perplexity?")
//     console.log(response.text) 
// }
