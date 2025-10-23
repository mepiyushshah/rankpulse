export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-primary">RankPulse</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Pulse Your Content to the Top
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              AI-powered SEO content automation platform. Generate, optimize, and publish
              long-form articles directly to WordPress, Webflow, and Shopify.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/auth/signup"
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </a>
              <a
                href="#features"
                className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary-light transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for SEO Content
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to automate your content workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Generation
              </h3>
              <p className="text-gray-600">
                Generate SEO-optimized articles up to 3000 words using advanced AI technology
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                150+ Languages
              </h3>
              <p className="text-gray-600">
                Create content in any language with native-quality writing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Content Scheduling
              </h3>
              <p className="text-gray-600">
                Schedule articles for automatic publishing at the perfect time
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multi-Platform Publishing
              </h3>
              <p className="text-gray-600">
                Publish directly to WordPress, Webflow, and Shopify with one click
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Work together with your team, assign roles, and manage workflows
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                SEO Optimized
              </h3>
              <p className="text-gray-600">
                Every article is optimized for search engines with proper structure and meta tags
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Scale Your Content?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of content creators using RankPulse to automate their SEO workflow
          </p>
          <a
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
          >
            Start Creating Content Free
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">RankPulse</h3>
              <p className="text-gray-400">
                Pulse Your Content to the Top
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RankPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
