'use client';

import { useState, useRef } from 'react';
import type { PaymentChoice } from '../page';

type Props = {
    payment: PaymentChoice;
    onChange: (p: PaymentChoice) => void;
    codEnabled: boolean;
    codFee: number;
    error?: string;
};

export function PaymentMethodSelector({ payment, onChange, codEnabled, codFee, error }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const CURRENCY = 'ج.م';

    // ── Upload screenshot to Supabase Storage ─────────────
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setUploadError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setUploadError('يرجى رفع صورة فقط');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/screenshot', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                onChange({ ...payment, screenshotUrl: data.url });
            } else {
                setUploadError(data.error || 'فشل في رفع الصورة');
            }
        } catch {
            setUploadError('حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    return (
        <section>
            <h2 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase mb-8">
                طريقة الدفع
            </h2>

            <div className="space-y-4">
                {/* ── InstaPay ─────────────────────────── */}
                <div>
                    <button
                        onClick={() => onChange({ method: 'instaPay', screenshotUrl: payment.method === 'instaPay' ? payment.screenshotUrl : undefined })}
                        className={`w-full text-right border transition-all duration-200 p-5 cursor-pointer ${
                            payment.method === 'instaPay'
                                ? 'border-neutral-900 border-2'
                                : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-neutral-900 mb-0.5">InstaPay</p>
                                <p className="text-xs text-neutral-500">تحويل فوري عبر إنستاباي</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                payment.method === 'instaPay' ? 'border-neutral-900' : 'border-neutral-300'
                            }`}>
                                {payment.method === 'instaPay' && (
                                    <div className="w-2 h-2 rounded-full bg-neutral-900" />
                                )}
                            </div>
                        </div>
                    </button>

                    {/* InstaPay expanded section */}
                    {payment.method === 'instaPay' && (
                        <div className="border border-t-0 border-neutral-200 p-5 space-y-5 animate-in slide-in-from-top-1 fade-in duration-300">
                            {/* Payment instructions */}
                            <div className="bg-neutral-50 p-4 space-y-2">
                                <p className="text-sm font-medium text-neutral-800">خطوات الدفع:</p>
                                <ol className="text-xs text-neutral-600 space-y-1.5 list-decimal list-inside">
                                    <li>افتح تطبيق إنستاباي من هاتفك</li>
                                    <li>قم بتحويل المبلغ المطلوب</li>
                                    <li>التقط صورة للإيصال وارفعها أدناه</li>
                                </ol>
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-3 block">
                                    إيصال التحويل
                                </label>

                                {payment.screenshotUrl ? (
                                    <div className="flex items-center gap-4 p-3 border border-green-200 bg-green-50">
                                        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-green-700 flex-1">تم رفع الإيصال بنجاح</span>
                                        <button
                                            onClick={() => onChange({ ...payment, screenshotUrl: undefined })}
                                            className="text-xs text-neutral-500 underline hover:text-neutral-900 cursor-pointer"
                                        >
                                            تغيير
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full border-2 border-dashed border-neutral-300 p-6 text-center hover:border-neutral-400 transition-colors cursor-pointer group"
                                    >
                                        {uploading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-900" />
                                                <span className="text-sm text-neutral-500">جاري الرفع...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-neutral-500">اضغط لرفع صورة الإيصال</p>
                                                <p className="text-xs text-neutral-400 mt-1">PNG, JPG — حد أقصى 5 ميجابايت</p>
                                            </>
                                        )}
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                />

                                {(uploadError || error) && (
                                    <p className="text-red-500 text-xs mt-2">{uploadError || error}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Cash on Delivery ─────────────────── */}
                {codEnabled && (
                    <button
                        onClick={() => onChange({ method: 'cashOnDelivery' })}
                        className={`w-full text-right border transition-all duration-200 p-5 cursor-pointer ${
                            payment.method === 'cashOnDelivery'
                                ? 'border-neutral-900 border-2'
                                : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-neutral-900 mb-0.5">الدفع عند الاستلام</p>
                                <p className="text-xs text-neutral-500">
                                    {codFee > 0
                                        ? `رسوم إضافية ${codFee.toLocaleString('ar-EG')} ${CURRENCY}`
                                        : 'بدون رسوم إضافية'
                                    }
                                </p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                payment.method === 'cashOnDelivery' ? 'border-neutral-900' : 'border-neutral-300'
                            }`}>
                                {payment.method === 'cashOnDelivery' && (
                                    <div className="w-2 h-2 rounded-full bg-neutral-900" />
                                )}
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </section>
    );
}
