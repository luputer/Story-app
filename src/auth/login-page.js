import StoryApi from "../scripts/data/story-api";

export default class LoginPage {
    constructor() {
        this._storyApi = new StoryApi();
    }

    async render() {
        return `
      <section class="min-h-screen bg-gray-50 flex items-center text-black justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="bg-white p-8 rounded-xl shadow-lg">
            <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">
              Sign in to your account
            </h1>
            <form id="loginForm" class="mt-8 space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" class="mt-1 block w-full px-3 py-2 bg-white border  text-black border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Enter your email" required>
                <div id="emailError" class="text-red-500 text-sm mt-1 hidden">Please enter a valid email address</div>
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" id="password" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 text-black rounded-md text-sm shadow-sm placeholder-gray-400
                  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Enter your password" required>
                <div id="passwordError" class="text-red-500 text-sm mt-1 hidden">Password must be at least 6 characters long</div>
              </div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign in
              </button>
              <div class="text-sm text-center">
                <p class="text-gray-600">Don't have an account? <a href="#/register" class="font-medium text-indigo-600 hover:text-indigo-500">Register here</a></p>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
    }

    async afterRender() {
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const showLoading = () => {
            submitButton.disabled = true;
            submitButton.innerHTML = `
        <svg class="inline w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing in...
      `;
        };

        const hideLoading = () => {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        };

        const resetErrors = () => {
            emailError.classList.add('hidden');
            passwordError.classList.add('hidden');
            emailInput.classList.remove('border-red-500');
            passwordInput.classList.remove('border-red-500');
        };

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            resetErrors();

            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');

            let hasError = false;

            if (!validateEmail(email)) {
                emailError.classList.remove('hidden');
                emailInput.classList.add('border-red-500');
                hasError = true;
            }

            if (password.length < 6) {
                passwordError.classList.remove('hidden');
                passwordInput.classList.add('border-red-500');
                hasError = true;
            }

            if (hasError) return;

            try {
                showLoading();
                const response = await this._storyApi.login({
                    email,
                    password
                });

                if (!response.error) {
                    localStorage.setItem('token', response.loginResult.token);
                    localStorage.setItem('user', JSON.stringify({
                        id: response.loginResult.userId,
                        name: response.loginResult.name,
                    }));
                    window.location.href = '/stories';
                } else {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'text-red-500 text-sm mt-4';
                    errorMessage.textContent = response.message;
                    submitButton.parentNode.insertBefore(errorMessage, submitButton.nextSibling);
                }
            } catch (error) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'text-red-500 text-sm mt-4';
                errorMessage.textContent = 'Failed to login. Please try again.';
                submitButton.parentNode.insertBefore(errorMessage, submitButton.nextSibling);
                console.error(error);
            } finally {
                hideLoading();
            }
        });
    }
}