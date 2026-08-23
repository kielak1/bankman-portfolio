import type Phaser from 'phaser';
import { GAME_FINISHED_EVENT, GAME_READY_EVENT, type GameFinishedDetail } from '../game/gameEvents';
import { SCENE_KEYS } from '../game/scenes/sceneKeys';
import { GlobalScoreStore, type GlobalScoreEntry } from '../game/systems/GlobalScoreStore';
import { ScoreStore, type ScoreEntry } from '../game/systems/ScoreStore';

type Screen = 'start' | 'result';

export class AppShell {
  private readonly game: Phaser.Game;
  private readonly globalScores = new GlobalScoreStore();
  private readonly localScores = new ScoreStore();
  private readonly root: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly subtitle: HTMLParagraphElement;
  private readonly nickname: HTMLInputElement;
  private readonly rankingTitle: HTMLHeadingElement;
  private readonly rankingBody: HTMLTableSectionElement;
  private readonly status: HTMLParagraphElement;
  private readonly summary: HTMLDivElement;
  private readonly playButton: HTMLButtonElement;
  private readonly saveButton: HTMLButtonElement;
  private readonly retryButton: HTMLButtonElement;
  private readonly homeButton: HTMLButtonElement;
  private readonly briefDialog: HTMLDialogElement;
  private currentResult: GameFinishedDetail | null = null;
  private screen: Screen = 'start';
  private gameReady = false;

  constructor(game: Phaser.Game, parent: HTMLElement) {
    this.game = game;
    this.root = document.createElement('div');
    this.root.className = 'app-shell';
    this.root.innerHTML = `
      <main class="app-panel">
        <header class="app-header">
          <p class="app-kicker">BANK OPERATIONS // INCIDENT RESPONSE</p>
          <h1></h1>
          <p class="app-subtitle"></p>
        </header>
        <section class="player-card">
          <label for="player-name">OPERATOR NICK</label>
          <input id="player-name" maxlength="20" autocomplete="nickname" />
        </section>
        <section class="result-summary" hidden></section>
        <section class="ranking-card">
          <div class="ranking-heading">
            <h2>GLOBAL TOP 10</h2>
            <p class="ranking-status">CONNECTING...</p>
          </div>
          <div class="ranking-scroll">
            <table>
              <thead><tr><th>#</th><th>OPERATOR</th><th>SCORE</th><th>TIME</th><th>RESULT</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </section>
        <div class="app-actions">
          <button type="button" data-action="play">START SHIFT</button>
          <button type="button" data-action="info" class="secondary">MISSION BRIEF</button>
          <button type="button" data-action="save" hidden>SAVE SCORE</button>
          <button type="button" data-action="retry" class="secondary" hidden>RETRY</button>
          <button type="button" data-action="home" class="secondary" hidden>MAIN MENU</button>
        </div>
      </main>
      <dialog class="brief-dialog">
        <header class="brief-header">
          <div>
            <p class="app-kicker">CONFIDENTIAL // OPERATIONS HANDBOOK</p>
            <h2>MISSION BRIEF</h2>
            <p>Your shift has started badly, which means it has started normally.</p>
          </div>
          <div class="brief-header-actions">
            <button type="button" class="dialog-close" data-action="close-info">CLOSE</button>
          </div>
        </header>

        <section class="brief-section">
          <h3>YOUR MISSION</h3>
          <p>
            Resolve all <strong>16 tickets</strong>, protect the SLA and keep stress below 100.
            Every ticket scores points, and fast delivery scores more. Try not to become the incident.
          </p>
        </section>

        <section class="brief-section">
          <h3>THREAT DOSSIER</h3>
          <div class="enemy-dossier">
            <article class="enemy-card manager">
              <div class="enemy-icon"><span>MGR</span></div>
              <div>
                <h4>MANAGER <small>THE QUICK CALL</small></h4>
                <p>Follows you persistently and drains stress for every second of unwanted alignment.</p>
                <p class="enemy-tip">Countermeasure: keep moving. A quick call cannot begin if you are already in another corridor.</p>
              </div>
            </article>
            <article class="enemy-card business">
              <div class="enemy-icon"><span>BIZ</span></div>
              <div>
                <h4>BUSINESS <small>JUST ONE CHANGE</small></h4>
                <p>The fastest threat. Contact causes a large, immediate stress spike before another ASAP arrives.</p>
                <p class="enemy-tip">Countermeasure: do not negotiate. Run now, discuss scope after the sprint.</p>
              </div>
            </article>
            <article class="enemy-card audit">
              <div class="enemy-icon"><span>AUD</span></div>
              <div>
                <h4>AUDIT <small>EVIDENCE REQUIRED</small></h4>
                <p>Patrols unpredictably and leaves temporary purple stress zones wherever evidence was allegedly missing.</p>
                <p class="enemy-tip">Countermeasure: avoid the purple circles. Saying "it worked on my machine" is not evidence.</p>
              </div>
            </article>
            <article class="enemy-card security">
              <div class="enemy-icon"><span>SEC</span></div>
              <div>
                <h4>SECURITY <small>ACCESS DENIED</small></h4>
                <p>Chases through the office, adds stress and locks your controls for 1.5 seconds on contact.</p>
                <p class="enemy-tip">Countermeasure: respect the policy perimeter. The policy perimeter does not respect you.</p>
              </div>
            </article>
          </div>
        </section>

        <section class="brief-grid">
          <article class="brief-section">
            <h3>APPROVED SURVIVAL TOOLS</h3>
            <p><strong>COFFEE:</strong> stress -30, speed boost and +250 points. Compliance-approved in reasonable quantities.</p>
            <p><strong>ADMIN MODE:</strong> touching enemies revokes their access and sends them back to spawn.</p>
            <p><strong>PRACUJEMY NAD TYM:</strong> pauses SLA and slows enemies. The most powerful sentence in enterprise IT.</p>
          </article>
          <article class="brief-section">
            <h3>ESCALATION CONDITIONS</h3>
            <p><strong>ALERT LEVEL:</strong> increases every 45 seconds. Threats become faster, stronger and more numerous.</p>
            <p><strong>FRIDAY DEPLOYMENT:</strong> doubles ticket points, but makes every threat significantly worse.</p>
            <p><strong>SYSTEM OVERLOAD:</strong> stress at 100 ends the shift. HR calls this a learning opportunity.</p>
          </article>
        </section>

        <section class="brief-section">
          <h3>OFFICE FACILITIES</h3>
          <p><strong>SAFE BREAK:</strong> toilets protect you from corporate threats and quickly reduce stress. SLA keeps running.</p>
          <p><strong>KITCHEN:</strong> provides a renewable coffee refill, stress relief and points after its supplies recover.</p>
          <p><strong>MEETING ROOMS:</strong> entering starts a two-second mandatory meeting. Movement and SLA pause, but stress increases.</p>
          <p><strong>EXECUTIVE OFFICE:</strong> issues a random strategic decision. Outcomes range from approved budget to cost optimization.</p>
        </section>

        <section class="brief-section brief-controls">
          <h3>CONTROLS</h3>
          <p><strong>WASD / ARROWS:</strong> move &nbsp; <strong>M:</strong> sound &nbsp; <strong>F1:</strong> debug overlay</p>
          <p><strong>MOBILE:</strong> use the on-screen joystick. Strategic thumb movement is encouraged.</p>
        </section>
      </dialog>
    `;
    parent.append(this.root);

    this.title = this.requireElement<HTMLHeadingElement>('h1');
    this.subtitle = this.requireElement<HTMLParagraphElement>('.app-subtitle');
    this.nickname = this.requireElement<HTMLInputElement>('#player-name');
    this.rankingTitle = this.requireElement<HTMLHeadingElement>('.ranking-heading h2');
    this.rankingBody = this.requireElement<HTMLTableSectionElement>('tbody');
    this.status = this.requireElement<HTMLParagraphElement>('.ranking-status');
    this.summary = this.requireElement<HTMLDivElement>('.result-summary');
    this.playButton = this.requireElement<HTMLButtonElement>('[data-action="play"]');
    this.saveButton = this.requireElement<HTMLButtonElement>('[data-action="save"]');
    this.retryButton = this.requireElement<HTMLButtonElement>('[data-action="retry"]');
    this.homeButton = this.requireElement<HTMLButtonElement>('[data-action="home"]');
    this.briefDialog = this.requireElement<HTMLDialogElement>('.brief-dialog');

    this.nickname.value = this.globalScores.getPlayerName();
    this.nickname.addEventListener('change', () => {
      this.nickname.value = this.globalScores.setPlayerName(this.nickname.value);
    });
    this.playButton.addEventListener('click', () => this.startGame());
    this.saveButton.addEventListener('click', () => void this.saveScore());
    this.retryButton.addEventListener('click', () => this.startGame());
    this.homeButton.addEventListener('click', () => this.showStart());
    this.requireElement<HTMLButtonElement>('[data-action="info"]').addEventListener('click', () => {
      this.briefDialog.showModal();
    });
    this.requireElement<HTMLButtonElement>('[data-action="close-info"]').addEventListener('click', () => {
      this.briefDialog.close();
    });
    window.addEventListener(GAME_READY_EVENT, this.onReady);
    window.addEventListener(GAME_FINISHED_EVENT, this.onFinished as EventListener);
    window.addEventListener('keydown', this.onKeyDown);

    this.showStart();
  }

  private readonly onReady = (): void => {
    this.gameReady = true;
    this.playButton.disabled = false;
  };

  private readonly onFinished = (event: CustomEvent<GameFinishedDetail>): void => {
    this.currentResult = event.detail;
    this.screen = 'result';
    this.root.classList.add('is-visible');
    this.root.classList.add('is-result');
    this.title.textContent = event.detail.result === 'won' ? 'SPRINT COMPLETE' : 'SYSTEM OVERLOAD';
    this.subtitle.textContent =
      event.detail.result === 'won' ? 'All tickets resolved. Save the result?' : 'Stress limit reached. Save the result?';
    this.summary.hidden = false;
    this.summary.innerHTML = `
      <div><span>SCORE</span><strong>${event.detail.scoreEntry.score}</strong></div>
      <div><span>TIME</span><strong>${this.formatDuration(event.detail.scoreEntry.timeSeconds)}</strong></div>
      <div><span>SLA</span><strong>${event.detail.sla}</strong></div>
      <div><span>TICKETS</span><strong>${event.detail.scoreEntry.tickets}/${event.detail.totalTickets}</strong></div>
    `;
    this.playButton.hidden = true;
    this.saveButton.hidden = false;
    this.saveButton.disabled = false;
    this.saveButton.textContent = 'SAVE SCORE';
    this.retryButton.hidden = false;
    this.homeButton.hidden = false;
    void this.loadRanking();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.screen === 'result' && event.key.toLowerCase() === 'r') {
      this.startGame();
    }
  };

  private showStart(): void {
    this.screen = 'start';
    this.currentResult = null;
    this.game.scene.stop(SCENE_KEYS.main);
    this.root.classList.add('is-visible');
    this.root.classList.remove('is-result');
    this.title.textContent = 'BANKMAN';
    this.subtitle.textContent = 'Resolve tickets. Protect the SLA. Survive corporate operations.';
    this.summary.hidden = true;
    this.playButton.hidden = false;
    this.playButton.disabled = !this.gameReady;
    this.saveButton.hidden = true;
    this.retryButton.hidden = true;
    this.homeButton.hidden = true;
    void this.loadRanking();
  }

  private startGame(): void {
    this.nickname.value = this.globalScores.setPlayerName(this.nickname.value);
    this.root.classList.remove('is-visible');
    this.game.scene.stop(SCENE_KEYS.main);
    this.game.scene.start(SCENE_KEYS.main);
  }

  private async saveScore(): Promise<void> {
    if (!this.currentResult) {
      return;
    }

    const playerName = this.globalScores.setPlayerName(this.nickname.value);
    this.nickname.value = playerName;
    this.saveButton.disabled = true;
    this.saveButton.textContent = 'SAVING...';

    try {
      const entries = await this.globalScores.record(this.currentResult.scoreEntry, playerName);
      this.localScores.clear();
      this.saveButton.textContent = 'SCORE SAVED';
      this.renderRanking(entries, 'GLOBAL TOP 10', 'ONLINE');
    } catch {
      const entries = this.localScores.record(this.currentResult.scoreEntry);
      this.saveButton.textContent = 'SAVED LOCALLY';
      this.renderLocalRanking(entries);
    }
  }

  private async loadRanking(): Promise<void> {
    this.status.textContent = 'CONNECTING...';
    try {
      const entries = await this.globalScores.load();
      this.localScores.clear();
      this.renderRanking(entries, 'GLOBAL TOP 10', 'ONLINE');
    } catch {
      this.renderLocalRanking(this.localScores.load());
    }
  }

  private renderLocalRanking(entries: ScoreEntry[]): void {
    const rows: GlobalScoreEntry[] = entries.map((entry, index) => ({
      ...entry,
      id: `local-${index}`,
      playerName: 'LOCAL',
      rank: index + 1,
    }));
    this.renderRanking(rows, 'LOCAL TOP SCORES', 'OFFLINE FALLBACK');
  }

  private renderRanking(entries: GlobalScoreEntry[], title: string, status: string): void {
    this.rankingTitle.textContent = title;
    this.status.textContent = status;
    this.rankingBody.replaceChildren(
      ...entries.slice(0, 10).map((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.rank}</td>
          <td>${this.escapeHtml(entry.playerName)}</td>
          <td>${entry.score}</td>
          <td>${this.formatDuration(entry.timeSeconds)}</td>
          <td>${entry.won ? 'DONE' : 'OVERLOAD'}</td>
        `;
        return row;
      }),
    );

    if (entries.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5">NO SCORES YET</td>';
      this.rankingBody.append(row);
    }
  }

  private formatDuration(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  private escapeHtml(value: string): string {
    const element = document.createElement('span');
    element.textContent = value;
    return element.innerHTML;
  }

  private requireElement<T extends Element = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Missing app shell element: ${selector}`);
    }
    return element;
  }
}
