import './style.css';
import { createGame } from './game/createGame';
import { AppShell } from './ui/AppShell';

const rootElement = document.querySelector<HTMLDivElement>('#app');

if (!rootElement) {
  throw new Error('Missing #app root element.');
}

rootElement.innerHTML = '<div id="game-root" aria-label="BankMan game viewport"></div>';

const game = createGame('game-root');
new AppShell(game, rootElement);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
