import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});

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
