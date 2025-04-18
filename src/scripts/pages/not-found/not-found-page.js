export default class NotFoundPage {
  async render() {
    return `
      <section class="container flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div class="max-w-md mx-auto">
          <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-black mb-4">Page Not Found</h2>
          <p class="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <a href="#/" class="btn btn-primary gradient-btn">
            Back to Home
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // No additional functionality needed for this page
  }
}