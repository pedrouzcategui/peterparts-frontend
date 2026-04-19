export const WHATSAPP_URL = "https://wa.me/584242138922";

export function buildWhatsAppUrl(message?: string): string {
	const url = new URL(WHATSAPP_URL);
	const normalizedMessage = message?.trim();

	if (normalizedMessage) {
		url.searchParams.set("text", normalizedMessage);
	}

	return url.toString();
}

export function buildOrderWhatsAppMessage(orderNumber: string): string {
	return `Hola Peter Parts, acabo de crear el pedido ${orderNumber} y quiero coordinar la compra.`;
}

export function buildOrderWhatsAppUrl(orderNumber: string): string {
	return buildWhatsAppUrl(buildOrderWhatsAppMessage(orderNumber));
}
