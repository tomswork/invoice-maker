import type { Doc } from "../../convex/_generated/dataModel";

type ClientDoc = Doc<"clients">;
type BusinessDoc = Doc<"businessSettings">;

type ContractTerms = {
  agreementDate: number;
  startDate: number;
  services: string;
  workingDaysPerWeek: number;
  expectedMonths: number;
  hoursPerDay: number;
  changeNoticeDays: number;
  terminationNoticeDays: number;
  rateCents: number;
  invoiceFrequency: string;
  paymentDueDays: number;
  governingLawState: string;
};

export type ContractDocumentInput = {
  client: { companyName: string; contactName: string };
  agreementDate: number;
  startDate: number;
  clientAddress: string;
  clientAbn?: string;
  clientEmail?: string;
  contractorName: string;
  contractorAbn: string;
  contractorAddress: string;
  contractorEmail: string;
  contractorSignatureDataUrl?: string;
  services: string;
  workingDaysPerWeek: number;
  expectedMonths: number;
  hoursPerDay: number;
  changeNoticeDays: number;
  terminationNoticeDays: number;
  rateCents: number;
  invoiceFrequency: string;
  paymentDueDays: number;
  governingLawState: string;
};

export function buildContractDocumentProps(
  contract: ContractTerms,
  client: ClientDoc,
  business: BusinessDoc,
): ContractDocumentInput {
  return {
    client: {
      companyName: client.companyName,
      contactName: client.contactName,
    },
    ...contract,
    clientAddress: client.address ?? "",
    clientAbn: client.abn,
    clientEmail: client.email,
    contractorName: business.name,
    contractorAbn: business.abn,
    contractorAddress: business.address ?? "",
    contractorEmail: business.email,
    contractorSignatureDataUrl: business.signatureDataUrl,
  };
}
