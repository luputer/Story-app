import { openDB } from "idb";

const DATABASE_NAME = 'story-app-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { 
        keyPath: 'id',
        autoIncrement: true, 
      });
    }
  },
});

const StoryIdb = {
  async addStory(storyData) {
    try {
      if (!storyData || typeof storyData !== 'object') {
        throw new Error('Invalid story data');
      }

      if (!storyData.title || !storyData.description) {
        throw new Error('Story must have a title and description');
      }

      const db = await dbPromise;
      const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const story = {
        ...storyData,
        createdAt: new Date().toISOString(),
      };

      const id = await store.add(story);
      await tx.done;

      return { id, ...story };
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  },

  async getStory(id) {
    try {
      const db = await dbPromise;
      const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const story = await store.get(id);
      await tx.done;
      return story;
    } catch (error) {
      console.error('Error getting story:', error);
      throw error;
    }
  },

  async getAllStories() {
    try {
      const db = await dbPromise;
      const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const stories = await store.getAll();
      await tx.done;
      return stories;
    } catch (error) {
      console.error('Error getting all stories:', error);
      throw error;
    }
  },

  async putStory(story) {
    try {
      if (!story || typeof story !== 'object') {
        throw new Error('Invalid story data');
      }
      const db = await dbPromise;
      const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const result = await store.put(story);
      await tx.done;
      return result;
    } catch (error) {
      console.error('Error putting story:', error);
      throw error;
    }
  },

  async deleteStory(id) {
    try {
      const db = await dbPromise;
      const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await store.delete(id);
      await tx.done;
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  },

  async searchStories(query) {
    const stories = await this.getAllStories();
    return stories.filter((story) => {
      const loweredQuery = query.toLowerCase();
      return story.title?.toLowerCase().includes(loweredQuery) ||
             story.description?.toLowerCase().includes(loweredQuery);
    });
  },

  async clearStories() {
    const db = await dbPromise;
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.clear();
    await tx.done;
    return true;
  },
};

export default StoryIdb;