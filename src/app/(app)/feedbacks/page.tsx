import { FeedbacksOverview } from "@/components/feedbacks-overview";
import { PageHeader } from "@/components/page-header";

export default function FeedbacksPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Acompanhe sugestões, relatos e mensagens enviadas pelos usuários."
        title="Feedbacks"
      />
      <FeedbacksOverview />
    </main>
  );
}
