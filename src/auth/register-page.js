import StoryApi from "../scripts/data/story-api";

export default class RegisterPage {
    constructor() {
        this._storyApi = new StoryApi();
    }

    async render() {
        return `
      <div class="min-h-screen bg-gray-50 flex flex-col text-black justify-center py-12 sm:px-6 lg:px-8" >
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your acount</h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form id="registerForm" class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <div class="mt-1">
                  <input type="text" id="name" name="name" required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <div class="mt-1">
                  <input type="email" id="email" name="email" required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <div class="mt-1">
                  <input type="password" id="password" name="password" required minlength="8"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <p class="mt-2 text-sm text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div>
                <button type="submit" id="submitButton"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span id="buttonText">Register</span>
                  <svg id="loadingSpinner" class="hidden animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </button>
              </div>
            </form>

            <div class="mt-6">
              <p class="text-center text-sm text-gray-600">
                Already have an account?
                <a href="#/login" class="font-medium text-indigo-600 hover:text-indigo-500">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    async afterRender() {
        const registerForm = document.getElementById('registerForm');
        const submitButton = document.getElementById('submitButton');
        const buttonText = document.getElementById('buttonText');
        const loadingSpinner = document.getElementById('loadingSpinner');

        const showLoading = () => {
            buttonText.textContent = 'Registering...';
            loadingSpinner.classList.remove('hidden');
            submitButton.disabled = true;
        };

        const hideLoading = () => {
            buttonText.textContent = 'Register';
            loadingSpinner.classList.add('hidden');
            submitButton.disabled = false;
        };

        const showToast = (message, isError = false) => {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white transform transition-transform duration-300 ease-in-out`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        };

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showLoading();

            const formData = new FormData(registerForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');

            try {
                const response = await this._storyApi.register({
                    name,
                    email,
                    password
                });
                if (!response.error) {
                    showToast('Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = '#/login';
                    }, 1500);
                } else {
                    showToast(response.message, true);
                    hideLoading();
                }
            } catch (error) {
                showToast('Failed to register. Please try again.', true);
                console.error(error);
                hideLoading();
            }
        });
    }
}