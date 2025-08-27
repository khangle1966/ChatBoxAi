import { useEffect, useRef, useState } from "react";
import Message from "./components/Message";
import PromptForm from "./components/PromptForm";
import Sidebar from "./components/Sidebar";
import Storybook from "./components/Storybook";
import { Menu } from "lucide-react";

// Persistent instruction so the model behaves as a versatile storytelling AI
const SYSTEM_INSTRUCTIONS = `Bạn là một AI viết truyện (storybook) bậc thầy: sáng tạo, giàu cảm xúc, mạch lạc và cuốn hút.

Mục tiêu chất lượng:
- Tạo cảm giác “thật” qua chi tiết cụ thể (show, don’t tell), hình ảnh, âm thanh, mùi vị, xúc giác.
- Dẫn nhịp tự nhiên: mở chậm vừa phải, tăng nhịp ở cao trào, hạ nhịp ở kết.
- Nhân vật có mục tiêu rõ ràng, động lực hợp lý, lựa chọn có hệ quả.
- Ngôn ngữ giàu nhạc tính, câu ngắn–dài xen kẽ để tạo tiết tấu.
- Tránh sáo mòn; ưu tiên góc nhìn mới, lật nghĩa tinh tế khi phù hợp.

Cấu trúc đề xuất (có thể linh hoạt):
1) Mở: đặt bối cảnh, giới thiệu nhân vật và mong muốn (1–3 câu, gọn mà gợi).
2) Phát triển: nảy sinh xung đột/thử thách, tăng mức cược (stakes) qua chi tiết.
3) Cao trào: điểm xoay chuyển căng nhất; nhân vật buộc phải lựa chọn.
4) Kết: giải tỏa cảm xúc, để lại dư vị/ý nghĩa; có thể lắng hoặc bất ngờ nhưng hợp lý.

Giọng văn & độ dài:
- Mặc định 400–700 từ (điều chỉnh nếu người dùng yêu cầu khác).
- Tiếng Việt tự nhiên, trong sáng, dễ đọc; có thể xen thoại ngắn để sinh động.
- Ưu tiên động từ mạnh, hình ảnh giàu liên tưởng; hạn chế tính từ rườm rà.

Thể loại (được chỉ định qua “genre”):
- Tình cảm: trọng tâm cảm xúc, mối quan hệ, những lựa chọn nhỏ nhưng ý nghĩa; kết ấm áp.
- Kinh dị: bầu không khí, nhịp dồn, gợi–ẩn nhiều hơn tả trực diện; giới hạn yếu tố rùng rợn.
- Hài hước: nhịp nhanh, mồi hiểu lầm hợp lý, punchline rõ; có thể dùng plot twist cuối nhưng hợp logic.
- Kiếm hiệp: tinh thần hiệp nghĩa, danh dự, ân oán; miêu tả võ công vừa đủ, đề cao nhân cách.
- Nếu không có genre: viết theo văn phong kể chuyện hiện đại, sâu tình và giàu hình ảnh.

Kĩ thuật nâng chất nhanh:
- Neo 3 chi tiết cụ thể (đồ vật, mùi, ánh sáng) để “đóng khung” cảnh.
- Mỗi đoạn nên có ít nhất một chuyển động (hành động/nhìn/nghe/ngửi/đụng chạm).
- Mỗi nhân vật phụ nên có một nét đặc trưng nhỏ (cử chỉ, câu nói, đồ vật gắn liền).
- Tránh kể lể; chuyển sang hành động/đối thoại khi có thể.

An toàn & giới hạn:
- Tránh kỳ thị, kích động thù hằn, bạo lực đồ họa, nội dung nhạy cảm; không dùng tên thương hiệu thật.
- Tôn trọng lứa tuổi nếu người dùng nêu rõ.

Đầu ra:
- Một truyện hoàn chỉnh, không tiêu đề (trừ khi người dùng yêu cầu); trình bày thành các đoạn ngắn dễ đọc.
- Nếu người dùng đưa hình ảnh/chủ đề/phong cách, lồng ghép tự nhiên vào bối cảnh và diễn biến.`;

const App = () => {
  // Main app state
  const [isLoading, setIsLoading] = useState(false);
  const typingInterval = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth > 768
  );
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });
  const [conversations, setConversations] = useState(() => {
    try {
      // Load conversations from localStorage or use default
      const saved = localStorage.getItem("conversations");
      return saved
        ? JSON.parse(saved)
        : [{ id: "default", title: "New Chat", messages: [] }];
    } catch {
      return [{ id: "default", title: "New Chat", messages: [] }];
    }
  });
  const [activeConversation, setActiveConversation] = useState(() => {
    return localStorage.getItem("activeConversation") || "default";
  });

  useEffect(() => {
    localStorage.setItem("activeConversation", activeConversation);
  }, [activeConversation]);
  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);
  // Handle theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  // Get current active conversation
  const currentConversation =
    conversations.find((c) => c.id === activeConversation) || conversations[0];
  // Scroll to bottom of container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  // Effect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);
  const typingEffect = (text, messageId) => {
    let textElement = document.querySelector(`#${messageId} .text`);
    if (!textElement) {
      return;
    }

    // Initially set the content to empty and mark as loading
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: "", loading: true }
                : msg
            ),
          }
          : conv
      )
    );

    // Set up typing animation
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";

    clearInterval(typingInterval.current);
    typingInterval.current = setInterval(() => {
      if (wordIndex < words.length) {
        // Update the current text being displayed
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        textElement.textContent = currentText;

        // Update state with current progress
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, content: currentText, loading: true }
                    : msg
                ),
              }
              : conv
          )
        );
        scrollToBottom();
      } else {
        // Animation complete
        clearInterval(typingInterval.current);
        // Final update, mark as finished loading
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, content: currentText, loading: false }
                    : msg
                ),
              }
              : conv
          )
        );
        setIsLoading(false);
      }
    }, 40);
  };
  // Generate AI response
  const generateResponse = async (conversation, botMessageId) => {
    // Build contextual transcript from recent turns (max 4)
    const recent = (conversation.messages || []).slice(-4);
    const transcript = recent.map(m => {
      const role = m.role === "bot" ? "assistant" : m.role;
      return `${role}: ${m.content}`;
    }).join('\n');

    const inputText = `Context:\n${transcript}\n\nFollow the system instructions. Respond appropriately to the last user turn.`;

    try {
      const genreInstruction = conversation?.genre && conversation.genre !== "tùy chỉnh"
        ? `\n\nYêu cầu thể loại: Trong toàn bộ hội thoại này, hãy GIỮ ĐÚNG thể loại "${conversation.genre}" (không lẫn thể loại khác). Ưu tiên giọng điệu, mô-típ và quy ước của thể loại này.`
        : '';

      const requestBody = {
        model: "gpt-4o-mini",
        input: inputText,
        instructions: `${SYSTEM_INSTRUCTIONS}${genreInstruction}`,
        store: true,
      };

      // Check if environment variables are properly loaded
      if (!import.meta.env.VITE_OPENAI_API_URL) {
        throw new Error('API URL not configured');
      }

      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('API Key not configured');
      }

      const res = await fetch(import.meta.env.VITE_OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "API request failed");
      }

      // Extract response text from OpenAI responses API
      let responseText = "No response received";

      // Try different possible response structures
      if (data.output && Array.isArray(data.output) && data.output.length > 0) {
        const firstOutput = data.output[0];
        if (
          firstOutput.content &&
          Array.isArray(firstOutput.content) &&
          firstOutput.content.length > 0
        ) {
          const firstContent = firstOutput.content[0];
          if (firstContent.text) {
            responseText =
              typeof firstContent.text === "string"
                ? firstContent.text.trim()
                : String(firstContent.text);
          } else if (firstContent.content) {
            responseText =
              typeof firstContent.content === "string"
                ? firstContent.content.trim()
                : String(firstContent.content);
          }
        }
      } else if (data.choices && data.choices.length > 0) {
        if (data.choices[0]?.message?.content) {
          responseText = data.choices[0].message.content.trim();
        } else if (data.choices[0]?.text) {
          responseText = data.choices[0].text.trim();
        }
      } else if (data.content) {
        responseText =
          typeof data.content === "string"
            ? data.content.trim()
            : String(data.content);
      } else if (data.text && typeof data.text === "string") {
        responseText = data.text.trim();
      } else if (data.text && data.text.format) {
        if (data.text.content) {
          responseText =
            typeof data.text.content === "string"
              ? data.text.content.trim()
              : String(data.text.content);
        } else if (data.text.value) {
          responseText =
            typeof data.text.value === "string"
              ? data.text.value.trim()
              : String(data.text.value);
        }
      } else if (data.response) {
        responseText =
          typeof data.response === "string"
            ? data.response.trim()
            : String(data.response);
      } else if (data.message) {
        responseText =
          typeof data.message === "string"
            ? data.message.trim()
            : String(data.message);
      } else if (data.answer) {
        responseText =
          typeof data.answer === "string"
            ? data.answer.trim()
            : String(data.answer);
      } else {
        // Try to find any string field that might contain the response
        for (const [value] of Object.entries(data)) {
          if (typeof value === "string" && value.length > 10) {
            responseText = value.trim();
            break;
          }
        }
      }

      if (responseText === "No response received") {
        throw new Error("Failed to extract response from API");
      }

      typingEffect(responseText, botMessageId);
    } catch (error) {
      setIsLoading(false);
      updateBotMessage(botMessageId, `Error: ${error.message}`, true);
    }
  };
  // Update specific bot message
  const updateBotMessage = (botId, content, isError = false) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === botId
                ? { ...msg, content, loading: false, error: isError }
                : msg
            ),
          }
          : conv
      )
    );
  };
  return (
    <div
      className={`app-container ${theme === "light" ? "light-theme" : "dark-theme"
        }`}
    >
      <div
        className={`overlay ${isSidebarOpen ? "show" : "hide"}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <Sidebar
        conversations={conversations}
        setConversations={setConversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="main-container">
        <header className="main-header">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="sidebar-toggle"
          >
            <Menu size={18} />
          </button>
        </header>
        {currentConversation.messages.length === 0 ? (
          // Storybook container

          <Storybook
            onPromptClick={({ prompt, genre, mode }) => {
              // Create new conversation with the selected prompt and lock genre
              const newId = `conv-${Date.now()}`;
              const newConversation = {
                id: newId,
                title:
                  prompt.length > 25 ? prompt.substring(0, 25) + "..." : prompt,
                messages: [],
                genre: genre || "tùy chỉnh",
              };
              setConversations([newConversation, ...conversations]);
              setActiveConversation(newId);

              // Add the prompt as a user message
              setTimeout(() => {
                const userMessage = {
                  id: `user-${Date.now()}`,
                  role: "user",
                  content: prompt,
                };
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === newId
                      ? { ...conv, messages: [userMessage] }
                      : conv
                  )
                );

                // Generate bot response
                const botMessageId = `bot-${Date.now()}`;
                const botMessage = {
                  id: botMessageId,
                  role: "bot",
                  content: "Just a sec...",
                  loading: true,
                };
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === newId
                      ? { ...conv, messages: [userMessage, botMessage] }
                      : conv
                  )
                );


                // In custom mode, do not auto-call if prompt is empty (user will type below)
                if (
                  !mode ||
                  mode !== "custom" ||
                  (mode === "custom" && prompt)
                ) {
                  generateResponse(
                    { ...newConversation, messages: [userMessage] },
                    botMessageId
                  );
                }
              }, 100);
            }}
          />
        ) : (
          // Messages container
          <div className="messages-container" ref={messagesContainerRef}>
            {currentConversation.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        )}
        {/* Prompt input */}
        <div className="prompt-container">
          <div className="prompt-wrapper">
            <PromptForm
              conversations={conversations}
              setConversations={setConversations}
              activeConversation={activeConversation}
              generateResponse={generateResponse}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
          <p className="disclaimer-text">
            AI can make mistakes, so double-check important information.
          </p>
        </div>
      </main>
    </div>
  );
};
export default App;