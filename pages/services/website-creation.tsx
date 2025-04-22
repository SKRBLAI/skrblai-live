import PageLayout from '@/components/layout/PageLayout'
import PercyChat from '@/components/PercyChat'

const WebsiteCreationPage = () => (
  <PageLayout title="Website Creation">
    <PercyChat service="web-creation" />
    {/* Add service-specific content and visuals here */}
  </PageLayout>
)

export default WebsiteCreationPage
