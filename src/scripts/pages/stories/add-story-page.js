import StoryApi from "../../data/story-api";
import StoryIdb from "../../data/idb-service";
import swal from "sweetalert";

export default class AddStoryPage {
  constructor(storyApi = null) {
    this._storyApi = storyApi || new StoryApi();
    this._selectedLat = null;
    this._selectedLon = null;
  }

  async render() {
    return `
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Add New Story</h1>
        <form id="addStoryForm" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Story Name</label>
            <input type="text" id="name" name="name" required
              class="mt-1 block bg-white text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 input-secondary input ">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" required
              class="mt-1 block w-full  bg-white text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 textarea textarea-accent "></textarea>
          </div>
          <div class="shadow-lg p-4 rounded-md border border-gray-300">
            <label for="camera" class="block text-sm font-medium text-gray-700">Open Camera</label>
            <button type="button" id="openCameraButton" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Open Camera</button>
            <button type="button" id="closeCameraButton" style="display: none;" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Close Camera</button>
            <div class="flex space-x-4 mt-4">
              <div class="w-1/2">
                <video id="camera" class="w-full rounded-md shadow-md" style="display: none;" autoplay></video>
              </div>
              <div class="w-1/2">
                <canvas id="canvas" class="w-full rounded-md shadow-md" style="display: none;"></canvas>
                <button type="button" id="captureButton" style="display: none;" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Capture Photo</button>
              </div>
            </div>
          </div>
          <div>
            <label for="photoInput" class="block text-sm font-medium text-gray-700">Capture Photo</label>
            <input type="file" id="photoInput" name="photoInput" accept="image/*" required
              class="file-input file-input-accent text-black font-semibold bg-white  mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label for="map" class="block text-sm font-medium text-gray-700">Pick Location</label>
            <div id="map" style="height: 400px;" class="rounded-md shadow-md border border-gray-300"></div>
            <p id="selectedCoordinates" class="text-sm text-gray-500 mt-2">Click on the map to select a location</p>
          </div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add Story
          </button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    console.log("afterRender - Story API instance:", this._storyApi);

    const addStoryForm = document.getElementById("addStoryForm");
    const selectedCoordinates = document.getElementById("selectedCoordinates");
    const openCameraButton = document.getElementById("openCameraButton");
    const closeCameraButton = document.getElementById("closeCameraButton");
    const camera = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const captureButton = document.getElementById("captureButton");

    const map = L.map("map").setView([-3.3162, 114.5904], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    let marker;

    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      this._selectedLat = lat;
      this._selectedLon = lng;
      selectedCoordinates.textContent = `Selected Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      if (marker) {
        map.removeLayer(marker);
      }

      marker = L.marker([lat, lng]).addTo(map);
    });

    openCameraButton.addEventListener("click", async () => {
      try {
        camera.style.display = "block";
        captureButton.style.display = "block";
        canvas.style.display = "block";
        closeCameraButton.style.display = "block";
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        camera.srcObject = stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
        swal("Error", "Could not access camera. Please check camera permissions.", "error");
      }
    });

    closeCameraButton.addEventListener("click", () => {
      const stream = camera.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      camera.style.display = "none";
      captureButton.style.display = "none";
      canvas.style.display = "none";
      closeCameraButton.style.display = "none";
    });

    captureButton.addEventListener("click", () => {
      try {
        const context = canvas.getContext("2d");
        canvas.width = camera.videoWidth;
        canvas.height = camera.videoHeight;
        context.drawImage(camera, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          const photoInput = document.getElementById("photoInput");
          const file = new File([blob], "photo.png", {
            type: "image/png"
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          photoInput.files = dataTransfer.files;
        });
      } catch (error) {
        console.error("Error capturing photo:", error);
        swal("Error", "Failed to capture photo. Please try again.", "error");
      }
    });

    addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!this._storyApi) {
        console.error("StoryApi is undefined!");
        swal("Error", "Application error: StoryApi is undefined", "error");
        return;
      }

      const description = document.getElementById("description").value;
      const photoInput = document.getElementById("photoInput");

      if (!this._selectedLat || !this._selectedLon) {
        swal("Warning", "Please select a location on the map.", "warning");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          swal("Error", "Authentication token is missing. Please log in again.", "error");
          return;
        }

        console.log("Token:", token);

        const photoFile = photoInput.files[0];
        if (!photoFile) {
          swal("Warning", "Please select a photo.", "warning");
          return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile);
        formData.append('lat', this._selectedLat);
        formData.append('lon', this._selectedLon);

        const response = await this._storyApi.addStory(formData, token);

        if (!response.error) {
          // Save to IndexedDB
          try {
            const storyData = {
              id: response.data?.story?.id || Date.now().toString(),
              title: document.getElementById("name").value,
              description: description,
              photoUrl: null,
              lat: this._selectedLat,
              lon: this._selectedLon,
              createdAt: new Date().toISOString()
            };

            // Store the actual file as a blob in IndexedDB instead of a URL
            if (photoFile) {
              try {
                const reader = new FileReader();
                reader.onload = async function(event) {
                  storyData.photoData = event.target.result; // Store blob data directly
                  await StoryIdb.addStory(storyData);
                };
                reader.readAsDataURL(photoFile); // Convert to data URL
              } catch (fileError) {
                console.error('Failed to process image file:', fileError);
                await StoryIdb.addStory(storyData); // Save without photo if processing fails
              }
            } else {
              await StoryIdb.addStory(storyData);
            }
            
            // Validate required fields before saving to IndexedDB
            if (!storyData.title || !storyData.description) {
              throw new Error('Story must have a title and description');
            }
          } catch (idbError) {
            console.error('Failed to save to IndexedDB:', idbError);
            // Continue with the flow even if IndexedDB save fails
          }

          swal("Success", "Story added successfully!", "success").then(() => {
            // Send push notification to subscribers
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                // Get story details for the notification
                const storyTitle = document.getElementById("name").value;
                const storyDescription = description.substring(0, 50) + (description.length > 50 ? '...' : '');
                
                // Send message to service worker
                registration.active.postMessage({
                  type: 'NEW_STORY',
                  title: 'New Story: ' + storyTitle,
                  body: storyDescription,
                  url: '#/stories',
                  icon: '/icons/icon-192x192.png',
                  timestamp: Date.now()
                });
                
                console.log('Notification message sent to service worker');
              }).catch(error => {
                console.error('Error sending notification:', error);
              });
            }
            window.location.href = "#/stories";
          });
        } else {
          swal("Error", `Failed to add story: ${response.message}`, "error");
        }

        const stream = camera.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
        camera.style.display = "none";
        captureButton.style.display = "none";
        canvas.style.display = "none";
        closeCameraButton.style.display = "none";
      } catch (error) {
        console.error("Failed to add story:", error);
        swal("Error", "Failed to add story. Please try again.", "error");
      }
    });
  }
}