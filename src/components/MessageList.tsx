import React, { useState, useEffect } from 'react';
import { Star, Heart, Flag, MoreHorizontal, Play, User, Calendar, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  user_id: string;
  product_id: string | null;
  content: string;
  message_type: 'text' | 'image' | 'video';
  media_url: string | null;
  media_thumbnail: string | null;
  rating: number | null;
  is_approved: boolean;
  created_at: string;
  user_profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface MessageListProps {
  productId?: string;
  refreshTrigger?: number;
  title?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  productId, 
  refreshTrigger = 0,
  title = "Tin nhắn"
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [productId, refreshTrigger]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      } else {
        query = query.is('product_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleReportMessage = async (messageId: string) => {
    // In a real app, this would report the message for moderation
    console.log('Reporting message:', messageId);
    alert('Tin nhắn đã được báo cáo. Cảm ơn bạn đã giúp chúng tôi duy trì cộng đồng an toàn.');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {title} ({messages.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Chưa có tin nhắn nào. Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {message.user_profiles?.avatar_url ? (
                    <img
                      src={message.user_profiles.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {message.user_profiles?.full_name || 'Người dùng ẩn danh'}
                      </span>
                      {message.rating && (
                        <div className="flex items-center space-x-1">
                          {renderStars(message.rating)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message Type Indicator */}
                  <div className="flex items-center space-x-2 mb-2">
                    {message.message_type === 'image' && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <ImageIcon className="w-3 h-3" />
                        <span>Hình ảnh</span>
                      </div>
                    )}
                    {message.message_type === 'video' && (
                      <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  {message.content && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {message.content}
                    </p>
                  )}

                  {/* Media Content */}
                  {message.media_url && (
                    <div className="mb-3">
                      {message.message_type === 'image' ? (
                        <div className="relative inline-block">
                          <img
                            src={message.media_url}
                            alt="Attached image"
                            className="max-w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setExpandedMedia(expandedMedia === message.id ? null : message.id)}
                          />
                          {expandedMedia === message.id && (
                            <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                              <div className="relative max-w-4xl max-h-full">
                                <img
                                  src={message.media_url}
                                  alt="Expanded image"
                                  className="max-w-full max-h-full object-contain"
                                />
                                <button
                                  onClick={() => setExpandedMedia(null)}
                                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                                >
                                  <X className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <video
                            src={message.media_url}
                            poster={message.media_thumbnail || undefined}
                            controls
                            className="max-w-full h-48 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Actions */}
                  <div className="flex items-center space-x-4 text-sm">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blackmores-teal transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>Thích</span>
                    </button>
                    <button 
                      onClick={() => handleReportMessage(message.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Báo cáo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;