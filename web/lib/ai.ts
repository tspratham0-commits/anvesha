import Groq from "groq-sdk";

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

const GROQ_MODEL =
  process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function generateWithGroq(
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const groq = new Groq({
    apiKey,
  });

  const response =
    await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature:
        options?.temperature ?? 0.2,
      max_tokens:
        options?.maxTokens ?? 4000,
    });

  return (
    response.choices[0]?.message
      ?.content?.trim() ?? ""
  );
}

async function generateWithOllama(
  messages: AIMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const response = await fetch(
    OLLAMA_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        model:
          options?.model ?? "llama3.2",
        stream: false,
        messages,
        options: {
          temperature:
            options?.temperature ?? 0.2,
          num_predict:
            options?.maxTokens ?? 4000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Ollama request failed (${response.status}): ${errorText}`
    );
  }

  const data =
    await response.json();

  return (
    data.message?.content?.trim() ??
    ""
  );
}

export async function generateAIText(
  messages: AIMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const provider =
    process.env.AI_PROVIDER ?? "groq";

  if (provider === "ollama") {
    return generateWithOllama(
      messages,
      options
    );
  }

  if (provider === "groq") {
    try {
      return await generateWithGroq(
        messages,
        options
      );
    } catch (error) {
      console.error(
        "Groq failed. Falling back to Ollama:",
        error
      );

      return generateWithOllama(
        messages,
        options
      );
    }
  }

  throw new Error(
    `Unsupported AI_PROVIDER: ${provider}`
  );
}
