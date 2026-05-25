import {
	Document,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import {
	formatCents,
	formatInvoiceDate,
	formatInvoiceNumber,
	formatQuantity,
} from "@/lib/format";
import { lineItemTotalCents } from "@/lib/invoice-math";
import {
	getLineItemDescriptionParts,
	inferIncludeLineItemDates,
	type LineItem,
} from "@/lib/line-items";
import { registerInvoicePdfFonts } from "@/lib/invoice-pdf-fonts";

registerInvoicePdfFonts();

type Business = {
	name: string;
	phone: string;
	email: string;
	abn: string;
	accountName: string;
	bsb: string;
	accountNumber: string;
	gstRegistered: boolean;
	cardSurchargePercent: number;
	payOnlineUrl?: string;
	thankYouLine1: string;
	thankYouLine2: string;
};

type Client = {
	contactName: string;
	companyName: string;
	abn?: string;
};

type InvoicePdfDocumentProps = {
	business: Business;
	client: Client;
	invoiceNumber: number;
	issuedAt: number;
	dueAt: number;
	lineItems: LineItem[];
	includeLineItemDates?: boolean;
	totalCents: number;
};

const accentColor = "#2a3548";

export function InvoicePdfDocument({
	business,
	client,
	invoiceNumber,
	issuedAt,
	dueAt,
	lineItems,
	includeLineItemDates,
	totalCents,
}: InvoicePdfDocumentProps) {
	const showLineDates =
		includeLineItemDates ?? inferIncludeLineItemDates(lineItems);
	const invoiceLabel = formatInvoiceNumber(invoiceNumber, client.companyName);

	return (
		<Document title={`Invoice ${invoiceLabel}`}>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<Text style={styles.logoText}>tw</Text>
						<View style={styles.businessDetails}>
							<Text style={styles.businessName}>{business.name}</Text>
							<Text style={styles.accentText}>{business.phone}</Text>
							<Text style={styles.accentText}>{business.email}</Text>
							<Text style={styles.accentText}>ABN: {business.abn}</Text>
						</View>
					</View>

					<View style={styles.headerRight}>
						<Text style={styles.invoiceTitle}>Invoice</Text>
						<View style={styles.clientDetails}>
							<Text style={styles.clientContact}>{client.contactName}</Text>
							<Text style={styles.clientCompany}>{client.companyName}</Text>
							{client.abn?.trim() ? (
								<Text style={styles.clientCompany}>ABN: {client.abn.trim()}</Text>
							) : null}
						</View>
						<View style={styles.metaTable}>
							<MetaRow label="Number" value={invoiceLabel} />
							<MetaRow label="Issued" value={formatInvoiceDate(issuedAt)} />
							<MetaRow label="Due" value={formatInvoiceDate(dueAt)} />
							<MetaRow
								label="Total"
								value={formatCents(totalCents)}
								bold
								last
							/>
						</View>
					</View>
				</View>

				<View style={styles.lineItemsTable}>
					<View style={styles.lineItemsHeader}>
						<View style={styles.colDescription}>
							<Text style={styles.lineItemsHeaderCell}>Description</Text>
						</View>
						<View style={styles.colQuantity}>
							<Text style={styles.lineItemsHeaderCell}>Quantity</Text>
						</View>
						<View style={styles.colRate}>
							<Text style={styles.lineItemsHeaderCell}>Rate</Text>
						</View>
						<View style={[styles.colTotal, styles.alignRight]}>
							<Text style={styles.lineItemsHeaderCell}>Total</Text>
						</View>
					</View>

					{lineItems.map((item, index) => {
						const { date, description } = getLineItemDescriptionParts(
							item,
							showLineDates,
						);

						return (
							<View key={index} style={styles.lineItemRow}>
								<View style={styles.colDescription}>
									{date != null ? (
										<View style={styles.descriptionWithDate}>
											<Text style={styles.lineDate}>{date}</Text>
											<View style={styles.lineDescriptionWrap}>
												<Text style={styles.lineDescription}>
													{description}
												</Text>
											</View>
										</View>
									) : (
										<Text style={styles.lineDescription}>{description}</Text>
									)}
								</View>
								<View style={styles.colQuantity}>
									<Text style={styles.lineItemCell}>
										{formatQuantity(item.quantity)}
									</Text>
								</View>
								<View style={styles.colRate}>
									<Text style={styles.lineItemCell}>
										{formatCents(item.rateCents)}
									</Text>
								</View>
								<View style={[styles.colTotal, styles.alignRight]}>
									<Text style={styles.lineItemCell}>
										{formatCents(lineItemTotalCents(item))}
									</Text>
								</View>
							</View>
						);
					})}

					<View style={styles.totalRow}>
						<View style={styles.colDescription} />
						<View style={styles.colQuantity} />
						<View style={[styles.colRate, styles.alignRight]}>
							<Text style={styles.totalLabel}>Total</Text>
						</View>
						<View style={[styles.colTotal, styles.alignRight]}>
							<Text style={styles.totalValue}>{formatCents(totalCents)}</Text>
						</View>
					</View>

					{!business.gstRegistered && (
						<>
							<View style={styles.noGstDividerRow}>
								<View style={styles.colDescription} />
								<View style={styles.colQuantity} />
								<View style={styles.noGstDividerCell} />
							</View>
							<View style={styles.noGstTextRow}>
								<View style={styles.colDescription} />
								<View style={styles.colQuantity} />
								<View style={styles.noGstTextCell}>
									<Text style={styles.noGstText}>No GST has been charged</Text>
								</View>
							</View>
						</>
					)}
				</View>

				<View style={styles.paymentSection}>
					<Text style={styles.sectionTitle}>Payment details</Text>
					<Text style={styles.paymentIntro}>
						Please make payments via direct deposit to:
					</Text>
					<Text style={styles.paymentDetails}>
						<Text style={styles.semibold}>Name:</Text> {business.accountName}
						<Text style={styles.separator}> · </Text>
						<Text style={styles.semibold}>BSB:</Text> {business.bsb}
						<Text style={styles.separator}> · </Text>
						<Text style={styles.semibold}>ACN:</Text> {business.accountNumber}
					</Text>
					{business.payOnlineUrl && (
						<>
							<Link src={business.payOnlineUrl} style={styles.payOnlineLink}>
								Pay invoice online
							</Link>
							<Text style={styles.surchargeText}>
								A {business.cardSurchargePercent}% surcharge applies to card
								payments
							</Text>
						</>
					)}
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerLine}>{business.thankYouLine1}</Text>
					<Text style={styles.footerLine}>{business.thankYouLine2}</Text>
				</View>
			</Page>
		</Document>
	);
}

function MetaRow({
	label,
	value,
	bold = false,
	last = false,
}: {
	label: string;
	value: string;
	bold?: boolean;
	last?: boolean;
}) {
	return (
		<View style={last ? [styles.metaRow, styles.metaRowLast] : styles.metaRow}>
			<Text style={styles.metaLabel}>{label}</Text>
			<Text style={bold ? styles.metaValueBold : styles.metaValue}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingTop: 30,
		paddingRight: 36,
		paddingBottom: 30,
		paddingLeft: 36,
		fontFamily: "Helvetica",
		fontSize: 11.25,
		lineHeight: 1.35,
		color: "#000000",
		backgroundColor: "#ffffff",
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 24,
	},
	headerLeft: {
		width: "50%",
	},
	headerRight: {
		width: "50%",
		alignItems: "flex-end",
	},
	logoText: {
		fontFamily: "Raleway",
		fontSize: 36,
		lineHeight: 1,
		letterSpacing: -2.2,
		marginBottom: 9,
		textTransform: "lowercase",
	},
	businessDetails: {},
	businessName: {
		fontFamily: "Helvetica-Bold",
		fontSize: 11.25,
		color: accentColor,
		marginBottom: 2,
	},
	accentText: {
		fontSize: 11.25,
		color: accentColor,
		marginBottom: 2,
	},
	invoiceTitle: {
		fontFamily: "Helvetica-Bold",
		fontSize: 11.25,
		letterSpacing: 0.7,
		textTransform: "uppercase",
		marginBottom: 9,
	},
	clientDetails: {
		alignItems: "flex-end",
		marginBottom: 9,
	},
	clientContact: {
		fontFamily: "Helvetica-Bold",
		fontSize: 11.25,
	},
	clientCompany: {
		marginTop: 1.5,
		fontSize: 11.25,
		color: accentColor,
	},
	metaTable: {
		width: 204,
		fontSize: 11.25,
	},
	metaRow: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.15)",
		paddingVertical: 3,
	},
	metaRowLast: {
		borderBottomWidth: 0,
	},
	metaLabel: {
		paddingRight: 18,
		color: "rgba(0,0,0,0.55)",
	},
	metaValue: {
		textAlign: "right",
	},
	metaValueBold: {
		fontFamily: "Helvetica-Bold",
		textAlign: "right",
	},
	lineItemsTable: {
		marginBottom: 30,
		fontSize: 9,
	},
	lineItemsHeader: {
		display: "flex",
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.2)",
		paddingBottom: 6,
	},
	lineItemsHeaderCell: {
		fontFamily: "Helvetica-Bold",
		fontSize: 8.25,
		letterSpacing: 0.9,
		textTransform: "uppercase",
	},
	lineItemRow: {
		display: "flex",
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
		paddingVertical: 7.5,
	},
	lineItemCell: {
		fontSize: 9,
	},
	colDescription: {
		flex: 1,
		paddingRight: 12,
	},
	colQuantity: {
		width: 66,
		paddingRight: 12,
	},
	colRate: {
		width: 66,
		paddingRight: 12,
	},
	colTotal: {
		width: 66,
	},
	alignRight: {
		textAlign: "right",
	},
	descriptionWithDate: {
		display: "flex",
		flexDirection: "row",
	},
	lineDate: {
		width: 63,
		fontSize: 9,
	},
	lineDescriptionWrap: {
		flex: 1,
	},
	lineDescription: {
		fontSize: 9,
	},
	totalRow: {
		display: "flex",
		flexDirection: "row",
		paddingTop: 12,
	},
	totalLabel: {
		fontFamily: "Helvetica-Bold",
		fontSize: 11.25,
		color: accentColor,
	},
	totalValue: {
		fontFamily: "Helvetica-Bold",
		fontSize: 11.25,
		color: accentColor,
	},
	noGstDividerRow: {
		display: "flex",
		flexDirection: "row",
	},
	noGstDividerCell: {
		width: 144,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.15)",
	},
	noGstTextRow: {
		display: "flex",
		flexDirection: "row",
		paddingTop: 4.5,
	},
	noGstTextCell: {
		width: 144,
	},
	noGstText: {
		fontSize: 9,
		color: "rgba(0,0,0,0.5)",
		textAlign: "right",
	},
	paymentSection: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontFamily: "Helvetica-Bold",
		fontSize: 8.25,
		letterSpacing: 0.9,
		textTransform: "uppercase",
		marginBottom: 9,
	},
	paymentIntro: {
		marginBottom: 9,
		fontSize: 11.25,
	},
	paymentDetails: {
		fontSize: 11.25,
		lineHeight: 1.45,
	},
	semibold: {
		fontFamily: "Helvetica-Bold",
	},
	separator: {
		color: "rgba(0,0,0,0.3)",
	},
	payOnlineLink: {
		marginTop: 12,
		fontSize: 11.25,
		color: "#000000",
		textDecoration: "underline",
	},
	surchargeText: {
		marginTop: 6,
		fontSize: 11.25,
	},
	footer: {
		fontSize: 11.25,
		lineHeight: 1.45,
	},
	footerLine: {
		marginBottom: 2,
	},
});
