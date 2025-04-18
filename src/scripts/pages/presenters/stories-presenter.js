import StoryApi from "../../data/story-api";

export default class StoriesPresenter {
    constructor(view, storyApi = new StoryApi()) {
        this._view = view;
        this._storyApi = storyApi;
        this._page = 1;
        this._size = 10;
        this._showLocation = 0;
        this._loadingTimeout = null;
    }

    async loadStories(clearList = false) {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.hash = "#/login"; // SPA redirect
            return;
        }

        if (clearList) {
            this._view.showLoadingMessage();
            // Set a timeout to show error message if loading takes too long
            this._loadingTimeout = setTimeout(() => {
                this._view.showErrorMessage("Loading is taking longer than expected. Please refresh the page.");
            }, 10000); // 10 seconds timeout
        }

        try {
            const response = await this._storyApi.getAllStories({
                page: this._page,
                size: this._size,
                location: this._showLocation,
                token,
            });

            // Clear the timeout since we got a response
            if (this._loadingTimeout) {
                clearTimeout(this._loadingTimeout);
                this._loadingTimeout = null;
            }

            if (!response.error) {
                if (response.listStory && response.listStory.length > 0) {
                    this._view.renderStories(response.listStory, clearList);
                } else {
                    this._view.showErrorMessage("No stories found.");
                }
            } else {
                this._view.showErrorMessage(response.message || "Failed to load stories.");
            }
        } catch (error) {
            // Clear the timeout if there's an error
            if (this._loadingTimeout) {
                clearTimeout(this._loadingTimeout);
                this._loadingTimeout = null;
            }
            console.error("Failed to load stories:", error);
            this._view.showErrorMessage("Failed to load stories. Please try again.");
        }
    }

    async loadMoreStories() {
        this._page += 1;
        await this.loadStories(false);
    }

    toggleLocationFilter() {
        this._showLocation = this._showLocation === 0 ? 1 : 0;
        const toggleLocationBtn = document.getElementById("toggleLocation");
        toggleLocationBtn.textContent = this._showLocation === 1 ? "Hide Location" : "Show With Location";
        this._page = 1;
        this.loadStories(true);
    }

    createStoryCard(story) {
        const locationInfo =
            story.lat && story.lon ?
            `<p class="text-sm text-gray-500">📍 ${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}</p>` :
            "";

        return `
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <img src="${story.photoUrl}" alt="Story by ${story.name}" class="w-full h-64 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-800">${story.name}</h3>
            <p class="text-sm text-gray-600">${story.description}</p>
            ${locationInfo}
            <a href="#/stories/${story.id}" class="mt-2 text-blue-600 hover:text-blue-800 text-sm btn btn-link">View Details</a>
          </div>
        </div>
      `;
    }

    getPageSize() {
        return this._size;
    }
}