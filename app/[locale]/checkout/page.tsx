'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Nav from '../../sections/nav';
import Footer from '../../sections/footer';
import { useCart } from '@/components/contexts/CartContext';
import { CustomerInfoForm } from './_components/CustomerInfoForm';
import { PaymentMethodSelector } from './_components/PaymentMethodSelector';
import { OrderSummary } from './_components/OrderSummary';

// ─── Types ────────────────────────────────────────────────────

export type CustomerInfo = {
    firstName: string;
    lastName: string;
    address: string;
    moreInfo: string;
    governorate: string;
    city: string;
    phone: string;
    email: string;
    lat?: number;
    lng?: number;
};

export type PaymentChoice = {
    method: 'instaPay' | 'cashOnDelivery';
    screenshotUrl?: string;
};

export type GovernoratePricingData = {
    governorate: string;
    shipping_cost: number;
    cod_fee: number;
    is_active: boolean;
};

// ─── Page ─────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';
    const { state, totalPrice, totalItems, clearCart, isLoaded } = useCart();

    // ── State ───────────────────────────────────────────────
    const [customer, setCustomer] = useState<CustomerInfo>({
        firstName: '', lastName: '', address: '', moreInfo: '',
        governorate: '', city: '', phone: '', email: '',
    });

    const [payment, setPayment] = useState<PaymentChoice>({ method: 'instaPay' });

    const [governoratePricing, setGovernoratePricing] = useState<GovernoratePricingData[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);

    const [paymentSettings, setPaymentSettings] = useState({ codEnabled: true, instaPayEnabled: true });

    // ── Redirect if cart is empty ─────────────────────────────
    useEffect(() => {
        if (!isSuccess && isLoaded && state.items.length === 0) {
            router.replace(`/${locale}/cart`);
        }
    }, [isLoaded, state.items.length, router, locale, isSuccess]);

    // ── Fetch governorate pricing ─────────────────────────────
    useEffect(() => {
        fetch('/api/governorate-pricing')
            .then(r => r.json())
            .then(data => {
                if (data.success) setGovernoratePricing(data.pricing);
            })
            .catch(() => { });
    }, []);

    // ── Fetch payment settings ────────────────────────────────
    useEffect(() => {
        fetch('/api/admin/payment-settings')
            .then(r => r.json())
            .then(data => {
                if (data.success) setPaymentSettings(data.settings);
            })
            .catch(() => { });
    }, []);

    // ── Re-validate stock on checkout mount ───────────────────
    const [stockWarning, setStockWarning] = useState('');

    useEffect(() => {
        if (!isLoaded || state.items.length === 0) return;

        const validateStock = async () => {
            try {
                for (const item of state.items) {
                    const res = await fetch(`/api/products/stock?id=${item.id}`);
                    if (!res.ok) continue;
                    const data = await res.json();
                    if (!data.success) continue;

                    // Check variant stock or product stock
                    let available = data.stock;
                    if (item.variant?.attributes && data.variants) {
                        const attrs = item.variant.attributes;
                        const variant = data.variants.find((v: { attributes: Record<string, string>; stock: number }) => {
                            const keys = Object.keys(attrs);
                            return keys.length === Object.keys(v.attributes || {}).length &&
                                keys.every(k => v.attributes[k] === attrs[k]);
                        });
                        if (variant) available = variant.stock;
                    }

                    if (item.quantity > available) {
                        if (available <= 0) {
                            setStockWarning(`"${item.name}" نفذ من المخزون. يرجى إزالته من السلة.`);
                        } else {
                            setStockWarning(`"${item.name}" — متبقي ${available} فقط. يرجى تعديل الكمية.`);
                        }
                        return;
                    }
                }
                setStockWarning('');
            } catch {
                // Silent fail — the server-side check is the real guard
            }
        };

        validateStock();
    }, [isLoaded, state.items]);

    // ── Location detection handler ────────────────────────────
    const handleLocationDetected = (governorate: string, city: string, lat?: number, lng?: number) => {
        setCustomer(prev => ({
            ...prev,
            governorate: governorate || prev.governorate,
            city: city || prev.city,
            lat,
            lng,
        }));
    };

    // ── Computed pricing ──────────────────────────────────────
    const selectedPricing = governoratePricing.find(
        g => g.governorate === customer.governorate
    );

    const shippingCost = selectedPricing?.shipping_cost ?? 0;
    const codFee = payment.method === 'cashOnDelivery' ? (selectedPricing?.cod_fee ?? 0) : 0;
    const subtotal = totalPrice;
    const total = subtotal + shippingCost + codFee - promoDiscount;

    // ── Promo validation ──────────────────────────────────────
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoError('');

        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, subtotal }),
            });
            const data = await res.json();

            if (data.success) {
                setPromoDiscount(data.discount.discountAmount);
                setPromoApplied(true);
            } else {
                setPromoError(data.error);
                setPromoDiscount(0);
                setPromoApplied(false);
            }
        } catch {
            setPromoError('فشل في التحقق من الكود');
        }
    };

    // ── Form validation ───────────────────────────────────────
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!customer.firstName.trim()) errors.firstName = 'الاسم الأول مطلوب';
        if (!customer.lastName.trim()) errors.lastName = 'اسم العائلة مطلوب';
        if (!customer.address.trim()) errors.address = 'العنوان مطلوب';
        if (!customer.governorate) errors.governorate = 'المحافظة مطلوبة';
        if (!customer.city) errors.city = 'المدينة مطلوبة';
        if (!customer.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
        if (customer.phone && !/^01[0125]\d{8}$/.test(customer.phone.replace(/\s/g, ''))) {
            errors.phone = 'رقم الهاتف غير صحيح';
        }
        if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
            errors.email = 'البريد الإلكتروني غير صحيح';
        }

        if (payment.method === 'instaPay' && !payment.screenshotUrl) {
            errors.screenshot = 'يرجى رفع صورة إيصال التحويل';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Submit order ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    deliveryMethod: 'home',
                    paymentMethod: payment.method,
                    transactionScreenshot: payment.screenshotUrl,
                    promoCode: promoApplied ? promoCode : undefined,
                    discountAmount: promoDiscount,
                    items: state.items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        attributes: item.variant?.attributes,
                        image: item.image,
                    })),
                    subtotal,
                    shippingCost,
                    codFee,
                    totalAmount: total,
                    lat: customer.lat,
                    lng: customer.lng,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                clearCart();
                router.push(`/${locale}/checkout/confirmation?orderId=${data.order.orderId}`);
            } else {
                setSubmitError(data.error || 'فشل في إنشاء الطلب');
            }
        } catch {
            setSubmitError('حدث خطأ. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSuccess && state.items.length === 0) {
        return null;
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white">
            <Nav />

            <div className="pt-24 pb-20">
                <div className="max-w-6xl mx-auto px-6">

                    {/* ── Header ───────────────────────── */}
                    <div className="mb-12">
                        <h1 className="text-2xl font-light tracking-wide text-neutral-900 mb-1">
                            إتمام الطلب
                        </h1>
                        <p className="text-sm text-neutral-400">
                            أكمل بياناتك لإتمام عملية الشراء
                        </p>
                    </div>

                    {/* ── Two-column layout ────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

                        {/* ── LEFT: Form sections ──────── */}
                        <div className="space-y-14">
                            {/* Customer form fields */}
                            <section>
                                <CustomerInfoForm
                                    customer={customer}
                                    onChange={setCustomer}
                                    errors={formErrors}
                                    onLocationDetected={handleLocationDetected}
                                />
                            </section>

                            {/* Payment method */}
                            <PaymentMethodSelector
                                payment={payment}
                                onChange={setPayment}
                                codEnabled={paymentSettings.codEnabled}
                                codFee={codFee}
                                error={formErrors.screenshot}
                            />
                        </div>

                        {/* ── RIGHT: Order Summary ─────── */}
                        <div className="lg:sticky lg:top-24 self-start">
                            {/* Stock warning */}
                            {stockWarning && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                                    ⚠️ {stockWarning}
                                </div>
                            )}

                            <OrderSummary
                                items={state.items}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                codFee={codFee}
                                promoDiscount={promoDiscount}
                                total={total}
                                promoCode={promoCode}
                                promoApplied={promoApplied}
                                promoError={promoError}
                                onPromoChange={setPromoCode}
                                onPromoApply={handleApplyPromo}
                                onPromoRemove={() => {
                                    setPromoCode('');
                                    setPromoDiscount(0);
                                    setPromoApplied(false);
                                    setPromoError('');
                                }}
                                isSubmitting={isSubmitting || !!stockWarning}
                                submitError={submitError || stockWarning}
                                onSubmit={handleSubmit}
                                totalItems={totalItems}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
