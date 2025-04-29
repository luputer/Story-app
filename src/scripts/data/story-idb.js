import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const STORY_STORE_NAME = 'stories';

const StoryIdb = {
  async initDb() {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(database) {
        const storyObjectStore = database.createObjectStore(STORY_STORE_NAME, {
          keyPath: 'id',
        });
        storyObjectStore.createIndex('name', 'name');
      },
    });
  },

  async getAllStories() {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readonly');
    const store = tx.objectStore(STORY_STORE_NAME);
    return store.getAll();
  },

  async getStoryById(id) {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readonly');
    const store = tx.objectStore(STORY_STORE_NAME);
    return store.get(id);
  },

  async putStory(story) {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORY_STORE_NAME);
    await store.put(story);
    await tx.complete;
  },

  async putStories(stories) {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORY_STORE_NAME);
    
    await Promise.all(stories.map(story => store.put(story)));
    await tx.complete;
  },

  async deleteStory(id) {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORY_STORE_NAME);
    await store.delete(id);
    await tx.complete;
  },

  async clearStories() {
    const db = await this.initDb();
    const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORY_STORE_NAME);
    await store.clear();
    await tx.complete;
  },
};

export default StoryIdb;