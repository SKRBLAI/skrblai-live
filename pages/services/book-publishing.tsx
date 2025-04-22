import PageLayout from '@/components/layout/PageLayout'
import PercyChat from '@/components/PercyChat'

const BookPublishingPage = () => (
  <PageLayout title="Book Publishing">
    <PercyChat service="book-publishing" />
    {/* Add service-specific content and visuals here */}
  </PageLayout>
)

export default BookPublishingPage
