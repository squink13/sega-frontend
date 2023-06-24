export class LogEntry {
  constructor(message) {
    this.timestamp = new Date();
    this.message = message;
  }
}

export default function Logger({ logEntries }) {
  return (
    <ul>
      {logEntries
        .sort((a, b) => {
          return b.timestamp.getTime() - a.timestamp.getTime();
        })
        .map((logEntry, index) => {
          return (
            <li key={index}>
              {logEntry.timestamp.toISOString()}: {logEntry.message}
            </li>
          );
        })}
    </ul>
  );
}
