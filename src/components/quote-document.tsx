import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { QuoteCompany } from "@/types/quote";

export interface QuoteDocumentProps {
  company: Pick<
    QuoteCompany,
    "email" | "instagram" | "name" | "phone" | "website" | "whatsApp"
  >;
  issueDate: string;
  /** Data URI PNG/JPG já pronta (ou `null`). */
  logoSrc: string | null;
  photoSrc: string | null;
  productName: string;
  quantity: number;
  totalLabel: string;
  unitLabel: string;
  validUntil: string;
}

const styles = StyleSheet.create({
  body: { color: "#18181b", fontSize: 11, padding: 40 },
  companyName: { fontSize: 18, fontWeight: 700 },
  contacts: { color: "#52525b", fontSize: 10, marginTop: 2 },
  footer: {
    bottom: 24,
    color: "#a1a1aa",
    fontSize: 9,
    left: 40,
    position: "absolute",
    right: 40,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#e4e4e7",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingBottom: 16,
  },
  logo: { height: 56, objectFit: "contain", width: 56 },
  meta: { color: "#52525b", fontSize: 10, marginTop: 16 },
  photo: {
    height: 160,
    marginTop: 16,
    objectFit: "contain",
    objectPosition: "left",
    width: 240,
  },
  productName: { fontSize: 15, fontWeight: 700, marginTop: 20 },
  row: {
    borderBottomColor: "#e4e4e7",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLabel: { color: "#52525b" },
  title: { fontSize: 13, fontWeight: 700, marginTop: 24 },
  total: { fontSize: 14, fontWeight: 700 },
});

export function QuoteDocument({
  company,
  issueDate,
  logoSrc,
  photoSrc,
  productName,
  quantity,
  totalLabel,
  unitLabel,
  validUntil,
}: QuoteDocumentProps) {
  const contacts = [
    company.phone && `Telefone: ${company.phone}`,
    company.whatsApp && `WhatsApp: ${company.whatsApp}`,
    company.email && `E-mail: ${company.email}`,
    company.instagram && `Instagram: ${company.instagram}`,
    company.website && `Site: ${company.website}`,
  ].filter((line): line is string => Boolean(line));

  return (
    <Document title={`Orçamento - ${productName}`}>
      <Page size="A4" style={styles.body}>
        <View style={styles.header}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            {contacts.map((line) => (
              <Text key={line} style={styles.contacts}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.title}>Orçamento</Text>
        <Text style={styles.meta}>
          Emissão: {issueDate} | Validade: 7 dias (até {validUntil})
        </Text>

        <Text style={styles.productName}>{productName}</Text>
        {photoSrc ? <Image src={photoSrc} style={styles.photo} /> : null}

        <View style={{ marginTop: 20 }}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Quantidade</Text>
            <Text>{quantity} un.</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valor unitário</Text>
            <Text>{unitLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.total}>Total</Text>
            <Text style={styles.total}>{totalLabel}</Text>
          </View>
        </View>

        <Text fixed style={styles.footer}>
          Gerado com Printly
        </Text>
      </Page>
    </Document>
  );
}
