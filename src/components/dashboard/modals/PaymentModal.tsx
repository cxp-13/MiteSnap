import React, { useState, useEffect } from 'react';
import { type Order, type PaymentMethod } from '@/lib/database';
import { usePaymentMethods } from '@/hooks/dashboard/usePaymentMethods';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentSuccess: (paymentMethod: string) => void;
}

type PaymentKey = 'venmo_handle' | 'cashapp_url' | 'paypal_url';

const paymentLabels: Record<PaymentKey, string> = {
  venmo_handle: 'Venmo',
  cashapp_url: 'Cash App',
  paypal_url: 'PayPal',
};

export function PaymentModal({ isOpen, onClose, order, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentKey | null>(null);
  const [serviceUserPayment, setServiceUserPayment] = useState<PaymentMethod | null>(null);
  const { paymentMethods, isLoading, loadPaymentMethods } = usePaymentMethods(order.service_user_id ?? undefined);

  useEffect(() => {
    if (isOpen && order?.service_user_id) {
      loadPaymentMethods();
      setSelectedMethod(null);
    }
    // eslint-disable-next-line
  }, [isOpen, order?.service_user_id]);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      setServiceUserPayment(paymentMethods[0]);
    }
  }, [paymentMethods]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 tracking-tight">选择支付方式</h2>
        {isLoading || !serviceUserPayment ? (
          <div className="text-center py-12 text-lg text-gray-700 font-semibold">加载支付方式...</div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 mb-8">
              {(Object.keys(paymentLabels) as PaymentKey[]).map((key) => {
                const value = serviceUserPayment[key];
                if (!value) return null;
                return (
                  <button
                    key={key}
                    className={`w-full px-5 py-3 rounded-xl border text-lg font-semibold transition-colors shadow-sm flex items-center justify-between ${selectedMethod === key ? 'bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}
                    onClick={() => setSelectedMethod(key)}
                  >
                    <span>{paymentLabels[key]}</span>
                    {selectedMethod === key && <span className="ml-2 text-green-600 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedMethod && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center border border-gray-200">
                <div className="mb-2 text-lg font-bold text-gray-900">{paymentLabels[selectedMethod]}</div>
                {selectedMethod === 'venmo_handle' && (
                  <div>
                    <div className="text-2xl font-mono text-gray-900 font-bold">@{serviceUserPayment.venmo_handle}</div>
                  </div>
                )}
                {selectedMethod === 'cashapp_url' && (
                  <a
                    href={serviceUserPayment.cashapp_url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl text-blue-700 underline break-all font-bold"
                  >
                    {serviceUserPayment.cashapp_url}
                  </a>
                )}
                {selectedMethod === 'paypal_url' && (
                  <a
                    href={serviceUserPayment.paypal_url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl text-blue-700 underline break-all font-bold"
                  >
                    {serviceUserPayment.paypal_url}
                  </a>
                )}
              </div>
            )}
            <button
              className={`w-full px-5 py-3 rounded-xl text-lg font-bold transition-colors shadow ${selectedMethod ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              disabled={!selectedMethod}
              onClick={() => {
                if (selectedMethod) {
                  onPaymentSuccess(paymentLabels[selectedMethod]);
                  onClose();
                }
              }}
            >
              已完成支付
            </button>
          </>
        )}
      </div>
    </div>
  );
} 