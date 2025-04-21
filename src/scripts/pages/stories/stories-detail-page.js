import StoryDetailPresenter from "../presenters/storiesDetail-presenter";

export default class StoryDetailPage {
    constructor() {
        this._presenter = new StoryDetailPresenter(this);
    }

    async render() {
        return `
            <div class="container mx-auto px-4 py-8">
                <div id="storyDetail" class="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                    <p class="text-gray-500">Loading story details...</p>
                </div>
                <div id="map" style="height: 400px; margin-top: 20px;"></div> 
            </div>
        `;
    }

    async afterRender() {
        const url = window.location.hash.split('/')[2]; // Ambil story ID dari URL
        this._presenter.loadStory(url);
    }

    displayStory(story) {
        const {
            name,
            description,
            photoUrl,
            photoData,
            lat,
            lon
        } = story;
        
        // Use photoData if available, otherwise fall back to photoUrl
        const imageSrc = photoData || photoUrl || '/icons/icon-192x192.png';
        
        const storyDetailContainer = document.getElementById('storyDetail');

        storyDetailContainer.innerHTML = `
            <img src="${imageSrc}" alt="${name}" class="w-full h-64 object-contain rounded-lg">
            <h2 class="text-2xl font-bold mt-4 text-black">${name}</h2>
            <p class="text-gray-600 mt-2">${description}</p>
            ${lat && lon ? `<p class="text-gray-500 mt-2">📍 Location: ${lat}, ${lon}</p>` : ''}
        `;

        if (lat && lon) {
            this._presenter.initializeMap(lat, lon, name, description);
        }
    }

    showError(message) {
        const storyDetailContainer = document.getElementById('storyDetail');
        storyDetailContainer.innerHTML = `<p class="text-red-500">${message}</p>`;
    }
}