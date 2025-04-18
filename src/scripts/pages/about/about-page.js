export default class AboutPage {
  async render() {
    return `
      <section class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold  text-gray-800 text-center mb-6">About Story Apps</h1>
      <div class=" rounded-lg shadow-md p-6">
        <p class="text-gray-700 mb-4">
        Story Apps adalah aplikasi yang memungkinkan pengguna untuk berbagi dan membaca cerita dari berbagai penulis.
        Platform ini dirancang untuk menghubungkan para penulis dengan pembaca yang mencari konten menarik.
        </p>
        <p class="text-gray-700 mb-4">
        Aplikasi ini mudah digunakan dan memiliki berbagai fitur yang memudahkan pengguna dalam menulis dan membaca cerita.
        </p>
        <p class="text-gray-700">
        Bergabunglah dengan komunitas kami dan mulailah berbagi cerita Anda atau temukan cerita-cerita menarik dari penulis lainnya.
        </p>
        <div class="mt-6">
        </div>
      </div>
      <div tabindex="0" class="collapse mt-5  bg-white text-gray-800 collapse-arrow  border-base-300 border">
        <div class="collapse-title font-semibold">How do I create an account?</div>
        <div class="collapse-content text-sm">
        Click the "Sign Up" button in the top right corner and follow the registration process.
        </div>
      </div>
      <div tabindex="0" class="collapse mt-5  bg-white text-gray-800 collapse-arrow  border-base-300 border">
        <div class="collapse-title font-semibold">How do I submit a story?</div>
        <div class="collapse-content text-sm">
        After logging in, click the "Submit Story" button and fill out the required information.
        </div>
      </div>
      <div tabindex="0" class="collapse mt-5  bg-white text-gray-800 collapse-arrow  border-base-300 border">
        <div class="collapse-title font-semibold">Can I edit my story after submitting?</div>
        <div class="collapse-content text-sm">
        Yes, you can edit your story by going to your profile and selecting the story you want to edit.
        </div>
      </div>
      <div tabindex="0" class="collapse mt-5  bg-white text-gray-800 collapse-arrow  border-base-300 border">
        <div class="collapse-title font-semibold">How do I delete my account?</div>
        <div class="collapse-content text-sm">
        To delete your account, go to your profile settings and select "Delete Account".
        </div>
      </div>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}