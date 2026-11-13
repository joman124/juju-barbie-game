import './styles.css';
import { go, initApp, routes } from './app';
import { fx } from './fx';
import { titleScreen } from './screens/title';
import { pickScreen } from './screens/pick';
import { studioScreen } from './screens/studio';
import { showScreen } from './screens/show';
import { lookbookScreen } from './screens/lookbook';

const app = document.getElementById('app')!;

// Real viewport size as CSS variables: `vh` units are unreliable in iPad Safari.
function measure(): void {
  const root = document.documentElement.style;
  root.setProperty('--vw', `${window.innerWidth}px`);
  root.setProperty('--vh', `${window.innerHeight}px`);
}
measure();
window.addEventListener('resize', measure);
window.addEventListener('orientationchange', () => window.setTimeout(measure, 250));

initApp(app);
fx.mount(document.body);

routes.title = () => go(titleScreen());
routes.pick = () => go(pickScreen());
routes.studio = (look) => go(studioScreen(look));
routes.show = (look, from) => go(showScreen(look, from));
routes.lookbook = () => go(lookbookScreen());

routes.title();

// Lets the test scripts jump straight to any screen while developing.
if (import.meta.env.DEV) (window as unknown as { __routes: typeof routes }).__routes = routes;

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
