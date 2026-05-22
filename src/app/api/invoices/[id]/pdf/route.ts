import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ConvexHttpClient } from "convex/browser";
import { createElement } from "react";
import type { ReactElement } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { InvoicePdfDocument } from "@/components/invoice-pdf-document";
import { buildInvoicePdfFilename } from "@/lib/format";
import { inferIncludeLineItemDates } from "@/lib/line-items";

export const runtime = "nodejs";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!convexUrl) {
		return new Response("Missing NEXT_PUBLIC_CONVEX_URL.", { status: 500 });
	}

	const { id } = await params;
	const convex = new ConvexHttpClient(convexUrl);
	const invoice = await convex.query(api.invoices.get, {
		id: id as Id<"invoices">,
	});

	if (!invoice) {
		return new Response("Invoice not found.", { status: 404 });
	}

	if (invoice.status === "draft") {
		return new Response("Finalize the invoice before downloading a PDF.", {
			status: 409,
		});
	}

	if (!invoice.client || !invoice.business) {
		return new Response("Invoice is missing client or business details.", {
			status: 400,
		});
	}

	if (invoice.invoiceNumber == null) {
		return new Response("Invoice is missing an invoice number.", {
			status: 400,
		});
	}

	const pdfDocument = createElement(InvoicePdfDocument, {
		business: invoice.business,
		client: invoice.client,
		invoiceNumber: invoice.invoiceNumber,
		issuedAt: invoice.issuedAt,
		dueAt: invoice.dueAt,
		lineItems: invoice.lineItems,
		includeLineItemDates:
			invoice.includeLineItemDates ??
			inferIncludeLineItemDates(invoice.lineItems),
		totalCents: invoice.totalCents,
	}) as ReactElement<DocumentProps>;

	const pdf = await renderToBuffer(pdfDocument);

	const filename = buildInvoicePdfFilename(
		invoice.business.name,
		invoice.client.companyName,
		invoice.issuedAt,
	);

	return new Response(new Uint8Array(pdf), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Cache-Control": "no-store",
		},
	});
}
