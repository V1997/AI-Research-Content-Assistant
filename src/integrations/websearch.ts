import axios from "axios";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Search the web for a query using SerpAPI.
 */
export async function webSearch(query: string) {
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
  const { data } = await axios.get(url);
  return data.organic_results?.map((r: any) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet
  })) || [];
}

/**
 * Search for company culture/info by company name.
 */
export async function searchCompanyCulture(company: string) {
  return webSearch(`${company} company culture values`);
} 