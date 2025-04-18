import StoryApi from "../../data/story-api";

export default class StoryDetailPresenter {
    constructor(view, storyApi = new StoryApi()) {
        this._view = view;
        this._storyApi = storyApi;
    }

    async loadStory(storyId) {
        const token = localStorage.getItem('token');

        if (!token) {
            this._view.showError("Authentication required. Please log in.");
            return;
        }

        try {
            console.log("Fetching story with ID:", storyId);
            const response = await this._storyApi.getStoryDetail(storyId, token);
            console.log("API Response:", response);

            if (!response || response.error) {
                throw new Error(response?.message || "Failed to fetch story details.");
            }

            this._view.displayStory(response.story);
        } catch (error) {
            console.error("Error loading story details:", error);
            this._view.showError("Failed to load story details. Please try again.");
        }
    }

    initializeMap(lat, lon, name, description) {
        setTimeout(() => {
            const map = L.map('map').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${name}</b><br>${description}`)
                .openPopup();
        }, 100);
    }
}
