import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, Share2, BookOpen, Heart } from 'lucide-react';
import { getArticleById, getArticles, Article } from '../data/articles';


const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load article data from Supabase
  React.useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      
      try {
        const [articleData, allArticles] = await Promise.all([
          getArticleById(id),
          getArticles()
        ]);
        
        setArticle(articleData);
        
        // Get related articles (exclude current article)
        const related = allArticles
          .filter(a => a.id !== id)
          .slice(0, 2);
        setRelatedArticles(related);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm không tồn tại.</p>
          <Link
            to="/womens-health"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
            Quay lại Sức khỏe phụ nữ
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blackmores-teal hover:text-blackmores-teal-dark">
              Trung tâm sức khỏe
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/womens-health" className="text-blackmores-teal hover:text-blackmores-teal-dark">
              Sức khỏe phụ nữ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Bài viết</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/womens-health"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
           Quay lại Sức khỏe phụ nữ
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-80 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Header */}
          <div className="p-8">
            <div className="mb-4">
              <span className="text-sm text-blackmores-teal font-medium bg-green-50 px-3 py-1 rounded-full">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-8 space-x-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publish_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{article.read_time}</span>
              </div>
            </div>

            {/* Article Actions */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blackmores-teal transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Lưu</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>Bài viết</span>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chủ đề liên quan</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags && article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map(relatedArticle => (
                <Link
                  key={relatedArticle.id}
                  to={`/womens-health/article/${relatedArticle.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blackmores-teal transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{relatedArticle.author}</span>
                      <span>{relatedArticle.read_time}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;