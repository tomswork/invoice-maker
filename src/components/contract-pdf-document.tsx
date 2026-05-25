import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import {
	formatContractDate,
	formatDaysPerWeek,
	formatMonthCount,
	formatServiceDayHours,
} from "@/lib/contract-format";
import { formatCents } from "@/lib/format";

type ContractPdfDocumentProps = {
  client: {
    companyName: string;
    contactName: string;
  };
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

export function ContractPdfDocument({
	client,
	agreementDate,
	startDate,
  clientAddress,
  clientAbn,
  clientEmail,
  contractorName,
  contractorAbn,
  contractorAddress,
  contractorEmail,
	contractorSignatureDataUrl,
	services,
	workingDaysPerWeek,
	expectedMonths,
	hoursPerDay,
	changeNoticeDays,
	terminationNoticeDays,
	rateCents,
	invoiceFrequency,
	paymentDueDays,
	governingLawState,
}: ContractPdfDocumentProps) {
  const clientName = client.companyName;
	const serviceText =
		services.trim() || "Software Development for Client Projects.";
	const daysPerWeekText = formatDaysPerWeek(workingDaysPerWeek);
	const monthsText = formatMonthCount(expectedMonths);

	return (
		<Document title={`${clientName} Independent Contractor Agreement`}>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.title}>INDEPENDENT CONTRACTOR AGREEMENT</Text>
					<View style={styles.titleRule} />
					<Text style={styles.intro}>
						This Independent Contractor Agreement (the &quot;Agreement&quot;) is
						dated{" "}
						<Text style={styles.introDate}>
							{formatContractDate(agreementDate)}
						</Text>
						.
					</Text>
				</View>

				<View style={styles.partiesContainer}>
					<View style={[styles.party, styles.partyFirst]}>
						<Text style={styles.partyLabel}>Client</Text>
						<Text style={styles.partyName}>{clientName}</Text>
						{clientAbn?.trim() ? (
							<Text style={styles.partyDetail}>ABN {clientAbn.trim()}</Text>
						) : null}
						{clientAddress.trim() ? (
							<Text style={styles.partyDetail}>{clientAddress}</Text>
						) : null}
						<Text style={styles.partyRole}>(the &quot;Client&quot;)</Text>
					</View>
					<View style={styles.party}>
						<Text style={styles.partyLabel}>Contractor</Text>
						<Text style={styles.partyName}>{contractorName}</Text>
						<Text style={styles.partyDetail}>ABN {contractorAbn}</Text>
						{contractorAddress.trim() ? (
							<Text style={styles.partyDetail}>{contractorAddress}</Text>
						) : null}
						<Text style={styles.partyRole}>(the &quot;Contractor&quot;)</Text>
					</View>
				</View>

				<Text style={styles.recitalHeading}>BACKGROUND</Text>
				<Recital letter="A">
					The Client is of the opinion that the Contractor has the necessary
					qualifications, experience and abilities to provide services to the
					Client.
				</Recital>
				<Recital letter="B">
					The Contractor is agreeable to providing such services to the Client
					on the terms and conditions set out in this Agreement.
				</Recital>

				<Text style={styles.paragraph}>
					<Text style={styles.bold}>IN CONSIDERATION OF </Text> the matters
					described above and of the mutual benefits and obligations set forth
					in this Agreement, the receipt and sufficiency of which consideration
					is hereby acknowledged, the Client and the Contractor (individually
					the &quot;Party&quot; and collectively the &quot;Parties&quot; to this
					Agreement) agree as follows:
				</Text>

				<SectionTitle>Services Provided</SectionTitle>
				<Clause number={1}>
					The Client hereby agrees to engage the Contractor to provide the
					Client with the following services (the &quot;Services&quot;):{"\n"}—{" "}
					{serviceText}
				</Clause>
				<Clause number={2}>
					The Services will also include any other tasks which the Parties may
					agree on. The Contractor hereby agrees to provide such Services to the
					Client.
				</Clause>

				<SectionTitle>Working Arrangement</SectionTitle>
				<Clause number={3}>
					The Parties agree that the initial working approach will be for the
					Contractor to provide the Services on the basis of {daysPerWeekText}.
				</Clause>
				<Clause number={4}>
					The Client has indicated that it anticipates requiring the Contractor
					to provide Services on the basis of {daysPerWeekText} for at least{" "}
					{monthsText} from the commencement of this Agreement, subject to the
					terms of this Agreement.
				</Clause>
				<Clause number={5}>
					For the purposes of this Agreement, a day of Services will be
					considered to be up to {formatServiceDayHours(hoursPerDay)} hours.
				</Clause>
				<Clause number={6}>
					Any change to the agreed number of days per week must be communicated
					in writing by either Party to the other Party with at least{" "}
					{changeNoticeDays} days&apos; notice, unless otherwise agreed in
					writing by the Parties.
				</Clause>

				<SectionTitle>Term of Agreement</SectionTitle>
				<Clause number={7}>
					The term of this Agreement (the &quot;Term&quot;) will begin on{" "}
					{formatContractDate(startDate)} (the &quot;Start Date&quot;) and will
					remain in full force and effect until the completion of the Services,
					subject to earlier termination as provided in this Agreement. The Term
					may be extended with the written consent of the Parties.
				</Clause>
				<Clause number={8}>
					In the event that either Party wishes to terminate this Agreement
					prior to the completion of the Services, that Party will be required
					to provide {terminationNoticeDays} days&apos; written notice to the
					other Party.
				</Clause>

				<SectionTitle>Performance</SectionTitle>
				<Clause number={9}>
					The Parties agree to do everything necessary to ensure that the terms
					of this Agreement take effect.
				</Clause>

				<SectionTitle>Currency</SectionTitle>
				<Clause number={10}>
					Except as otherwise provided in this Agreement, all monetary amounts
					referred to in this Agreement are in AUD (Australian Dollars).
				</Clause>

				<SectionTitle>Payment</SectionTitle>
				<Clause number={11}>
					The Contractor will charge the Client for the Services at the rate of{" "}
					{formatCents(rateCents)} per hour (the &quot;Payment&quot;).
				</Clause>
				<Clause number={12}>
					The Payment is exclusive of Goods and Services Tax (GST). If the
					Contractor becomes registered or required to be registered for GST,
					including after passing the applicable GST registration threshold, the
					Contractor may charge GST in addition to the Payment and any other
					taxable supplies under this Agreement. The Client will pay any
					applicable GST on receipt of a valid tax invoice.
				</Clause>
				<Clause number={13}>
					The Client will be invoiced {invoiceFrequency}.
				</Clause>
				<Clause number={14}>
					Invoices submitted by the Contractor to the Client are due within{" "}
					{paymentDueDays} days of receipt.
				</Clause>

				<SectionTitle>Reimbursement of Expenses</SectionTitle>
				<Clause number={15}>
					The Contractor will be reimbursed from time to time for reasonable and
					necessary expenses incurred by the Contractor in connection with
					providing the Services, provided such expenses have been approved in
					writing by the Client in advance.
				</Clause>

				<SectionTitle>Client Systems and Third-Party Accounts</SectionTitle>
				<Clause number={16}>
					The Client is responsible for obtaining, maintaining and paying for
					all third-party systems, accounts, subscriptions, licences,
					infrastructure, platforms, payment methods, access permissions,
					credentials and services required for the Services or for the
					operation of any deliverables, including compliance with any
					applicable third-party terms and conditions.
				</Clause>
				<Clause number={17}>
					The Contractor is not responsible for the availability, security,
					performance, pricing, billing, changes, outages, data loss, acts,
					omissions, or failures of any third-party systems, accounts,
					platforms, providers, or services selected, owned, controlled, or paid
					for by the Client, except to the extent caused by the
					Contractor&apos;s fraud, wilful misconduct, gross negligence, or
					unauthorised use outside the Client&apos;s written instructions.
				</Clause>

				<SectionTitle>Confidentiality</SectionTitle>
				<Clause number={18}>
					Confidential information (the &quot;Confidential Information&quot;)
					refers to any data or information relating to the Client, whether
					business or personal, which would reasonably be considered to be
					private or proprietary to the Client and that is not generally known
					and where the release of that Confidential Information could
					reasonably be expected to cause harm to the Client.
				</Clause>
				<Clause number={19}>
					The Contractor agrees that they will not disclose, divulge, reveal,
					report or use, for any purpose, any Confidential Information which the
					Contractor has obtained, except as authorised by the Client or as
					required by law. The obligations of confidentiality will apply during
					the Term and will survive indefinitely upon termination of this
					Agreement.
				</Clause>

				<SectionTitle>Data, Privacy and Security</SectionTitle>
				<Clause number={20}>
					The Client owns and remains responsible for all data, records and
					information provided to, accessed by, stored in, processed by, or
					otherwise handled in connection with the Services, including personal
					information, personally identifiable information, health information,
					sensitive information, customer records, member records and any other
					regulated data (the &quot;Client Data&quot;).
				</Clause>
				<Clause number={21}>
					The Client is responsible for determining and maintaining the lawful
					basis, consent requirements, privacy notices, retention requirements,
					security settings, access controls, third-party systems, payment
					methods, policies and compliance obligations relating to Client Data.
					The Contractor will handle Client Data only as reasonably required to
					provide the Services, in accordance with the Client&apos;s written
					instructions, and with reasonable care.
				</Clause>
				<Clause number={22}>
					The Client agrees to indemnify and hold harmless the Contractor
					against any claims, losses, damages, liabilities, penalties, expenses,
					reasonable legal fees and costs arising from or relating to Client
					Data, including any data breach, privacy incident, cybersecurity
					incident, unauthorised access, use, disclosure, loss, or compromise of
					personal information, personally identifiable information, health
					information, sensitive information or other regulated data, except to
					the extent caused by the Contractor&apos;s fraud, wilful misconduct,
					gross negligence, or unauthorised use or disclosure of Client Data
					outside the Client&apos;s written instructions.
				</Clause>

				<SectionTitle>Ownership of Intellectual Property</SectionTitle>
				<Clause number={23}>
					All intellectual property and related material, including any trade
					secrets, moral rights, goodwill, relevant registrations or
					applications for registration, and rights in any patent, copyright,
					trade mark, trade dress, industrial design and trade name (the
					&quot;Intellectual Property&quot;) that is developed or produced under
					this Agreement, will be the sole property of the Client. The use of
					the Intellectual Property by the Client will not be restricted in any
					manner.
				</Clause>
				<Clause number={24}>
					Despite anything else in this Agreement, the Contractor retains all
					right, title and interest in any intellectual property, software,
					source code, libraries, frameworks, templates, tools, processes,
					know-how, methodologies, documentation, materials or other works
					created, developed, owned, or licensed by the Contractor before the
					Start Date or developed independently of the Services (the
					&quot;Contractor Materials&quot;).
				</Clause>
				<Clause number={25}>
					To the extent any Contractor Materials are incorporated into, required
					for, or supplied with the deliverables, the Contractor grants the
					Client a non-exclusive, perpetual, royalty-free licence to use,
					reproduce, modify and maintain those Contractor Materials solely as
					part of the deliverables and for the Client&apos;s internal business
					purposes.
				</Clause>
				<Clause number={26}>
					The Contractor may not use the Intellectual Property for any purpose
					other than that contracted for in this Agreement except with the
					written consent of the Client. The Contractor will be responsible for
					any and all damages resulting from the unauthorised use of the
					Intellectual Property.
				</Clause>

				<SectionTitle>Return of Property</SectionTitle>
				<Clause number={27}>
					Upon the expiry or termination of this Agreement, the Contractor will
					return to the Client any property, documentation, records, or
					Confidential Information which is the property of the Client.
				</Clause>

				<SectionTitle>Capacity/Independent Contractor</SectionTitle>
				<Clause number={28}>
					In providing the Services under this Agreement it is expressly agreed
					that the Contractor is acting as an independent contractor and not as
					an employee. The Contractor and the Client acknowledge that this
					Agreement does not create a partnership or joint venture between them,
					and is exclusively a contract for service.
				</Clause>

				<SubsectionTitle>Right of Substitution</SubsectionTitle>
				<Clause number={29}>
					Except as otherwise provided in this Agreement, the Contractor may, at
					the Contractor&apos;s absolute discretion, engage a third party
					sub-contractor to perform some or all of the obligations of the
					Contractor under this Agreement and the Client will not hire or engage
					any third parties to assist with the provision of the Services.
				</Clause>
				<Clause number={30}>
					In the event that the Contractor hires a sub-contractor:
				</Clause>
				<Bullet>
					the Contractor will pay the sub-contractor for its services and the
					Compensation will remain payable by the Client to the Contractor.
				</Bullet>
				<Bullet>
					for the purposes of the indemnification clause of this Agreement, the
					sub-contractor is an agent of the Contractor.
				</Bullet>

				<SubsectionTitle>Autonomy</SubsectionTitle>
				<Clause number={31}>
					Except as otherwise provided in this Agreement, the Contractor will
					have full control over working time, methods, and decision making in
					relation to provision of the Services in accordance with the
					Agreement. The Contractor will work autonomously and not at the
					direction of the Client. However, the Contractor will be responsive to
					the reasonable needs and concerns of the Client.
				</Clause>

				<SubsectionTitle>Equipment</SubsectionTitle>
				<Clause number={32}>
					Except as otherwise provided in this Agreement, the Contractor will
					provide at the Contractor&apos;s own expense, any and all tools,
					machinery, equipment, raw materials, supplies, workwear and any other
					items or parts necessary to deliver the Services in accordance with
					the Agreement.
				</Clause>

				<SubsectionTitle>No Exclusivity</SubsectionTitle>
				<Clause number={33}>
					The Parties acknowledge that this Agreement is non-exclusive and that
					either Party will be free, during and after the Term, to engage or
					contract with third parties for the provision of services similar to
					the Services.
				</Clause>

				<SectionTitle>Notice</SectionTitle>
				<Clause number={34}>
					All notices, requests, demands or other communications required or
					permitted by the terms of this Agreement will be given in writing and
					delivered to the Parties at the following physical address or email:
				</Clause>
				<Bullet>
					{formatNoticePartyDetails(clientName, clientAddress, clientEmail)}
				</Bullet>
				<Bullet>
					{formatNoticePartyDetails(
						contractorName,
						contractorAddress,
						contractorEmail,
					)}
				</Bullet>
				<Text style={styles.paragraph}>
					or to such other physical address or email as either Party may from
					time to time notify the other.
				</Text>

				<SectionTitle>Indemnification</SectionTitle>
				<Clause number={35}>
					Except to the extent paid in settlement from any applicable insurance
					policies, and to the extent permitted by applicable law, each Party
					agrees to indemnify and hold harmless the other Party, and its
					respective affiliates, officers, agents, employees, and permitted
					successors and assigns against any and all claims, losses, damages,
					liabilities, penalties, punitive damages, expenses, reasonable legal
					fees and costs of any kind or amount whatsoever, which result from or
					arise out of any act or omission of the indemnifying party, its
					respective affiliates, officers, agents, employees, and permitted
					successors and assigns that occurs in connection with this Agreement.
					This indemnification will survive the termination of this Agreement.
				</Clause>

				<SectionTitle>Modification of Agreement</SectionTitle>
				<Clause number={36}>
					Any amendment or modification of this Agreement or additional
					obligation assumed by either Party in connection with this Agreement
					will only be binding if evidenced in writing signed by each Party or
					an authorised representative of each Party.
				</Clause>

				<SectionTitle>Time of the Essence</SectionTitle>
				<Clause number={37}>
					Time is of the essence in this Agreement. No extension or variation of
					this Agreement will operate as a waiver of this provision.
				</Clause>

				<SectionTitle>Assignment</SectionTitle>
				<Clause number={38}>
					The Contractor will not voluntarily, or by operation of law, assign or
					otherwise transfer its obligations under this Agreement without the
					prior written consent of the Client.
				</Clause>

				<SectionTitle>Entire Agreement</SectionTitle>
				<Clause number={39}>
					It is agreed that there is no representation, warranty, collateral
					agreement or condition affecting this Agreement except as expressly
					provided in this Agreement.
				</Clause>

				<SectionTitle>Enurement</SectionTitle>
				<Clause number={40}>
					This Agreement will enure to the benefit of and be binding on the
					Parties and their respective heirs, executors, administrators and
					permitted successors and assigns.
				</Clause>

				<SectionTitle>Titles/Headings</SectionTitle>
				<Clause number={41}>
					Headings are inserted for the convenience of the Parties only and are
					not to be considered when interpreting this Agreement.
				</Clause>

				<SectionTitle>Gender</SectionTitle>
				<Clause number={42}>
					Words in the singular mean and include the plural and vice versa.
					Words in the masculine mean and include the feminine and vice versa.
				</Clause>

				<SectionTitle>Governing Law</SectionTitle>
				<Clause number={43}>
					This Agreement will be governed by and construed in accordance with
					the laws of the State of {governingLawState}.
				</Clause>

				<SectionTitle>Severability</SectionTitle>
				<Clause number={44}>
					In the event that any of the provisions of this Agreement are held to
					be invalid or unenforceable in whole or in part, all other provisions
					will nevertheless continue to be valid and enforceable with the
					invalid or unenforceable parts severed from the remainder of this
					Agreement.
				</Clause>

				<SectionTitle>Waiver</SectionTitle>
				<Clause number={45}>
					The waiver by either Party of a breach, default, delay or omission of
					any of the provisions of this Agreement by the other Party will not be
					construed as a waiver of any subsequent breach of the same or other
					provisions.
				</Clause>

				<View style={styles.signatureBlock} wrap={false}>
					<View style={styles.signatureRow}>
						<PdfSignatureColumn
							label="Client"
							companyName={clientName}
							showNameField
						/>
						<PdfSignatureColumn
							label="Contractor"
							companyName={contractorName}
							signatureSrc={contractorSignatureDataUrl}
							signedDate={formatContractDate(agreementDate)}
						/>
					</View>
				</View>
			</Page>
		</Document>
	);
}

function formatNoticePartyDetails(
	name: string,
	address: string,
	email?: string,
) {
	const lines = [name];
	if (address.trim()) {
		lines.push(address.trim());
	}
	if (email?.trim()) {
		lines.push(`Email: ${email.trim()}`);
	}
	return lines.join("\n");
}

function PdfSignatureColumn({
	label,
	companyName,
	showNameField = false,
	signatureSrc,
	signedDate,
}: {
	label: string;
	companyName: string;
	showNameField?: boolean;
	signatureSrc?: string;
	signedDate?: string;
}) {
	const lineStyle = showNameField
		? styles.signatureSigningLine
		: styles.signatureLine;
	const dateLineStyle = showNameField
		? styles.signatureSigningDateLine
		: styles.signatureDateLine;
	const fieldLabelStyle = showNameField
		? styles.signatureSigningFieldLabel
		: styles.signatureFieldLabel;

	return (
		<View style={styles.signatureParty}>
			<Text style={styles.signatureLabel}>{label}</Text>
			<Text style={styles.signatureCompany}>{companyName}</Text>

			{showNameField ? (
				<>
					<Text style={fieldLabelStyle}>Name</Text>
					<View style={lineStyle} />
				</>
			) : null}

			<Text style={fieldLabelStyle}>Signature</Text>
			{signatureSrc ? (
				<Image src={signatureSrc} style={styles.signatureImage} />
			) : (
				<View style={lineStyle} />
			)}

			<Text style={fieldLabelStyle}>Date</Text>
			{signedDate ? (
				<Text style={styles.signatureFieldValue}>{signedDate}</Text>
			) : (
				<View style={dateLineStyle} />
			)}
		</View>
	);
}

function SectionTitle({ children }: { children: string }) {
	return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SubsectionTitle({ children }: { children: string }) {
	return <Text style={styles.subsectionTitle}>{children}</Text>;
}

function Clause({ number, children }: { number: number; children: ReactNode }) {
	return (
		<View style={styles.clause}>
			<Text style={styles.clauseNumber}>{number}.</Text>
			<Text style={styles.clauseText}>{children}</Text>
		</View>
	);
}

function Recital({
	letter,
	children,
}: {
	letter: string;
	children: ReactNode;
}) {
	return (
		<View style={styles.clause}>
			<Text style={styles.clauseNumber}>{letter}.</Text>
			<Text style={styles.clauseText}>{children}</Text>
		</View>
	);
}

function Bullet({ children }: { children: ReactNode }) {
	return (
		<View style={styles.subItem}>
			<Text style={styles.clauseNumber}> </Text>
			<Text style={styles.clauseText}>• {children}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingTop: 48,
		paddingRight: 56,
		paddingBottom: 48,
		paddingLeft: 56,
		fontFamily: "Times-Roman",
		fontSize: 11,
		lineHeight: 1.4,
		color: "#000000",
	},
	header: {
		marginBottom: 18,
	},
	title: {
		paddingBottom: 12,
		textAlign: "center",
		fontFamily: "Times-Bold",
		fontSize: 16,
		letterSpacing: 0.8,
		color: "#171717",
	},
	titleRule: {
		borderBottomWidth: 1,
		borderBottomColor: "#d4d4d4",
	},
	intro: {
		marginTop: 14,
		fontSize: 10.5,
		lineHeight: 1.55,
		textAlign: "center",
		color: "#262626",
	},
	introDate: {
		fontFamily: "Times-Bold",
		color: "#171717",
	},
	bold: {
		fontFamily: "Times-Bold",
	},
	paragraph: {
		marginBottom: 18,
	},
	partiesContainer: {
		display: "flex",
		flexDirection: "row",
		marginBottom: 18,
		borderWidth: 1,
		borderColor: "#d4d4d4",
		backgroundColor: "#fafafa",
	},
	party: {
		width: "50%",
		paddingTop: 16,
		paddingBottom: 16,
		paddingLeft: 20,
		paddingRight: 20,
	},
	partyFirst: {
		borderRightWidth: 1,
		borderRightColor: "#d4d4d4",
	},
	partyLabel: {
		marginBottom: 8,
		fontFamily: "Times-Bold",
		fontSize: 8,
		letterSpacing: 0.8,
		color: "#737373",
	},
	partyName: {
		marginBottom: 6,
		fontFamily: "Times-Bold",
		fontSize: 12,
		color: "#171717",
	},
	partyDetail: {
		marginBottom: 2,
		fontSize: 10,
		lineHeight: 1.5,
		color: "#404040",
	},
	partyRole: {
		marginTop: 14,
		fontFamily: "Times-Italic",
		fontSize: 9,
		color: "#525252",
	},
	recitalHeading: {
		marginBottom: 10,
		fontFamily: "Times-Bold",
	},
	sectionTitle: {
		marginTop: 8,
		marginBottom: 10,
		fontFamily: "Times-Bold",
		textDecoration: "underline",
	},
	subsectionTitle: {
		marginTop: 8,
		marginBottom: 10,
		fontFamily: "Times-Bold",
	},
	clause: {
		display: "flex",
		flexDirection: "row",
		marginBottom: 18,
	},
	clauseNumber: {
		width: 28,
	},
	clauseText: {
		flex: 1,
	},
	subItem: {
		display: "flex",
		flexDirection: "row",
		marginBottom: 10,
	},
	signatureBlock: {
		marginTop: 18,
		paddingTop: 18,
		borderTopWidth: 1,
		borderTopColor: "#d4d4d4",
	},
	signatureRow: {
		display: "flex",
		flexDirection: "row",
	},
	signatureParty: {
		width: "50%",
		paddingRight: 24,
	},
	signatureLabel: {
		marginBottom: 8,
		fontFamily: "Times-Bold",
		fontSize: 8,
		letterSpacing: 0.8,
		color: "#737373",
	},
	signatureCompany: {
		marginBottom: 7,
		fontFamily: "Times-Bold",
		fontSize: 11,
		color: "#171717",
	},
	signatureFieldLabel: {
		marginTop: 5,
		marginBottom: 2,
		fontFamily: "Times-Bold",
		fontSize: 9,
		color: "#525252",
	},
	signatureSigningFieldLabel: {
		marginTop: 8,
		marginBottom: 3,
		fontFamily: "Times-Bold",
		fontSize: 9,
		color: "#525252",
	},
	signatureSigningLine: {
		marginTop: 2,
		marginBottom: 2,
		height: 14,
		width: 180,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
	},
	signatureSigningDateLine: {
		marginTop: 2,
		width: 180,
		height: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
	},
	signatureFieldValue: {
		fontSize: 10.5,
		color: "#171717",
	},
	signatureImage: {
		marginTop: 2,
		marginBottom: 2,
		maxHeight: 40,
		maxWidth: 180,
		objectFit: "contain",
		objectPosition: "left",
	},
	signatureLine: {
		marginTop: 2,
		marginBottom: 2,
		height: 24,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
	},
	signatureDateLine: {
		marginTop: 2,
		width: 120,
		height: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
	},
});
