import StoryApi from "../../data/story-api";

export default class AddStoryPresenter {
  constructor(view) {
    this._view = view;
    this._storyApi = new StoryApi();
  }

  async init() {
    this._view.bindSubmit(this._handleSubmit.bind(this));
  }

  async _handleSubmit(description, photoFile) {
    if (!photoFile) {
      alert("Please upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photoFile);

    try {
      await this._storyApi.addStory(formData);
      alert("Story added successfully!");
      window.location.hash = "#/stories";
    } catch (error) {
      alert("Failed to add story: " + error.message);
    }
  }
}
