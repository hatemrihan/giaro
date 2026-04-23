'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQ = { question: string; answer: string };

type Props = {
    description?: string;
    detailedDescription?: string;
    shippingInfo?: string;
    faqs?: FAQ[];
};

type Tab = {
    id: string;
    label: string;
    content: React.ReactNode;
    hasContent: boolean;
};

/**
 * Expandable accordion tabs for product details.
 * Arabic labels, smooth framer-motion animations.
 */
export function ProductDetailsTabs({ description, detailedDescription, shippingInfo, faqs }: Props) {
    const [activeTab, setActiveTab] = useState<string | null>(null);

    const tabs: Tab[] = [
        {
            id: 'details',
            label: 'التفاصيل',
            content: detailedDescription || '',
            hasContent: !!detailedDescription?.trim(),
        },
        {
            id: 'description',
            label: 'الوصف',
            content: description || '',
            hasContent: !!description?.trim(),
        },
        {
            id: 'shipping',
            label: 'الشحن والتوصيل',
            content: shippingInfo || '',
            hasContent: !!shippingInfo?.trim(),
        },
        {
            id: 'faqs',
            label: 'أسئلة شائعة',
            content: faqs && faqs.length > 0 ? (
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-neutral-200 pb-4 last:border-b-0">
                            <h4 className="font-medium text-neutral-800 mb-2">{faq.question}</h4>
                            <p className="text-neutral-500 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            ) : null,
            hasContent: !!(faqs && faqs.length > 0),
        },
    ];

    const toggleTab = (tabId: string) => {
        setActiveTab(activeTab === tabId ? null : tabId);
    };

    // Only show tabs that have content
    const visibleTabs = tabs.filter(t => t.hasContent);
    if (visibleTabs.length === 0) return null;

    return (
        <div className="space-y-0 pt-6 border-t border-neutral-200">
            {visibleTabs.map((tab) => (
                <div key={tab.id}>
                    <button
                        onClick={() => toggleTab(tab.id)}
                        className="flex justify-between items-center w-full text-right py-4 border-b border-neutral-200 hover:border-neutral-400 transition-colors group cursor-pointer"
                    >
                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                            {tab.label}
                        </span>
                        <motion.span
                            animate={{ rotate: activeTab === tab.id ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="text-lg text-neutral-400 group-hover:text-neutral-700 transition-colors"
                        >
                            {activeTab === tab.id ? '−' : '+'}
                        </motion.span>
                    </button>

                    <AnimatePresence>
                        {activeTab === tab.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.25,
                                    ease: 'easeInOut',
                                    opacity: { duration: 0.15 },
                                }}
                                className="overflow-hidden"
                            >
                                <div className="py-5 text-sm text-neutral-600 leading-relaxed">
                                    {typeof tab.content === 'string' ? (
                                        <div className="whitespace-pre-line">{tab.content}</div>
                                    ) : (
                                        tab.content
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
