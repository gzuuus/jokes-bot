export const sk = Bun.env.SK as string
export const relays = JSON.parse(Bun.env.RELAYS!)

interface JokeApiResponse {
    id: string
    joke: string
    status: number
}
export async function fetchDadJoke(): Promise<string> {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'application/json',
      },
    });
  
    const data = await response.json() as JokeApiResponse;
    return data.joke;
};