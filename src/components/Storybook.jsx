import { BookOpen, MoreHorizontal, ArrowRight } from "lucide-react";
import { useState } from "react";

const Storybook = ({ onPromptClick, onFocusPrompt }) => {
  const [customMode, setCustomMode] = useState(false);

  const genres = [
    {
      id: "tinh-cam",
      title: "Tình cảm",
      prompt:
        "Hãy viết một câu chuyện ngắn đầy cảm xúc về tình yêu và sự gắn bó.",
      genre: "tình cảm",
    },
    {
      id: "kinh-di",
      title: "Kinh dị",
      prompt: "Hãy viết một câu chuyện kinh dị rùng rợn với cái kết bất ngờ.",
      genre: "kinh dị",
    },
    {
      id: "hai-huoc",
      title: "Hài hước",
      prompt: "Hãy viết một câu chuyện hài hước khiến người đọc bật cười.",
      genre: "hài hước",
    },
    {
      id: "kiem-hiep",
      title: "Kiếm hiệp",
      prompt:
        "Hãy viết một câu chuyện kiếm hiệp với những trận quyết đấu oanh liệt.",
      genre: "kiếm hiệp",
    },
  ];

  const handleGenreClick = (g) => {
    if (onPromptClick) onPromptClick({ prompt: g.prompt, genre: g.genre });
  };

  const enterCustomMode = () => {
    setCustomMode(true);
    if (onPromptClick) onPromptClick({ mode: "custom", genre: "tùy chỉnh" });
  };

  return (
    <div className="storybook-container">
      <div className="storybook-header">
        <div className="storybook-icon">
          <BookOpen size={32} />
        </div>
        <div className="storybook-title-section">
          <h1 className="storybook-title">Storybook</h1>
          <span className="experiment-tag">Thử nghiệm</span>
        </div>
      </div>

      <p className="storybook-description">
        Chọn một thể loại để bắt đầu câu chuyện. Mỗi đoạn chat sẽ được cố định
        theo thể loại đã chọn.
      </p>

      <div
        className="example-prompts"
        style={{ display: customMode ? "none" : "grid" }}
      >
        {genres.map((g) => (
          <div
            key={g.id}
            className="prompt-card"
            onClick={() => handleGenreClick(g)}
          >
            <p className="prompt-title">{g.title}</p>
            <p className="prompt-text">{g.prompt}</p>
          </div>
        ))}
      </div>

      <div className="custom-story">
        <p className="custom-label">Hoặc tạo câu chuyện của riêng bạn</p>
        {!customMode ? (
          <button
            className="ellipsis-btn"
            onClick={() => {
              enterCustomMode();
              if (onFocusPrompt) {
                setTimeout(() => onFocusPrompt(), 200);
              }
            }}
            aria-label="Tạo câu chuyện riêng"
          >
            <div className="ellipsis-col">
              <span className="ellipsis-text">Tạo câu chuyện riêng</span>
              <span className="ellipsis-sub">
                Nhập ở thanh trả lời phía dưới
              </span>
            </div>
            <span className="arrow-icon">
              <ArrowRight size={18} />
            </span>
          </button>
        ) : (
          <p className="custom-hint">
            Bạn đang tạo câu chuyện riêng. Hãy nhập yêu cầu của bạn ở thanh trả
            lời phía dưới.
          </p>
        )}
      </div>

      <p className="disclaimer">
        Các thử nghiệm có thể tạo ra kết quả không mong muốn. Hãy chia sẻ ý kiến
        phản hồi bằng nút thích/không thích.{" "}
        <a href="#" className="learn-more">
          Tìm hiểu thêm
        </a>
      </p>
    </div>
  );
};

export default Storybook;
