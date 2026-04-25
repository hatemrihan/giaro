import * as React from 'react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderEmailTemplateProps {
    customerName: string;
    orderId: string;
    orderItems: OrderItem[];
    totalAmount: number;
    shippingCost: number;
    paymentMethod: string;
    shippingAddress: {
        country: string;
        address: string;
        apartment?: string;
    };
    customerPhone: string;
}

export const OrderEmailTemplate: React.FC<Readonly<OrderEmailTemplateProps>> = ({
    customerName,
    orderId,
    orderItems,
    totalAmount,
    shippingCost,
    paymentMethod,
    shippingAddress,
    customerPhone,
}) => (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", backgroundColor: "#f4f4f5", margin: 0, padding: "40px 0" }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <tbody>
                <tr>
                    <td style={{ backgroundColor: "#1c1917", padding: "32px 40px", textAlign: "center" }}>
                        <h1 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: 700 }}>Giaro</h1>
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: "40px" }}>
                        <h2 style={{ color: "#1c1917", margin: "0 0 8px", fontSize: "20px" }}>Thank you, {customerName}!</h2>
                        <p style={{ color: "#78716c", margin: "0 0 24px", fontSize: "14px" }}>
                            Your order <strong style={{ color: "#1c1917" }}>{orderId}</strong> has been confirmed.
                        </p>

                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <th style={{ textAlign: "left", padding: "8px 0", borderBottom: "2px solid #1c1917", color: "#1c1917", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Item</th>
                                    <th style={{ textAlign: "center", padding: "8px 0", borderBottom: "2px solid #1c1917", color: "#1c1917", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Qty</th>
                                    <th style={{ textAlign: "right", padding: "8px 0", borderBottom: "2px solid #1c1917", color: "#1c1917", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price</th>
                                </tr>
                                {orderItems.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: "12px 0", borderBottom: "1px solid #e7e5e4", color: "#1c1917", fontSize: "14px" }}>{item.name}</td>
                                        <td style={{ padding: "12px 0", borderBottom: "1px solid #e7e5e4", color: "#78716c", fontSize: "14px", textAlign: "center" }}>×{item.quantity}</td>
                                        <td style={{ padding: "12px 0", borderBottom: "1px solid #e7e5e4", color: "#1c1917", fontSize: "14px", textAlign: "right", fontWeight: 600 }}>L.E {(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={2} style={{ padding: "12px 0", color: "#78716c", fontSize: "14px" }}>Shipping</td>
                                    <td style={{ padding: "12px 0", textAlign: "right", color: "#1c1917", fontSize: "14px" }}>L.E {shippingCost.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} style={{ padding: "16px 0 0", fontSize: "16px", fontWeight: 700, color: "#1c1917", borderTop: "2px solid #1c1917" }}>Total</td>
                                    <td style={{ padding: "16px 0 0", textAlign: "right", fontSize: "16px", fontWeight: 700, color: "#1c1917", borderTop: "2px solid #1c1917" }}>L.E {totalAmount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ marginTop: "32px", padding: "20px", backgroundColor: "#fafaf9", borderRadius: "8px" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#a8a29e", fontWeight: 600 }}>Delivery Address</p>
                            <p style={{ margin: 0, color: "#1c1917", fontSize: "14px" }}>
                                {shippingAddress.address}{shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
                            </p>
                            <p style={{ margin: "4px 0 0", color: "#78716c", fontSize: "14px" }}>{shippingAddress.country}</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: "24px 40px", backgroundColor: "#fafaf9", textAlign: "center", borderTop: "1px solid #e7e5e4" }}>
                        <p style={{ color: "#a8a29e", fontSize: "12px", margin: 0 }}>
                            Payment method: {paymentMethod} · Phone: {customerPhone}
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);
