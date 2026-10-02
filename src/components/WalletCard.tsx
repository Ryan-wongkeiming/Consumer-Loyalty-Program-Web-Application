import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Gift, Star, TrendingUp, Shield } from 'lucide-react';

interface WalletCardProps {
  userId: string;
  fullName: string;
  tier: 'member' | 'plus' | 'family';
  points: number;
}

/**
 * Digital member card for PWA home screen or Zalo Mini App.
 * Shows member number, tier badge, point balance, and QR code.
 */
const WalletCard: React.FC<WalletCardProps> = ({
  userId,
  fullName,
  tier,
  points,
}) => {

  const tierColors = {
    member: 'from-gray-100 to-gray-200',
    plus: 'from-blue-50 to-blue-100 border-blue-300',
    family: 'from-purple-50 to-purple-100 border-purple-300',
  };

  const tierIcons = {
    member: <User className="w-4 h-4" />,
    plus: <Star className="w-4 h-4 text-yellow-500" />,
    family: <Gift className="w-4 h-4 text-purple-600" />,
  };

  const tierLabels = {
    member: 'Thành viên',
    plus: 'Plus Member',
    family: 'Family Member',
  };

  return (
    <div className={`rounded-xl p-6 bg-gradient-to-br ${tierColors[tier]} border-2 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-carehub-teal flex items-center justify-center">
            <span className="text-white font-bold text-sm">{fullName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-600">ID: {userId.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white shadow-sm">
          {tierIcons[tier]}
          <span className="text-sm font-medium text-gray-900">{tierLabels[tier]}</span>
        </div>
      </div>

      {/* Points Balance */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Điểm thưởng</p>
            <p className="text-3xl font-bold text-carehub-teal">{points.toLocaleString('vi-VN')}</p>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">+50 điểm tháng này</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-2 text-center">Quét mã để nhân viên xác nhận thành viên</p>
        <div className="flex justify-center">
          <QRCodeSVG
            value={`carehub://member/${userId}`}
            size={128}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="H"
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <Shield className="w-5 h-5 mx-auto text-carehub-teal mb-1" />
          <p className="text-xs text-gray-600">Ưu đãi riêng</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <Gift className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-xs text-gray-600">Quà sinh nhật</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
          <p className="text-xs text-gray-600">Ưu tiên giao hàng</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
