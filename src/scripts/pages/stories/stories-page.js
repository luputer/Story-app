import StoriesPresenter from "../presenters/stories-presenter";
import StoryIdb from "../../data/idb-service";

export default class StoriesPage {
  constructor() {
    this._presenter = new StoriesPresenter(this);
  }

  async render() {
    return `
<div class="container mx-auto px-2 py-4">
  <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
    <h1 class="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Stories</h1>
    <div class="flex flex-wrap gap-2">
      <button id="toggleLocation" class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded border shadow-sm transition btn btn-dash">
        Show With Location
      </button>
      <a href="#/add" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded border shadow-sm transition btn btn-primary">
        Add New Story
      </a>
    </div>
  </div>
  <div id="storiesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <p id="loadingMessage" class="text-gray-500 text-center col-span-full text-sm">Loading stories...</p>
  </div>
  <div class="flex justify-center mt-4">
    <button id="loadMore" class="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded border shadow-sm transition hidden btn btn-dash">
      Load More
    </button>
  </div>
</div>
    `;
  }

  async afterRender() {
    // Toggle location filter
    document.getElementById("toggleLocation").addEventListener("click", () => {
      this._presenter.toggleLocationFilter();
    });

    // Load more stories
    document.getElementById("loadMore").addEventListener("click", () => {
      this._presenter.loadMoreStories();
    });

    // Initial stories load
    await this._presenter.loadStories(true);
  }

  async renderStories(stories, clearList = false) {
    const storiesList = document.getElementById("storiesList");
    const loadMoreBtn = document.getElementById("loadMore");

    if (clearList) storiesList.innerHTML = "";

    try {
      // Get offline stories from IndexedDB
      const offlineStories = await StoryIdb.getAllStories();
      
      // Combine online and offline stories
      const combinedStories = [...stories, ...offlineStories];
      
      // Remove duplicates based on id
      const uniqueStories = Array.from(new Map(combinedStories.map(story => [story.id, story])).values());

      uniqueStories.forEach((story) => {
        const storyCard = this._presenter.createStoryCard(story);
        storiesList.insertAdjacentHTML("beforeend", storyCard);
      });
    } catch (error) {
      console.error('Error fetching offline stories:', error);
      // If there's an error, just render the online stories
      stories.forEach((story) => {
        const storyCard = this._presenter.createStoryCard(story);
        storiesList.insertAdjacentHTML("beforeend", storyCard);
      });
    }

    // Hide "Load More" button if no more data
    if (stories.length < this._presenter.getPageSize()) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }
  }

  showLoadingMessage() {
    const storiesList = document.getElementById("storiesList");
    storiesList.innerHTML = `<p class="text-gray-500 text-center col-span-full">Loading stories...</p>`;
  }

  showErrorMessage(message) {
    const storiesList = document.getElementById("storiesList");
    if (!storiesList) {
      console.error('Stories list element not found');
      return;
    }
    storiesList.innerHTML = `<p class="text-red-500 text-center col-span-full">${message}</p>`;
  }
}