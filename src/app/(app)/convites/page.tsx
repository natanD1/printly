import { InviteCodesOverview } from "@/components/invite-codes-overview";
import { PageHeader } from "@/components/page-header";

export default function ConvitesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gere e acompanhe os códigos de convite para novos cadastros."
        title="Convites"
      />
      <InviteCodesOverview />
    </main>
  );
}
