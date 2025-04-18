import { getActiveRoute } from './routes/url-parser';
import routes from './routes/routes';

class App {
    constructor({
        content
    }) {
        this._content = content;
    }

    async renderPage() {
        const url = getActiveRoute();
        const page = routes[url];

        if (document.startViewTransition) {
            await document.startViewTransition(async () => {
                this._content.innerHTML = await page.render();
                await page.afterRender();
            }).finished;
        } else {
            this._content.innerHTML = await page.render();
            await page.afterRender();
        }
    }
}

export default App;