import { useEffect, useRef } from 'react'
import { Copy } from 'lucide-react'

const Message = ({ message }) => {
  const objectUrls = useRef([])

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      objectUrls.current.forEach(url => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const getImageSrc = (image) => {
    if (typeof image === 'string') {
      return image
    } else if (image instanceof File || image instanceof Blob) {
      const url = URL.createObjectURL(image)
      objectUrls.current.push(url)
      return url
    } else if (image && typeof image === 'object' && image.preview) {
      return image.preview
    }
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '')
    } catch (e) {
      // ignore clipboard failures
      void e
    }
  }

  // Bot message: richer card layout
  if (message.role === 'bot') {
    return (
      <div id={message.id} className={`message bot-message ${message.loading ? 'loading' : ''} ${message.error ? 'error' : ''}`}>
        <div className="bot-card">
          <div className="bot-card-header">
            <img className="avatar" src="Story.png" alt="Bot Avatar" />
            <div className="bot-meta">

              <span className="bot-name">StoryBot</span>

              {message.loading && <span className="bot-status">Đang soạn...</span>}
              {message.error && <span className="bot-status error">Lỗi</span>}
            </div>
            <button className="copy-btn" onClick={handleCopy} aria-label="Copy reply">
              <Copy size={16} />
            </button>
          </div>
          <div className="bot-card-body">
            <p className="text">{message.content}</p>
            {message.images && message.images.length > 0 && (
              <div className="message-images">
                {message.images.map((image, index) => {
                  const imageSrc = getImageSrc(image)
                  if (!imageSrc) return null
                  return (
                    <div key={index} className="message-image">
                      <img src={imageSrc} alt={`Image ${index + 1}`} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // User message: keep compact bubble
  return (
    <div id={message.id} className={`message user-message`}>
      <div className="message-content">
        <p className="text">{message.content}</p>
        {message.images && message.images.length > 0 && (
          <div className="message-images">
            {message.images.map((image, index) => {
              const imageSrc = getImageSrc(image)
              if (!imageSrc) return null
              return (
                <div key={index} className="message-image">
                  <img src={imageSrc} alt={`Image ${index + 1}`} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default Message;