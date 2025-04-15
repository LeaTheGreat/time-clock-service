import type { ClockEvent, MonthlyReport } from './clockEventTypes'

export interface ITimeClockService {

//   /**
//    * Retrieves all recorded clock events for a specific user.
//    * @param employeeName - The unique identifier of the user.
//    * @returns A Promise that resolves to an array of ClockEvent objects.
//    */
//   private getAllUserEvents(employeeName: string): Promise<ClockEvent[]>

  /**
   * Records a new clock event.
   * @param event - The clock event to record.
   * @returns A Promise that resolves when the event is recorded.
   */
  public recordEvent(event: ClockEvent): Promise<void>

  /**
    * Calculates a monthly report for an employee.
    * @param employeeName - The name of the employee
    * @param year - The year for the report
    * @param month - The month (1-12) for the report
    * @returns A Promise that resolves to an MonthlyReport containing daily hours and total hours
    */
   public calculateMonthlyReport(    
        employeeName: string,
        year: number,
        month: number,
    ) : Promise<MonthlyReport> 
}