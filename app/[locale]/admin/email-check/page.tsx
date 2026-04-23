"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Shield, XCircle } from 'lucide-react';

import { SideBarNav } from '../sections/SideBarNav';
import { MobileNav } from '../sections/MobileNav';

const EmailCheck = () => {
    const router = useRouter();
    const [config, setConfig] = useState({
        hasApiKey: false,
        hasFromEmail: false,
    });
    const [testEmail, setTestEmail] = useState({
        status: 'idle' as 'idle' | 'testing' | 'success' | 'error',
        message: '',
        email: '',
        validationError: ''
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/admin/email-config-check');
                if (response.ok) {
                    const data = await response.json();
                    setConfig(data.config);
                }
            } catch (error) {
                console.error('Error checking email config:', error);
            }
        };
        fetchConfig();
    }, []);

    const testEmailSending = async () => {
        if (!testEmail.email) {
            setTestEmail(prev => ({ ...prev, validationError: 'Please enter an email address' }));
            return;
        }

        setTestEmail({ ...testEmail, status: 'testing', message: 'Testing email sending...', validationError: '' });

        try {
            const testOrderData = {
                customerEmail: testEmail.email,
                customerName: 'Test Customer',
                orderId: 'TEST-' + Date.now(),
                orderItems: [
                    {
                        name: 'Test Product',
                        quantity: 1,
                        price: 100
                    }
                ],
                totalAmount: 120,
                shippingCost: 20,
                paymentMethod: 'Test Payment',
                shippingAddress: {
                    country: 'Egypt',
                    address: 'Test Address',
                    apartment: ''
                },
                customerPhone: '+201234567890'
            };

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'customer',
                    orderData: testOrderData
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setTestEmail({
                    ...testEmail,
                    status: 'success',
                    message: 'Test email sent successfully! Check your inbox.'
                });
            } else {
                setTestEmail({
                    ...testEmail,
                    status: 'error',
                    message: `Test email failed: ${result.message || result.error || 'Unknown error'}`
                });
            }
        } catch (error) {
            setTestEmail({
                ...testEmail,
                status: 'error',
                message: `Test email failed: ${error instanceof Error ? error.message : 'Network error'}`
            });
        }
    };

    const isConfigured = config.hasApiKey;

    return (
        <>
            <div className="hidden lg:block">
                <SideBarNav />
            </div>
            <MobileNav />

            <div className="lg:ml-64 bg-stone-900 text-stone-100 min-h-screen">
                {/* Header Area */}
                <div className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md text-stone-100 sticky top-0 lg:top-0 z-30 pt-16 lg:pt-4">
                    <div className="px-6 pb-4 max-w-[1400px] mx-auto flex flex-col gap-1.5">
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-stone-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium w-fit"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                        </button>

                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <Mail className="w-5 h-5" /> Email Configuration Check
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">System Integrity</span>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="px-6 py-8 max-w-[1000px] mx-auto space-y-8">

                    {/* Configuration Status */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-6">
                        <h2 className="text-base font-semibold text-white mb-6">Resend Settings Status</h2>

                        <div className="space-y-4">
                            <div className={`flex items-start gap-4 p-4 rounded-lg border ${isConfigured ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="mt-0.5">
                                    {isConfigured ? <Shield className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                                </div>
                                <div>
                                    <h3 className={`font-medium ${isConfigured ? 'text-green-400' : 'text-red-400'}`}>Resend API Configuration</h3>
                                    <p className="text-sm text-stone-400 mt-1">Required for sending automated order confirmation emails safely to customers.</p>
                                </div>
                            </div>

                            <div className="ml-10 space-y-3 pt-2">
                                <div className={`flex items-center gap-3 text-sm ${config.hasApiKey ? 'text-green-400' : 'text-stone-400'}`}>
                                    {config.hasApiKey ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                    <span className="font-mono text-xs bg-stone-900/80 px-2 py-1 rounded border border-stone-700">RESEND_API_KEY</span>
                                </div>
                                <div className={`flex items-center gap-3 text-sm ${config.hasFromEmail ? 'text-green-400' : 'text-stone-400'}`}>
                                    {config.hasFromEmail ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                    <span className="font-mono text-xs bg-stone-900/80 px-2 py-1 rounded border border-stone-700">RESEND_FROM_EMAIL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Email Form */}
                    <div className="bg-stone-800 border border-stone-700 rounded-xl p-6">
                        <h2 className="text-base font-semibold text-white mb-6">Send Test Notification</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-medium text-stone-300 mb-2">Test Delivery Address</label>
                                <div className="flex gap-4">
                                    <input
                                        type="email"
                                        value={testEmail.email}
                                        onChange={(e) => setTestEmail({ ...testEmail, email: e.target.value })}
                                        placeholder="developer@example.com"
                                        className="flex-1 p-3 bg-stone-900 border border-stone-600 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all max-w-sm"
                                    />
                                    <button
                                        onClick={testEmailSending}
                                        disabled={testEmail.status === 'testing' || !isConfigured}
                                        className="bg-white hover:bg-stone-200 disabled:bg-stone-700 disabled:text-stone-500 text-black px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {testEmail.status === 'testing' ? 'Transmitting...' : 'Execute Test Send'}
                                    </button>
                                </div>
                                {testEmail.validationError && (
                                    <p className="text-red-400 text-xs mt-2">{testEmail.validationError}</p>
                                )}
                            </div>
                        </div>

                        {testEmail.message && (
                            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 border ${testEmail.status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    testEmail.status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                {testEmail.status === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                <div className="text-sm font-medium">{testEmail.message}</div>
                            </div>
                        )}
                    </div>

                    {/* Setup Instructions */}
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                        <h2 className="text-base font-semibold text-stone-200 mb-4">Operations Manual</h2>

                        {!isConfigured ? (
                            <div className="space-y-6">
                                <div className="text-[13px] text-stone-400">
                                    <p className="mb-4">To enable outbound order confirmations via Resend, inject these environment variables into your deployment host or local <span className="text-stone-200 font-mono">.env.local</span> vault:</p>

                                    <ol className="list-decimal list-inside space-y-3 ml-2">
                                        <li>Register at <a href="https://resend.com" target="_blank" className="text-white hover:underline font-medium">resend.com</a> and create an API key.</li>
                                        <li>Verify your sending domain under <strong>Domains</strong> in the dashboard.</li>
                                        <li>Copy the generated API key.</li>
                                        <li>Embed them globally into the environment:</li>
                                    </ol>
                                </div>

                                <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 font-mono text-xs leading-relaxed text-stone-300">
                                    RESEND_API_KEY=re_your_api_key_here<br />
                                    RESEND_FROM_EMAIL=Giaro &lt;noreply@yourdomain.com&gt;
                                </div>

                                <p className="text-[11px] text-stone-500">
                                    * Next.js requires a build restart after declaring protected runtime secrets.
                                </p>
                            </div>
                        ) : (
                            <div className="text-[13px] text-stone-400">
                                <p>Environment parameters are loaded and Resend is active. The production container will successfully send automated confirmation emails to customers.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default EmailCheck;
