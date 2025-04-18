import StoryIdb from './db';
import API_ENDPOINT from '../config/api-endpoint';

const NetworkHandler = {
  async init() {
    this._registerServiceWorkerMessage();
    window.addEventListener('online', this._handleOnline.bind(this));
    window.addEventListener('offline', this._handleOffline.bind(this));
  },

  _registerServiceWorkerMessage() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data.type === 'CACHE_STORIES') {
          await this._saveStoriesToIndexedDB(event.data.stories);
        } else if (event.data.type === 'ERROR') {
          console.error('Error from service worker:', event.data.error);
        }
      });
    }
  },

  async _saveStoriesToIndexedDB(stories) {
    try {
      await StoryIdb.clearStories();
      await Promise.all(stories.map((story) => StoryIdb.putStory(story)));
    } catch (error) {
      console.error('Error saving stories to IndexedDB:', error);
      throw error;
    }
  },

  async _handleOnline() {
    console.log('Back online');
    this._syncStories();
  },

  async _handleOffline() {
    console.log('Gone offline');
  },

  async _syncStories() {
    try {
      const onlineStories = await this.getStories();
      const offlineStories = await StoryIdb.getAllStories();
      if (onlineStories.length !== offlineStories.length) {
        await this._saveStoriesToIndexedDB(onlineStories);
      }
    } catch (error) {
      console.error('Error syncing stories:', error);
    }
  },

  async getStories() {
    try {
      if (navigator.onLine) {
        const response = await this._fetchWithRetry(`${API_ENDPOINT.BASE_URL}${API_ENDPOINT.STORIES}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        return data.stories;
      }
      return await StoryIdb.getAllStories();
    } catch (error) {
      console.error('Error fetching stories:', error);
      return await StoryIdb.getAllStories();
    }
  },

  async _fetchWithRetry(url, options, retries = 3) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (retries <= 0) throw error;
      console.log(`Retrying fetch (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this._fetchWithRetry(url, options, retries - 1);
    }
  },

  async _handleOnline() {
    console.log('Back online');
    this._syncStories();
  },

  async _handleOffline() {
    console.log('Gone offline');
  },
};

export default NetworkHandler;