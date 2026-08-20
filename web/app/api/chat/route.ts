import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { prisma } from "@/lib/prisma";
import { generateAIText } from "@/lib/ai";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

const SYSTEM_PROMPT = `
You are Anvesha AI.

You are a helpful AI assistant.

Rules:

- Answer the user's latest request.
- Remember the conversation.
- Use Markdown.
- For code, always use fenced code blocks.
- Be concise unless more detail is requested.

MEMORY RULES:

- Saved Memories contain trusted personal information about the user.
- Always check Saved Memories first for questions about the user.
- If a Saved Memory contains the answer, answer directly from that memory.
- Never use web search to contradict or replace a relevant Saved Memory.
- Never say you do not know something if it is clearly available in Saved Memories.
- Never claim to remember something unless it is present in the conversation or Saved Memories.

DOCUMENT RULES:

- If an uploaded document is provided, use it as the primary source for questions about that document.
- Do not replace information from the uploaded document with web search results.
- If the document does not contain the answer, say that the uploaded document does not provide enough information.

WEB SEARCH RULES:

- Use web search for current information, news, weather, current events, and topics that need fresh information.
- When WEB SEARCH RESULTS are provided, treat them as the primary source for current information.
- For questions containing "latest", "today", "current", "recent", or "now", use the supplied live search results instead of general model knowledge.
- Do not claim that your knowledge cutoff prevents you from answering when relevant live search results are available.
- Do not invent recent events, dates, announcements, or developments.
- Do not use old examples as substitutes for current developments.
- If the search results are insufficient, clearly say so.
- Mention relevant sources when appropriate.
- Do not use web search for simple personal questions already answered by Saved Memories.
- Do not use web search when an uploaded document already contains the answer.
`;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const {
      chatId,
      messages,
      document,
      webSearch,
    } = await req.json();

    // ========================================
    // 1. NORMALIZE CONVERSATION
    // ========================================

    const conversationMessages: ChatMessage[] =
      Array.isArray(messages)
        ? messages
            .filter(
              (message: unknown) =>
                message &&
                typeof message === "object" &&
                "content" in message
            )
            .map(
              (message: any): ChatMessage => ({
                role:
                  message.role === "assistant"
                    ? "assistant"
                    : "user",
                content: String(
                  message.content ?? ""
                ),
              })
            )
            .filter(
              (message) =>
                message.content.trim().length > 0
            )
        : [];

    const latestMessage =
      conversationMessages[
        conversationMessages.length - 1
      ]?.content ?? "";

    // ========================================
    // 2. LOAD SAVED MEMORIES
    // ========================================

    let memories: {
      id: number;
      content: string;
      createdAt: Date;
    }[] = [];

    try {
      memories =
        await prisma.memory.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
    } catch (error) {
      console.error(
        "Memory Load Error:",
        error
      );
    }

    let memoryContext = "";

    if (memories.length > 0) {
      memoryContext = `
SAVED MEMORIES ABOUT THE USER:

${memories
  .map(
    (memory) =>
      `- ${memory.content}`
  )
  .join("\n")}
`;
    }

    // ========================================
    // 3. DOCUMENT CONTEXT
    // ========================================

    let documentContext = "";

    if (document?.text) {
      // Keep uploaded documents reasonably sized
      // so they do not overwhelm the AI context.
      const documentText =
        String(document.text).slice(
          0,
          12000
        );

      documentContext = `
UPLOADED DOCUMENT:

Document Name: ${String(
        document.name ?? "Document"
      )}

${documentText}
`;
    }

    // ========================================
    // 4. DECIDE WHETHER WEB SEARCH IS NEEDED
    // ========================================

    const lowerQuery =
      latestMessage.toLowerCase();

    const isPersonalQuestion =
      lowerQuery.includes("my name") ||
      lowerQuery.includes("who am i") ||
      lowerQuery.includes("about me") ||
      lowerQuery.includes("my project") ||
      lowerQuery.includes("my assistant");

    const documentHasContent =
      Boolean(
        document?.text &&
          String(document.text).trim()
      );

    const shouldSkipWebSearch =
      isPersonalQuestion ||
      documentHasContent;

    // ========================================
    // 5. LIVE WEB SEARCH WITH TAVILY
    // ========================================

    let webContext = "";

    if (
      webSearch &&
      !shouldSkipWebSearch &&
      latestMessage.trim()
    ) {
      try {
        console.log(
          "TAVILY SEARCH START:",
          latestMessage
        );

        const search =
          await tvly.search(
            latestMessage,
            {
              maxResults: 3,
              searchDepth: "advanced",
              includeAnswer: true,
            }
          );

        console.log(
          "TAVILY SEARCH SUCCESS:",
          latestMessage
        );

        console.log(
          "TAVILY RESULTS:",
          search.results?.length ?? 0
        );

        // Keep search context compact enough for
        // Groq's current token-per-minute limit.
        const compactResults =
          (search.results ?? [])
            .slice(0, 3)
            .map(
              (
                result: any,
                index: number
              ) => `
SOURCE ${index + 1}

Title:
${String(
  result.title ?? ""
).slice(0, 300)}

URL:
${String(
  result.url ?? ""
).slice(0, 500)}

Content:
${String(
  result.content ?? ""
).slice(0, 1800)}
`
            )
            .join(
              "\n----------------------\n"
            );

        const searchAnswer =
          String(
            search.answer ??
              "No search answer was returned."
          ).slice(0, 2000);

        webContext = `
WEB SEARCH RESULTS:

The following information was retrieved from a live web search.

SEARCH ANSWER:

${searchAnswer}

SEARCH SOURCES:

${compactResults}

END OF WEB SEARCH RESULTS.
`;
      } catch (error) {
        console.error(
          "Tavily Search Error:",
          error
        );

        webContext = `
WEB SEARCH STATUS:

A live web search was requested, but the search failed.

Do not pretend that current web information was retrieved.

If the user's question requires current information,
clearly explain that live search was unavailable.
`;
      }
    }

    // ========================================
    // 6. LIMIT CONVERSATION CONTEXT
    // ========================================

    // Keep the complete conversation in the database,
    // but send only recent messages to the model.
    const modelConversation =
      conversationMessages.slice(-12);

    // ========================================
    // 7. LIVE SEARCH INSTRUCTIONS
    // ========================================

    const liveSearchInstruction =
      webContext
        ? `
IMPORTANT LIVE SEARCH INSTRUCTIONS:

Live web-search context is provided above.

When answering the user's current-information question:

- Use the live search results as the primary source.
- For "latest", "today", "current", "recent", or "now" questions, base the answer on those results.
- Do not substitute old training-data examples for current results.
- Do not say that a knowledge cutoff prevents you from answering when relevant live results are available.
- Do not invent facts that are absent from the search results.
- Prefer specific current developments from the supplied sources.
- Mention source names when useful.

If the web search status indicates failure:

- Do not claim that the web search succeeded.
- Clearly explain that live search was unavailable.
`
        : "";

    // ========================================
    // 8. BUILD AI MESSAGES
    // ========================================

    const aiMessages: ChatMessage[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}

${memoryContext}

${documentContext}

${webContext}

${liveSearchInstruction}`,
      },
      ...modelConversation,
    ];

    console.log(
      "AI REQUEST:",
      JSON.stringify({
        webSearch,
        latestMessage,
        conversationMessages:
          modelConversation.length,
        hasWebContext:
          Boolean(webContext),
        webContextLength:
          webContext.length,
      })
    );

    // ========================================
    // 9. GENERATE AI RESPONSE
    // ========================================

    const fullReply =
      await generateAIText(
        aiMessages,
        {
          // Groq uses GROQ_MODEL internally.
          // Ollama fallback uses llama3.2.
          model: "llama3.2",
          temperature: 0.3,
          maxTokens: 2000,
        }
      );

    if (!fullReply) {
      return NextResponse.json(
        {
          error:
            "AI returned an empty response.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // 10. SAVE ASSISTANT MESSAGE
    // ========================================

    if (chatId) {
      try {
        await prisma.message.create({
          data: {
            chatId: Number(chatId),
            role: "assistant",
            content: fullReply,
          },
        });
      } catch (error) {
        console.error(
          "Assistant Message Save Error:",
          error
        );
      }
    }

    // ========================================
    // 11. STREAM RESPONSE TO CLIENT
    // ========================================

    const encoder =
      new TextEncoder();

    const stream =
      new ReadableStream({
        async start(controller) {
          try {
            const chunkSize = 80;

            for (
              let i = 0;
              i < fullReply.length;
              i += chunkSize
            ) {
              const content =
                fullReply.slice(
                  i,
                  i + chunkSize
                );

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    response: content,
                  }) + "\n"
                )
              );
            }

            controller.close();
          } catch (error) {
            console.error(
              "Streaming Error:",
              error
            );

            controller.error(error);
          }
        },
      });

    return new Response(stream, {
      headers: {
        "Content-Type":
          "application/x-ndjson",
        "Cache-Control":
          "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(
      "Chat API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}
