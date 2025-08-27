import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUploader = ({ onImageSelect, onImageRemove, selectedImages = [] }) => {
	const [isDragOver, setIsDragOver] = useState(false)
	const fileInputRef = useRef(null)

	const handleFileSelect = (files) => {
		const imageFiles = Array.from(files).filter(file => 
			file.type.startsWith('image/')
		)
		
		if (imageFiles.length > 0) {
			onImageSelect(imageFiles)
		}
	}

	const handleDragOver = (e) => {
		e.preventDefault()
		setIsDragOver(true)
	}

	const handleDragLeave = (e) => {
		e.preventDefault()
		setIsDragOver(false)
	}

	const handleDrop = (e) => {
		e.preventDefault()
		setIsDragOver(false)
		const files = e.dataTransfer.files
		handleFileSelect(files)
	}

	const handleFileInputChange = (e) => {
		const files = e.target.files
		handleFileSelect(files)
		// Reset input value để có thể chọn lại cùng file
		e.target.value = ''
	}

	const openFileDialog = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className="image-uploader">
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*"
				onChange={handleFileInputChange}
				style={{ display: 'none' }}
			/>

			{/* Upload area */}
			<div
				className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={openFileDialog}
			>
				<Upload size={24} />
				<p>Kéo thả ảnh vào đây hoặc click để chọn</p>
				<span className="upload-hint">Hỗ trợ: JPG, PNG, GIF (tối đa 5 ảnh)</span>
			</div>

			{/* Selected images preview */}
			{selectedImages.length > 0 && (
				<div className="selected-images">
					<h4>Ảnh đã chọn ({selectedImages.length}/5):</h4>
					<div className="image-grid">
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
								<div key={index} className="image-preview">
									<img 
										src={imageSrc} 
										alt={`Preview ${index + 1}`}
									/>
									<button
										className="remove-image-btn"
										onClick={() => onImageRemove(index)}
										type="button"
									>
										<X size={16} />
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	)
}

export default ImageUploader
