const target = process.argv[2] || "https://staff-survey-psi.vercel.app/api/submit";
const total = Number(process.argv[3] || 25);
const concurrency = Number(process.argv[4] || 5);

if (!Number.isInteger(total) || total < 1 || total > 500) {
  console.error("Total requests must be an integer between 1 and 500.");
  process.exit(1);
}

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) {
  console.error("Concurrency must be an integer between 1 and 20.");
  process.exit(1);
}

const month = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
}).format(new Date());

function makePayload(index) {
  const variants = [
    "I’m doing great, I am ready for it",
    "I have a lot of work coming up, but I’m pacing myself and will get it all done",
    "I am holding steady",
    "I am overwhelmed and could use some additional support",
    "I am currently experiencing a lot of professional stress at school",
  ];

  const leadership = ["Supported", "Empowered", "Reassured", "Burdened", "Neglected"];

  return {
    language: index % 5 === 0 ? "Chinese" : "English",
    team: "Academic",
    surveyMonth: `STRESS TEST - ${month}`,
    answers: {
      schoolDivision: "DAIS Secondary",
      department: "STRESS TEST",
      monthAhead: variants[index % variants.length],
      lookingForward: ["Something academic in class", "A special event"],
      notLookingForward: ["Something professional"],
      focus: ["Student support", "Professional Development"],
      leadershipFeeling: leadership[index % leadership.length],
    },
    otherText: {
      monthAhead: "",
      lookingForward: "",
      notLookingForward: "",
      focus: "",
      leadershipFeeling: "",
    },
    submittedAt: new Date().toISOString(),
  };
}

async function sendOne(index) {
  const started = performance.now();
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePayload(index)),
    });

    const elapsed = Math.round(performance.now() - started);
    const body = await response.text();

    return {
      index,
      ok: response.ok,
      status: response.status,
      elapsed,
      body: body.slice(0, 180),
    };
  } catch (error) {
    return {
      index,
      ok: false,
      status: "NETWORK",
      elapsed: Math.round(performance.now() - started),
      body: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log(`\nSurvey stress test`);
  console.log(`Target:      ${target}`);
  console.log(`Requests:    ${total}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log(`Marker:      Survey Month starts with \"STRESS TEST -\" and Department = \"STRESS TEST\"\n`);

  const started = performance.now();
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= total) return;
      const result = await sendOne(index);
      results.push(result);
      const symbol = result.ok ? "✓" : "✗";
      console.log(`${symbol} ${String(index + 1).padStart(3, " ")}  status=${result.status}  ${result.elapsed}ms`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()));

  const duration = Math.round(performance.now() - started);
  const success = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const times = success.map((r) => r.elapsed).sort((a, b) => a - b);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const p95 = times.length ? times[Math.min(times.length - 1, Math.ceil(times.length * 0.95) - 1)] : 0;
  const statusCounts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  console.log("\n--- Results ---");
  console.log(`Successful: ${success.length}/${total}`);
  console.log(`Failed:     ${failed.length}/${total}`);
  console.log(`Total time: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Average:    ${avg}ms`);
  console.log(`P95:        ${p95}ms`);
  console.log("Statuses:  ", statusCounts);

  if (failed.length) {
    console.log("\nFirst failures:");
    for (const item of failed.slice(0, 10)) {
      console.log(`#${item.index + 1} status=${item.status} ${item.body}`);
    }
    process.exitCode = 1;
  }
}

main();
