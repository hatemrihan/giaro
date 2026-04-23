'use client';

import type { CustomerInfo } from '../page';
import { EGYPT_GOVERNORATES, getCitiesForGovernorate } from '@/lib/data/egypt-governorates';
import { LocationDetector } from './LocationDetector';

type Props = {
    customer: CustomerInfo;
    onChange: (c: CustomerInfo) => void;
    errors: Record<string, string>;
    onLocationDetected: (governorate: string, city: string, lat?: number, lng?: number) => void;
};

// ── Zara-style underline input ───────────────────────────────

function ZaraInput({
    label,
    optional,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    dir,
}: {
    label: string;
    optional?: boolean;
    value: string;
    onChange: (val: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    dir?: string;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5">
                {label}
                {optional && <span className="text-neutral-300 mr-2 normal-case tracking-normal text-[10px]">(اختياري)</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                dir={dir}
                className={`w-full pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none transition-colors placeholder:text-neutral-300 ${
                    error ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                }`}
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}

function ZaraSelect({
    label,
    value,
    onChange,
    options,
    error,
    placeholder = '--',
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    error?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none appearance-none cursor-pointer transition-colors ${
                        error ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                    } ${!value ? 'text-neutral-400' : ''}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>
    );
}

// ── Component ────────────────────────────────────────────────

export function CustomerInfoForm({ customer, onChange, errors, onLocationDetected }: Props) {
    const update = (field: keyof CustomerInfo, value: string) => {
        const updated = { ...customer, [field]: value };
        // Reset city when governorate changes
        if (field === 'governorate') updated.city = '';
        onChange(updated);
    };

    const cities = customer.governorate
        ? getCitiesForGovernorate(customer.governorate)
        : [];

    return (
        <div>
            <div className="space-y-7">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraInput
                        label="الاسم الأول"
                        value={customer.firstName}
                        onChange={(v) => update('firstName', v)}
                        error={errors.firstName}
                    />
                    <ZaraInput
                        label="اسم العائلة"
                        value={customer.lastName}
                        onChange={(v) => update('lastName', v)}
                        error={errors.lastName}
                    />
                </div>

                {/* Address row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraInput
                        label="العنوان"
                        value={customer.address}
                        onChange={(v) => update('address', v)}
                        error={errors.address}
                    />
                    <ZaraInput
                        label="معلومات إضافية"
                        optional
                        value={customer.moreInfo}
                        onChange={(v) => update('moreInfo', v)}
                    />
                </div>

                {/* Delivery Section Header */}
                <div className="flex items-center justify-between pt-8 pb-2">
                    <h2 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase">
                        بيانات التوصيل
                    </h2>
                    <LocationDetector onLocationDetected={onLocationDetected} customer={customer} />
                </div>

                {/* Governorate + City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraSelect
                        label="المحافظة"
                        value={customer.governorate}
                        onChange={(v) => update('governorate', v)}
                        options={EGYPT_GOVERNORATES.map(g => ({
                            value: g.name,
                            label: g.name,
                        }))}
                        error={errors.governorate}
                    />
                    <ZaraSelect
                        label="المدينة"
                        value={customer.city}
                        onChange={(v) => update('city', v)}
                        options={cities.map(c => ({ value: c, label: c }))}
                        error={errors.city}
                        placeholder={customer.governorate ? '--' : 'اختر المحافظة أولاً'}
                    />
                </div>

                {/* Region (fixed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5">
                            البلد
                        </label>
                        <p className="pb-2.5 pt-1 border-b border-neutral-200 text-neutral-900 text-sm font-light">
                            مصر
                        </p>
                    </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5">
                            رقم الهاتف
                        </label>
                        <div className="flex items-end gap-3">
                            <span className="pb-2.5 pt-1 border-b border-neutral-200 text-neutral-900 text-sm font-light w-14 shrink-0 text-center" dir="ltr">
                                +20
                            </span>
                            <input
                                type="tel"
                                value={customer.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                dir="ltr"
                                placeholder="01xxxxxxxxx"
                                className={`flex-1 pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none transition-colors placeholder:text-neutral-300 ${
                                    errors.phone ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                                }`}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
                    </div>

                    <ZaraInput
                        label="البريد الإلكتروني"
                        optional
                        value={customer.email}
                        onChange={(v) => update('email', v)}
                        error={errors.email}
                        type="email"
                        dir="ltr"
                        placeholder="email@example.com"
                    />
                </div>
            </div>
        </div>
    );
}
