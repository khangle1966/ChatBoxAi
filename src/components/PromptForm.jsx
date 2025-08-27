import { ChevronRight, Plus, Mic, X } from "lucide-react";
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import ImageUploader from "./ImageUploader";

const PromptForm = forwardRef(({ conversations, setConversations, activeConversation, generateResponse, isLoading, setIsLoading }, inputRef) => {
  const [promptText, setPromptText] = useState("");
  const internalInputRef = useRef(null);
  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 250) + "px"; // Đồng bộ với max-height
  };
  useImperativeHandle(inputRef, () => ({
    focusInput: () => {
      try {
        internalInputRef.current?.focus();
        internalInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch { }
    }
  }), []);

  const [selectedImages, setSelectedImages] = useState([]);
  const [showImageUploader, setShowImageUploader] = useState(false);

  const handleImageSelect = (files) => {
    const newImages = [...selectedImages, ...files].slice(0, 5); // Giới hạn 5 ảnh
    setSelectedImages(newImages);
  };

  const handleImageRemove = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const toggleImageUploader = () => {
    setShowImageUploader(!showImageUploader);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !promptText.trim()) return;

    setIsLoading(true);
    const currentConvo = conversations.find((convo) => convo.id === activeConversation) || conversations[0];

    // Set conversation title from first message if new chat
    let newTitle = currentConvo.title;
    if (currentConvo.messages.length === 0) {
      newTitle = promptText.length > 25 ? promptText.substring(0, 25) + "..." : promptText;
    }

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: promptText,
      images: selectedImages.length > 0 ? selectedImages : undefined,
    };

    // Create API conversation without the "thinking" message
    const apiConversation = {
      ...currentConvo,
      messages: [...currentConvo.messages, userMessage],
    };

    // Update UI with user message
    setConversations(conversations.map((conv) => (conv.id === activeConversation ? { ...conv, title: newTitle, messages: [...conv.messages, userMessage] } : conv)));

    // Clear input and images
    setPromptText("");
    setSelectedImages([]);
    setShowImageUploader(false);

    // Add bot response after short delay for better UX
    setTimeout(() => {
      const botMessageId = `bot-${Date.now()}`;
      const botMessage = {
        id: botMessageId,
        role: "bot",
        content: "",
        loading: true,
      };

      // Only update the UI with the thinking message, not the conversation for API
      setConversations((prev) => prev.map((conv) => (conv.id === activeConversation ? { ...conv, title: newTitle, messages: [...conv.messages, botMessage] } : conv)));

      // Pass the API conversation without the thinking message
      console.log('PromptForm: About to call generateResponse...');
      generateResponse(apiConversation, botMessageId);
    }, 300);
  };
  return (

    <div className="prompt-form-container">
      {/* Image Uploader */}
      {showImageUploader && (
        <div className="image-uploader-section">
          <ImageUploader
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedImages={selectedImages}
          />
        </div>
      )}

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="selected-images-preview">
          <div className="image-preview-list">
            {selectedImages.map((image, index) => {
              let imageSrc = '';

              if (typeof image === 'string') {
                imageSrc = image;
              } else if (image instanceof File || image instanceof Blob) {
                imageSrc = URL.createObjectURL(image);
              } else if (image && typeof image === 'object' && image.preview) {
                imageSrc = image.preview;
              } else {
                return null;
              }

              return (
                <div key={index} className="image-preview-item">
                  <img
                    src={imageSrc}
                    alt={`Preview ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="remove-preview-btn"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prompt Form */}
      <form className="prompt-form" onSubmit={handleSubmit}>

        <div className={`prompt-input-container ${promptText.trim() ? 'has-text' : ''}`}>
          <button type="button" className="left-addon" onClick={toggleImageUploader} aria-label="Thêm">
            <Plus size={18} />
          </button>
          <textarea
            placeholder="Message OpenAPI..."
            className="prompt-input"
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              autoResize(e.target);
            }}
            rows={1}
            style={{ resize: "none", overflow: "auto", maxHeight: "200px" }}
            required
            ref={internalInputRef}
          />
          {promptText.trim() && !isLoading ? (
            <button type="submit" className="send-material-btn" aria-label="Gửi">
              <span className="material-symbols-rounded">arrow_upward</span>
            </button>
          ) : null}

        </div>
      </form>
    </div>

  );
});
export default PromptForm;