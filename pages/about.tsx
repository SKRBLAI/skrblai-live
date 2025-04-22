import PageLayout from '@/components/layout/PageLayout'

const About = () => (
  <PageLayout title="About SKRBL AI">
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-4">Why SKRBL AI?</h1>
      <p className="mb-6 text-lg text-gray-300">
        SKRBL AI was created to give creators, business owners, and authors the power to launch ideas with less friction and more precision.
        From branding to publishing, we help people go from spark to scale — fast.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-3">What We Offer</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>📚 Book Publishing Assistants</li>
        <li>🎨 Branding & Identity Creation</li>
        <li>🤖 Content Automation Tools</li>
        <li>🌐 AI-Powered Website Builders</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-3">Our Mission</h2>
      <p className="text-lg text-gray-300">
        Our mission is to democratize access to powerful creative tools and automation systems.
        With Percy and our specialized AI agents, we aim to simplify the complex and empower users to focus on what truly matters: creating, scaling, and thriving.
      </p>
    </section>
  </PageLayout>
)

export default About
