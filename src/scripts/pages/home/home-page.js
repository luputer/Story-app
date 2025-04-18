import Swal from 'sweetalert2';
import StoryIdb from '../../data/idb-service';

export default class HomePage {
  async render() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return `
      <section class="container" id="main-content">
      <div class="home-header text-black ">
        <h1>Welcome to Dicoding Story</h1>
        ${token
        ? `<p>Hello, ${user.name}! Share your Dicoding journey with others.</p>`
        : '<p>Share and discover stories from the Dicoding community.</p>'
        }
      </div>
      <div class="home-actions mb-2.5">
        ${token
        ? `
          <a href="#/stories" class="btn btn-primary gradient-btn">View Stories</a>
          <a href="#/add" class="btn btn-secondary gradient-btn">Share Your Story</a>
          `
        : `
          <a href="#/login" class="btn btn-primary gradient-btn">Login</a>
          <a href="#/register" class="btn btn-secondary gradient-btn">Register</a>
          `
        }
      </div>
      <div id="map" style="height: 400px;"></div>
      
      ${token ? `
        <div class="my-stories mt-4">
          <h2 class="text-2xl font-bold text-black mb-4">My Stories</h2>
          <div id="stories-grid" class="grid text-blue-400 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </div>

        <!-- Story Detail Modal -->
        <dialog id="story-modal" class="modal text-black">
          <div class="modal-box relative bg-fuchsia-50">
            <form method="dialog">
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <div id="modal-story-content"></div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      ` : ''}
      </section>
      `;
  }

  async afterRender() {
    const map = L.map('map').setView([-3.3162, 114.5904], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([-3.3162, 114.5904]).addTo(map);
    marker.bindPopup("<b>Hello!</b><br>This is Banjarmasin.").openPopup();

    const token = localStorage.getItem('token');
    if (token) {
      const stories = await StoryIdb.getAllStories();
      const storiesGrid = document.getElementById('stories-grid');
      const modal = document.getElementById('story-modal');
      const modalContent = document.getElementById('modal-story-content');

      stories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = 'bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow';
        storyCard.innerHTML = `
          <img src="${story.photoUrl}" alt="Story thumbnail" class="w-full h-48 object-cover rounded-lg mb-4">
          <h3 class="font-bold text-lg mb-2 text-black">${story.title}</h3>
          <p class="text-gray-600 mb-4">${story.description.substring(0, 100)}...</p>
          <button class="view-story btn btn-primary w-full" data-id="${story.id}">View Details</button>
        `;
        storiesGrid.appendChild(storyCard);

        const viewButton = storyCard.querySelector('.view-story');
        viewButton.addEventListener('click', async () => {
          const storyDetail = await StoryIdb.getStory(story.id);
          modalContent.innerHTML = `
            <div class="flex flex-col gap-4">
              <h2 class="text-2xl font-bold text-black">${storyDetail.title}</h2>
              <img src="${storyDetail.photoUrl}" alt="Story Image" class="w-full h-96 object-contain rounded-lg shadow-lg">
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${storyDetail.description}</p>
              <div class="text-sm text-gray-500">
                <p>Created: ${new Date(storyDetail.createdAt).toLocaleDateString()}</p>
                ${storyDetail.lat && storyDetail.lon ? `
                  <p>Location: ${storyDetail.lat}, ${storyDetail.lon}</p>
                ` : ''}
              </div>
              <button class="delete-story btn btn-error w-full mt-4" data-id="${storyDetail.id}">Delete Story</button>
            </div>
          `;
          modal.showModal();

          // Add delete functionality
          const deleteButton = modalContent.querySelector('.delete-story');
          deleteButton.addEventListener('click', async () => {
            modal.close();
            const result = await Swal.fire({
              title: 'Are you sure?',
              text: 'You won\'t be able to revert this!',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
              await StoryIdb.deleteStory(storyDetail.id);
              modal.close();
              // Refresh the stories grid
              storiesGrid.innerHTML = '';
              const updatedStories = await StoryIdb.getAllStories();
              stories.forEach(story => {
                const storyCard = document.createElement('div');
                storyCard.className = 'bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow';
                storyCard.innerHTML = `
                  <img src="${story.photoUrl}" alt="Story thumbnail" class="w-full h-48 object-cover rounded-lg mb-4">
                  <h3 class="font-bold text-lg mb-2 text-black">${story.title}</h3>
                  <p class="text-gray-600 mb-4">${story.description.substring(0, 100)}...</p>
                  <button class="view-story btn btn-primary w-full" data-id="${story.id}">View Details</button>
                `;
                storiesGrid.appendChild(storyCard);
              });

              Swal.fire(
                'Deleted!',
                'Your story has been deleted.',
                'success'
              );
            }
          });
        });
      });

      // Close modal when clicking outside or pressing ESC
      modal.addEventListener('click', (event) => {
        const modalDimensions = modal.getBoundingClientRect();
        if (
          event.clientX < modalDimensions.left ||
          event.clientX > modalDimensions.right ||
          event.clientY < modalDimensions.top ||
          event.clientY > modalDimensions.bottom
        ) {
          modal.close();
        }
      });
    }
  }
}