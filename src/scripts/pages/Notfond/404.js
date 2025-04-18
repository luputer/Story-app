export default class Notfond {
    async render() {
        return `
            <div class="min-h-screen flex items-center justify-center bg-gray-100">
                <div class="text-center">
                    <h1 class="text-9xl font-bold text-gray-800">404</h1>
                    <p class="text-2xl font-semibold text-gray-600 mt-4">Page Not Found</p>
                    <p class="text-gray-500 mt-2">Sorry, the page you are looking for does not exist.</p>
                    <a href="/" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300">Go Home</a>
                </div>
            </div>
        `;
    }

    async afterRender() {
        // Any additional JavaScript to run after the page is rendered
    }
}