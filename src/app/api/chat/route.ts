import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, character } = await req.json();

  let systemPrompt = 'You are a creative storyteller. When given a prompt, weave a captivating and dynamic story. Keep the tone engaging and immersive.';

  if (character) {
    systemPrompt += `\n\nContext: You are telling a story about a character named ${character.name}.`;
    if (character.description) {
      systemPrompt += `\nDescription: ${character.description}`;
    }
    if (character.personality) {
      systemPrompt += `\nPersonality: ${character.personality}`;
    }
    systemPrompt += '\nEnsure the character\'s actions and dialogue are consistent with this description and personality throughout the story.';
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
  });

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          controller.enqueue(new TextEncoder().encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
