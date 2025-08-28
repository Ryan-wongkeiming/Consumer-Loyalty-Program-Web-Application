import React, { useState, useRef } from 'react';
import { Send, Image, Video, Star, X, Upload, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface MessageFormProps {
  productId?: string;
  onMessageSent?: () => void;
  placeholder?: string;
  showRating?: boolean;
  title?: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ 
  productId, 
  onMessageSent, 
  placeholder = "Chia sẻ suy nghĩ của bạn...",
  showRating = false,
  title = "Viết tin nhắn"
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setMessageType(type);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    setError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Kích thước hình ảnh không được vượt quá 5MB');
        return;
      }
      handleFileSelect(file, 'image');
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Kích thước video không được vượt quá 50MB');
        return;
      }
      handleFileSelect(file, 'video');
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `messages/${messageType}s/${fileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Lỗi tải lên: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const generateVideoThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Capture frame at 1 second
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            } else {
              reject(new Error('Không thể tạo thumbnail'));
            }
          }, 'image/jpeg', 0.7);
        }
      };

      video.onerror = () => reject(new Error('Không thể xử lý video'));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Bạn cần đăng nhập để gửi tin nhắn');
      return;
    }

    if (!content.trim() && !mediaFile) {
      setError('Vui lòng nhập nội dung hoặc chọn media');
      return;
    }

    if (showRating && rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let mediaUrl = null;
      let thumbnailUrl = null;

      // Upload media if present
      if (mediaFile) {
        mediaUrl = await uploadMedia(mediaFile);
        
        // Generate thumbnail for video
        if (messageType === 'video') {
          thumbnailUrl = await generateVideoThumbnail(mediaFile);
          
          // Upload thumbnail to storage
          const thumbnailBlob = await fetch(thumbnailUrl).then(r => r.blob());
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
          thumbnailUrl = await uploadMedia(thumbnailFile);
        }
      }

      // Insert message into database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          product_id: productId || null,
          content: content.trim(),
          message_type: messageType,
          media_url: mediaUrl,
          media_thumbnail: thumbnailUrl,
          rating: showRating ? rating : null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setMessageType('text');
      setRating(0);
      setSuccess('Tin nhắn đã được gửi thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMessageType('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className={`w-8 h-8 ${
          i < currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
      >
        <Star className="w-full h-full" />
      </button>
    ));
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">Bạn cần đăng nhập để gửi tin nhắn</p>
        <button className="bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors">
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating (if enabled) */}
        {showRating && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung tin nhắn *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent resize-none"
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {messageType === 'image' ? 'Hình ảnh đính kèm' : 'Video đính kèm'}
                </span>
                <button
                  type="button"
                  onClick={clearMedia}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {messageType === 'image' ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-w-full h-32 rounded"
                />
              )}
            </div>
          </div>
        )}

        {/* Media Upload Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm hover:scale-105"
          >
            <Image className="w-4 h-4" />
            <span>Thêm hình ảnh</span>
          </button>
          
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm hover:scale-105"
          >
            <Video className="w-4 h-4" />
            <span>Thêm video</span>
          </button>

          <div className="flex-1"></div>

          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !mediaFile)}
            className="flex items-center space-x-2 bg-blackmores-teal text-white px-6 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}</span>
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default MessageForm;