import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { ConvexHttpClient } from "convex/browser";
import { createElement } from "react";
import type { ReactElement } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { ContractPdfDocument } from "@/components/contract-pdf-document";
import { buildContractDocumentProps } from "@/lib/contract-document-props";
import { buildContractPdfFilename } from "@/lib/contract-format";

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
  const contract = await convex.query(api.contracts.get, {
    id: id as Id<"contracts">,
  });

  if (!contract) {
    return new Response("Contract not found.", { status: 404 });
  }

  if (contract.status === "draft") {
    return new Response("Finalize the contract before downloading a PDF.", {
      status: 409,
    });
  }

  if (!contract.client || !contract.business) {
    return new Response("Contract is missing client or business details.", {
      status: 400,
    });
  }

  const documentProps = buildContractDocumentProps(
    contract,
    contract.client,
    contract.business,
  );

  const pdfDocument = createElement(
    ContractPdfDocument,
    documentProps,
  ) as ReactElement<DocumentProps>;

  const pdf = await renderToBuffer(pdfDocument);

  const filename = buildContractPdfFilename(
    contract.business.name,
    contract.client.companyName,
    contract.agreementDate,
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
