export default class Notfond {
    async render() {
        return `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4">
                <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div class="text-center">
                        <h1 class="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">404</h1>
                        <div class="flex justify-center my-4">
                            <div class="w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                        <p class="text-gray-600 mb-8">Sorry, the page you are looking for doesn't exist or has been moved.</p>
                        <div class="flex flex-col sm:flex-row justify-center gap-4">
                            <a href="/" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Go Home
                            </a>
                            <button onclick="history.back()" class="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition duration-300 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        // Scroll to top to ensure the 404 page is fully visible
        window.scrollTo(0, 0);
        
        // Add tracking for 404 page views (if analytics are implemented)
        try {
            if (typeof gtag === 'function') {
                gtag('event', '404_page_view', {
                    'page_path': window.location.pathname
                });
            }
        } catch (error) {
            console.log('Analytics not available');
        }
    }
}