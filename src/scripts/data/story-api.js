import API_ENDPOINT from '../config/api-endpoint';

class StoryApi {
    constructor() {
        this._baseUrl = API_ENDPOINT.BASE_URL;
    }

    async register({
        name,
        email,
        password
    }) {
        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password
            }),
        });
        return response.json();
    }

    async login({
        email,
        password
    }) {
        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            }),
        });
        return response.json();
    }

    async getAllStories({
        page = 1,
        size = 10,
        location = 0,
        token
    }) {
        const response = await fetch(
            `${this._baseUrl}${API_ENDPOINT.STORIES}?page=${page}&size=${size}&location=${location}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.json();
    }

    async getStoryDetail(id, token) {
        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.STORIES}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.json();
    }

    // Support both parameter formats
    async addStory(firstParam, secondParam) {
        let formData;
        let token;

        // Check which format is being used
        if (firstParam instanceof FormData) {
            // First parameter is FormData, second is token
            formData = firstParam;
            token = secondParam;
        } else {
            // First parameter is an object with destructured props
            const {
                description,
                photo,
                lat,
                lon,
                token: paramToken
            } = firstParam;
            token = paramToken;

            formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photo);

            if (lat) formData.append('lat', lat);
            if (lon) formData.append('lon', lon);
        }

        const maxRetries = 3;
        let retryCount = 0;
        let lastError;

        while (retryCount < maxRetries) {
            try {
                const response = await fetch(`${this._baseUrl}${API_ENDPOINT.STORIES}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                retryCount++;
                if (retryCount < maxRetries) {
                    // Wait for 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        throw lastError;
    }

    async addGuestStory({
        description,
        photo,
        lat,
        lon
    }) {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);

        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.GUEST_STORY}`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }

    async subscribePushNotification({
        endpoint,
        keys,
        token
    }) {
        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.NOTIFICATIONS.SUBSCRIBE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                endpoint,
                keys
            }),
        });
        return response.json();
    }

    async unsubscribePushNotification({
        endpoint,
        token
    }) {
        const response = await fetch(`${this._baseUrl}${API_ENDPOINT.NOTIFICATIONS.SUBSCRIBE}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                endpoint
            }),
        });
        return response.json();
    }
}

export default StoryApi;