# Time Clock Service

The service allows employers to manage employee working hours by recording punch events (clock-in/clock-out) and generating monthly reports.

## Setup and Running

Run `npm install` to install dependencies
Start the server with `npm start`
Run tests with `npm test`

## Assumptions

Unmatched Events:
	•	Cases where there is an “in” event without a corresponding “out” event (and vice versa) are ignored.
	•	Hours for such unmatched events are not counted in the monthly report.

Cross-Month Events:
	•	If an “in” event occurs on the last day of the month and the corresponding “out” event occurs on the first day of the next month, the hours worked are not split between the two months.
	•	In this case, the entire paired event is ignored for the monthly report.

## Overview

The service is implemented using Node.js with TypeScript and Express. It follows best practices such as separation of concerns, modularity, and comprehensive testing. The business logic to calculate monthly working hours is extracted into a separate function for maintainability and testability.

## Project Structure

time-clock-service/
├── src/
│   ├── models.ts               // Data models and type definitions
│   ├── routes.ts               // API route definitions
│   ├── services/
│   │   └── timeClockService.ts // Business logic for calculating reports
│   └── index.ts                // Main server entry point
├── tests/
│   ├── api.test.ts             // Integration tests for API endpoints
│   └── timeClockService.test.ts// Unit tests for business logic
├── package.json
├── tsconfig.json
└── README.md