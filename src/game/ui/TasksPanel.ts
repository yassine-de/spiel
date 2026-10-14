import { tasks } from '../services';
import { formatCoins, h } from './dom';
import { COIN_SVG } from './icons';
import { Modal } from './Modal';

/** Die kleinen Aufgaben des Tages – jede gibt einmal am Tag ein paar Münzen. */
export class TasksPanel extends Modal {
  private readonly list: HTMLElement;

  constructor(parent: HTMLElement) {
    super(parent, 'Deine Aufgaben heute', { className: 'tasks-card' });
    this.list = h('ul', { class: 'task-list' });
    this.body.append(this.list, h('p', { class: 'tasks-note', text: 'Morgen gibt es neue Aufgaben 🌙' }));
  }

  override show(): void {
    this.list.replaceChildren(
      ...tasks.today().map(({ task, done }) =>
        h(
          'li',
          { class: `task${done ? ' is-done' : ''}` },
          h('span', { class: 'task-check', text: done ? '✓' : '' }),
          h('span', { class: 'task-title', text: task.title }),
          h('span', { class: 'price' }, h('span', { class: 'price-coin', html: COIN_SVG }), h('span', { text: `+${formatCoins(task.reward)}` })),
        ),
      ),
    );
    super.show();
  }
}
