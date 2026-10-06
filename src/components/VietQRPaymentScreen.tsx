import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../data/pricing';

interface VietQRPaymentScreenProps {
  orderId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  description: string;
  note?: string;
  onConfirm: () => void;
}

const VietQRPaymentScreen: React.FC<VietQRPaymentScreenProps> = ({
  orderId,
  amount,
  bankCode,
  accountNumber,
  accountName,
  description,
  note,
  onConfirm,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại mua sắm
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Hoàn tất thanh toán
            </h1>
            <p className="text-gray-600 text-sm">
              Vui lòng chuyển khoản để xác nhận đơn hàng
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-mono text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-carehub-teal">
              <span>Số tiền cần thanh toán:</span>
              <span>{formatPrice(amount)}</span>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-2 border-carehub-teal rounded-lg p-4 mb-6 bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-carehub-teal" />
              Thông tin chuyển khoản
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Ngân hàng</label>
                <p className="font-semibold text-gray-900">{bankCode === 'VBBANK' ? 'Vietcombank' : bankCode}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Số tài khoản</label>
                <p className="font-mono text-lg font-bold text-carehub-teal">{accountNumber}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Chủ tài khoản</label>
                <p className="font-semibold text-gray-900">{accountName}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Nội dung chuyển khoản</label>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200 break-all">{description}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          {note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">{note}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Hướng dẫn:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Mở ứng dụng ngân hàng hoặc truy cập Internet Banking</li>
              <li>Chuyển khoản đúng số tiền: {formatPrice(amount)}</li>
              <li>Nội dung chuyển khoản: <strong className="font-mono">{description}</strong></li>
              <li>Quay lại đây và nhấn "Tôi đã thanh toán"</li>
            </ol>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className="w-full bg-carehub-teal text-white py-4 rounded-lg font-semibold text-base hover:bg-carehub-teal-dark transition-colors"
          >
            Tôi đã thanh toán
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Chúng tôi sẽ xác nhận đơn hàng sau khi nhận được thanh toán
          </p>
        </div>
      </div>
    </div>
  );
};

export default VietQRPaymentScreen;
