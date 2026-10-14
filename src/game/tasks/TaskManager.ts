import type { SaveManager } from '../../storage/saveManager';
import { type TaskDef, type TaskEvent, getTask, localDateKey, pickDailyTasks } from './dailyTasks';

export interface TaskStatus {
  task: TaskDef;
  done: boolean;
}

/**
 * Verwaltet die Tagesaufgaben: legt sie pro Tag an, erkennt erledigte Aufgaben
 * anhand von Spielereignissen und zahlt die Belohnung genau einmal aus.
 */
export class TaskManager {
  private readonly listeners = new Set<(task: TaskDef) => void>();

  constructor(
    private readonly saves: SaveManager,
    /** Gibt es noch Orte, die nicht entdeckt wurden? */
    private readonly hasUndiscovered: () => boolean,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Aufgaben des heutigen Tages (werden bei Bedarf angelegt). */
  today(): TaskStatus[] {
    const date = localDateKey(this.now());
    const state = this.saves.ensureDailyTasks(date, () => pickDailyTasks(date, this.hasUndiscovered()));
    if (!state) return [];
    return state.ids
      .map((id) => getTask(id))
      .filter((task): task is TaskDef => task !== null)
      .map((task) => ({ task, done: state.done.includes(task.id) }));
  }

  /** Meldet ein Ereignis; erfüllt passende offene Aufgaben. */
  report(event: TaskEvent): void {
    if (!this.saves.hasSave) return;
    const date = localDateKey(this.now());
    for (const { task, done } of this.today()) {
      if (done || task.event !== event) continue;
      if (this.saves.completeTask(date, task.id)) {
        for (const listener of this.listeners) listener(task);
      }
    }
  }

  onCompleted(listener: (task: TaskDef) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
