async function run() {
  try {
    console.log("Calling public API endpoint: http://127.0.0.1:4849/api/kib-e/public/1");
    const res = await fetch("http://127.0.0.1:4849/api/kib-e/public/1");
    
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);
    process.exit(0);
  } catch (err) {
    console.error("Fetch error:", err);
    process.exit(1);
  }
}

run();
