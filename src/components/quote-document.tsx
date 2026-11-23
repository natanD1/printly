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
  /** `true` quando o cabeçalho usa o logo do Printly (sem logo da empresa). */
  isSystemLogo: boolean;
  issueDate: string;
  /** Data URI PNG/JPG já pronta: logo da empresa ou, sem ele, o do Printly. */
  logoSrc: string | null;
  photoSrc: string | null;
  productName: string;
  quantity: number;
  /** Logo do Printly em PNG pro rodapé (ou `null` se a conversão falhar). */
  systemLogoSrc: string | null;
  totalLabel: string;
  unitLabel: string;
  validUntil: string;
}

const styles = StyleSheet.create({
  body: { color: "#18181b", fontSize: 11, padding: 40 },
  companyName: { fontSize: 18, fontWeight: 700 },
  contacts: { color: "#52525b", fontSize: 10, marginTop: 2 },
  footer: {
    alignItems: "center",
    bottom: 24,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    left: 40,
    position: "absolute",
    right: 40,
  },
  footerLogo: { height: 14, width: 50 },
  footerText: { color: "#a1a1aa", fontSize: 9 },
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
  // Logo horizontal do Printly (916×256): mesma altura visual, largura proporcional.
  systemLogo: { height: 32, width: 115 },
  title: { fontSize: 13, fontWeight: 700, marginTop: 24 },
  total: { fontSize: 14, fontWeight: 700 },
});

export function QuoteDocument({
  company,
  isSystemLogo,
  issueDate,
  logoSrc,
  photoSrc,
  productName,
  quantity,
  systemLogoSrc,
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
          {logoSrc ? (
            <Image
              src={logoSrc}
              style={isSystemLogo ? styles.systemLogo : styles.logo}
            />
          ) : null}
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

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>Gerado com</Text>
          {systemLogoSrc ? (
            <Image src={systemLogoSrc} style={styles.footerLogo} />
          ) : (
            <Text style={styles.footerText}>Printly</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
