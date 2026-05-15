
const wallet = "";

const rollBtn = document.getElementById("ts-roll-btn");
const tsValue = document.getElementById("ts-roll-value");

let running = false;
let intervalId = null;

async function checkTimestamp(timestamp) {

  try {

    const res = await fetch(
      "https://unixpunks.xyz/api/find-mint-code",
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          timestamp: Number(timestamp),
          wallet: wallet
        })
      }
    );

    const data = await res.json();

    console.clear();

    console.log("timestamp:", timestamp);
    console.log(data);

    if (data.ok === true) {

      console.log("🎯 HIT FOUND!");
      console.log("mintCode:", data.mintCode);

      // auto copy
      await navigator.clipboard.writeText(data.mintCode);

      // stop loop automatically
      stopHunter();

    } else {

      console.log("status:", data.error);

      // optional retry wait display
      if (data.retryInMs) {
        console.log("retryInMs:", data.retryInMs);
      }
    }

  } catch (err) {

    console.error(err);

  }
}

function runOnce() {

  // click roll button
  rollBtn.click();

  // wait for DOM update
  setTimeout(() => {

    const timestamp =
      Number(tsValue.textContent.trim());

    checkTimestamp(timestamp);

  }, 100);

}

function startHunter() {

  if (running) return;

  running = true;

  console.log("🚀 hunter started");

  // run immediately
  runOnce();

  // repeat every 11 seconds
  intervalId = setInterval(() => {

    runOnce();

  }, 10500);

}

function stopHunter() {

  running = false;

  clearInterval(intervalId);

  console.log("🛑 hunter stopped");

}

// START
startHunter();

// OPTIONAL:
// stopHunter();
