import StoryIdb from './db';
import API_ENDPOINT from '../config/api-endpoint';

const NetworkHandler = {
  async init() {
    this._registerServiceWorkerMessage();
    window.addEventListener('online', this._handleOnline.bind(this));
    window.addEventListener('offline', this._handleOffline.bind(this));
    
    // Initialize offline status display
    this._updateOfflineStatus();
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
      
      // Process images before saving
      const storiesWithImages = await Promise.all(stories.map(async (story) => {
        if (story.photoUrl) {
          // Prefetch the image to ensure it's cached
          try {
            const response = await fetch(story.photoUrl);
            if (response.ok) {
              // Create a cache for images if it doesn't exist
              const cache = await caches.open('story-app-images-v2');
              await cache.put(story.photoUrl, response);
              
              // Store base64 version in IndexedDB as fallback
              const blob = await response.clone().blob();
              const reader = new FileReader();
              const base64Image = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              
              story.photoBase64 = base64Image;
            }
          } catch (error) {
            console.warn(`Failed to prefetch image for story ${story.id}:`, error);
            // Don't prevent saving the story if image fails
          }
        }
        return story;
      }));
      
      await Promise.all(storiesWithImages.map((story) => StoryIdb.putStory(story)));
      console.log('Successfully saved stories with images to IndexedDB');
    } catch (error) {
      console.error('Error saving stories to IndexedDB:', error);
      throw error;
    }
  },

  _updateOfflineStatus() {
    const offlineStatusElement = document.getElementById('offline-status');
    if (offlineStatusElement) {
      offlineStatusElement.textContent = navigator.onLine ? '' : 'You are offline. Limited functionality available.';
      offlineStatusElement.style.display = navigator.onLine ? 'none' : 'block';
    }
  },

  async _handleOnline() {
    console.log('Back online');
    this._updateOfflineStatus();
    await this._syncStories();
  },

  async _handleOffline() {
    console.log('Gone offline');
    this._updateOfflineStatus();
  },

  async _syncStories() {
    try {
      const onlineStories = await this._fetchOnlineStories();
      if (onlineStories && onlineStories.length > 0) {
        await this._saveStoriesToIndexedDB(onlineStories);
      }
    } catch (error) {
      console.error('Error syncing stories:', error);
    }
  },
  
  async _fetchOnlineStories() {
    try {
      const response = await this._fetchWithRetry(`${API_ENDPOINT.BASE_URL}${API_ENDPOINT.STORIES}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(localStorage.getItem('auth') ? {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth')).token}`
          } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.listStory || [];
    } catch (error) {
      console.error('Failed to fetch online stories:', error);
      return null;
    }
  },

  async getStories() {
    try {
      if (navigator.onLine) {
        const stories = await this._fetchOnlineStories();
        if (stories) {
          // Cache the successfully fetched stories
          await this._saveStoriesToIndexedDB(stories);
          return stories;
        }
      }
      
      // Fall back to cached stories
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

  // Helper function to get an image from cache or fall back to base64 from IndexedDB
  async getImageForStory(story) {
    if (!story || !story.photoUrl) return null;
    
    try {
      // First try to get from cache
      const cache = await caches.open('story-app-images-v2');
      const cachedResponse = await cache.match(story.photoUrl);
      
      if (cachedResponse && cachedResponse.ok) {
        return story.photoUrl; // Return the URL, it's in the cache
      }
      
      // If not in cache but we have a base64 version in IndexedDB
      if (story.photoBase64) {
        return story.photoBase64;
      }
      
      // If online, try to fetch it
      if (navigator.onLine) {
        try {
          const response = await fetch(story.photoUrl);
          if (response.ok) {
            await cache.put(story.photoUrl, response.clone());
            return story.photoUrl;
          }
        } catch (e) {
          console.warn('Failed to fetch image:', e);
        }
      }
      
      // Return placeholder if all else fails
      return '/icons/image-placeholder.png';
    } catch (error) {
      console.error('Error getting image for story:', error);
      return '/icons/image-placeholder.png';
    }
  }
};

export default NetworkHandler;