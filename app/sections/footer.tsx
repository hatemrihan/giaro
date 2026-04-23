'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
    const [email, setEmail] = useState('')
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
    // Loading state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Success/error messages
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

    const t = useTranslations('footer');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const [currencyCode, setCurrencyCode] = useState('SAR');

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        if (pathname.startsWith(`/${locale}`)) {
            const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
            router.push(newPath || `/${newLocale}`);
        } else {
            router.push(`/${newLocale}`);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !agreedToPrivacy) {
            setMessage(t('errorMissingEmailOrPrivacy'))
            setMessageType('error')
            return
        }

        setIsSubmitting(true)
        setMessage('')
        setMessageType('')

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const result = await response.json()

            if (result.success) {
                setEmail('')
                setAgreedToPrivacy(false)
                setMessage(t('successSubscribed'))
                setMessageType('success')
            } else {
                setMessage(result.error || t('errorFailedToSubscribe'))
                setMessageType('error')
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error)
            setMessage(t('errorSomethingWentWrong'))
            setMessageType('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (

        <footer id="footer" className="bg-white mt-5 md:mt-10 lg:mt-20">
            {/* Footer Links */}
            <div className="max-w-6xl mx-auto px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
                    {/* Column 1 - Language & Country Combined */}
                    <div className="space-y-6">
                        {/* Language */}
                        <div>
                            <p className="text-xs text-gray-500 mb-4">{t('chooseLanguage')}</p>
                            <select
                                id="language"
                                value={locale}
                                onChange={handleLanguageChange}
                                className="text-sm text-gray-600 hover:text-black transition-colors bg-transparent border-none focus:outline-none cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="ar">العربية</option>
                            </select>
                        </div>

                        {/* Country (Currency Selection) */}
                        <div>
                            <p className="text-xs text-gray-500 mb-4">{t('selectCountry')}</p>
                            <select
                                id="country"
                                value={currencyCode}
                                onChange={(e) => setCurrencyCode(e.target.value)}
                                className="text-sm text-gray-600 hover:text-black transition-colors bg-transparent border-none focus:outline-none cursor-pointer"
                            >
                                <option value="EGP">Egypt</option>
                                <option value="SAR">Saudi Arabia</option>
                                <option value="AED">United Arab Emirates</option>
                            </select>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li>
                                <Link href="/about" className="hover:text-black transition-colors">
                                    {t('about')}
                                </Link>
                            </li>

                            <li>
                                <Link href="/contact" className="hover:text-black transition-colors">
                                    {t('contactUs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.instagram.com/giaro.eg" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors flex items-center">

                                    {t('social')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li>
                                <Link href="/shipping" className="hover:text-black transition-colors">
                                    {t('shipping')}
                                </Link>
                            </li>

                            <li>
                                <Link href="/return" className="hover:text-black transition-colors">
                                    {t('returnPolicy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="hover:text-black transition-colors">
                                    {t('startReturn')}
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li>
                                <Link href="/privacy" className="hover:text-black transition-colors">
                                    {t('privacyPolicy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-black transition-colors">
                                    {t('terms')}
                                </Link>
                            </li>
                            {/* <li>
                <a href="/faq" className="hover:text-black transition-colors">
                  {t('faq')}
                </a>
              </li> */}
                        </ul>
                    </div>

                    {/* Column 5 - Newsletter */}
                    <div dir="rtl">
                        <h3 className="text-sm font-semibold text-black mb-2">{t('newsletterTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t('newsletterDesc')}</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('emailInputPlaceholder')}
                                    className="flex-1 px-0 py-2 text-sm border-0 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent placeholder-gray-400"
                                    required
                                    suppressHydrationWarning
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mr-2 p-2 hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={t('subscribe')}
                                    suppressHydrationWarning
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-black rotate-180" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-start text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    id="privacy"
                                    checked={agreedToPrivacy}
                                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                    className="mt-1 ml-2 w-3.5 h-3.5 accent-black"
                                    required
                                />
                                <label htmlFor="privacy" className="leading-relaxed">
                                    {t('agreeTo')}{' '}
                                    <Link href="/privacy" className="underline underline-offset-2 hover:text-black transition-colors">
                                        {t('privacyPolicyLink')}
                                    </Link>
                                </label>
                            </div>

                            {message && (
                                <div className={`text-sm font-medium ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-12 mt-12 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        {t('copyright')}
                    </div>
                </div>
            </div>
        </footer>
    )
}
