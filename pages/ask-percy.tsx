import PageLayout from '@/components/layout/PageLayout'
import PercyChat from '@/components/PercyChat'

const AskPercyPage = () => (
  <PageLayout title="Ask Percy">
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PercyChat />
    </div>
  </PageLayout>
)

export default AskPercyPage
