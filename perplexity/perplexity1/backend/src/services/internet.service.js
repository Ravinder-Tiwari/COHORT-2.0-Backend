    import {tavily as Tavily} from "@tavily/core"

    const tvly = Tavily({
        apiKey: process.env.TAVILY_API_KEY
    });

    
    export const searchInternet = async ({query})=>{
        console.log("Searching for:", query);
        console.log("TAVILY USED")
        const result = await tvly.search(query, {
            maxResults: 5,
            searchDepth: "advanced",
        })
        return result
    }