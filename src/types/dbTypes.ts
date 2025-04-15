import type { ClockEvent } from './clockEventTypes';

export interface IDBManager {
    /**
     * Retrieves all clock events for a given user.
     * @param userName - The unique identifier for the user.
     * @returns A Promise that resolves with an array of ClockEvent objects.
     */
    getAllUserEvents(userName: string): Promise<ClockEvent[]>;
  
    /**
     * Persists a clock event.
     * @param event - The ClockEvent to save.
     * @returns A Promise that resolves when the event is stored.
     */
    saveEvent(event: ClockEvent): Promise<void>;
  }