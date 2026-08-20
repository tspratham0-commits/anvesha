const BASE_URL =
  process.env.ANVESHA_URL ||
  "http://localhost:3000";

const INTERVAL_MS = 60 * 1000;

let running = false;

async function checkScheduler() {
  if (running) {
    return;
  }

  running = true;

  try {
    const response = await fetch(
      `${BASE_URL}/api/research/scheduler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "[Research Worker] Scheduler error:",
        data
      );
      return;
    }

    const time =
      new Date().toLocaleTimeString();

    console.log(
      `[Research Worker] ${time}`,
      data
    );
  } catch (error) {
    console.error(
      "[Research Worker] Connection error:",
      error
    );
  } finally {
    running = false;
  }
}

console.log(
  "🌙 Anvesha Research Worker started."
);

console.log(
  `Checking every ${INTERVAL_MS / 1000} seconds.`
);

await checkScheduler();

setInterval(
  checkScheduler,
  INTERVAL_MS
);
