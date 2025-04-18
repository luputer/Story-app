import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../../auth/login-page';
import RegisterPage from '../../auth/register-page';
import StoriesPage from '../pages/stories/stories-page';
import AddStoryPage from '../pages/stories/add-story-page';
import StoryDetailPage from '../pages/stories/stories-detail-page';
import Notfond from '../pages/Notfond/404';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new StoriesPage(), // Add more routes as needed
  '/stories/:id': new StoryDetailPage(),
  '/add': new AddStoryPage(),
  '*': new Notfond(),

};

export default routes;