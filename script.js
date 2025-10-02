const API_BASE = "https://flipball-backend-production.up.railway.app";

// ---------------------
// Signup
// ---------------------
async function signup() {
  const firstname = document.getElementById("signupFirstname").value;
  const lastname = document.getElementById("signupLastname").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstname, lastname, email, password }),
  });

  const data = await res.json();
  document.getElementById("signupMessage").innerText = data.message;

  if (data.success) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}

// ---------------------
// Login
// ---------------------
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  document.getElementById("loginMessage").innerText = data.message;

  if (data.success) {
    // ✅ Save email in localStorage
    localStorage.setItem("email", data.email);
    setTimeout(() => {
      window.location.href = "game.html";
    }, 1000);
  }
}

// ---------------------
// Load Profile Info
// ---------------------
async function loadProfile() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${API_BASE}/balance?email=${email}`);
  const data = await res.json();

  if (data.success) {
    document.getElementById("profileEmail").innerText = email;
    document.getElementById("profileBalance").innerText = data.balance;
    document.getElementById("profileAttempts").innerText = data.attempts;
  } else {
    window.location.href = "login.html";
  }
}



 // Add Funds
 async function addFunds() {
  const email = localStorage.getItem("email");
  const amount = Number(prompt("Enter amount to add:"));
  if (!amount) return;

  const res = await fetch(`${API_BASE}/addFunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("balance").innerText = data.balance;
    document.getElementById("attempts").innerText = data.attempts;
    alert("Funds added! You have 25 fresh attempts.");
  }
}




// Load balance & attempts on game page
if (window.location.pathname.includes("game.html")) {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "login.html";
  } else {
    fetch(`${API_BASE}/balance?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          window.location.href = "login.html"; // redirect to login if not authenticated
        } else {
          document.getElementById("balance").innerText = data.balance;
          document.getElementById("attempts").innerText = data.attempts;
        }
      });
  }
}


let flippingAllowed = true;
  
// Play Game with Flip Animation
async function play(choice) {
  if (!flippingAllowed) return;
  flippingAllowed = false;

  const bet = Number(document.getElementById("bet").value);
  const email = localStorage.getItem("email");

  const res = await fetch(`${API_BASE}/play`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, bet, choice })
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.message);
    flippingAllowed = true;
    return;
  }

  // Reset boxes
  for (let i = 0; i < 3; i++) {
    const box = document.querySelectorAll(".box")[i];
    box.classList.remove("flipped");
    document.getElementById(`box${i}`).innerText = "";
  }

  // Flip chosen box first
  const chosenBox = document.querySelectorAll(".box")[choice];
  const chosenBack = document.getElementById(`box${choice}`);
  chosenBack.innerText = choice === data.blueBox ? "🔵" : "🔴";
  setTimeout(() => chosenBox.classList.add("flipped"), 200);

  // Flip remaining boxes
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      if (i !== choice) {
        const box = document.querySelectorAll(".box")[i];
        const back = document.getElementById(`box${i}`);
        back.innerText = i === data.blueBox ? "🔵" : "🔴";
        box.classList.add("flipped");
      }
    }

    // Show result
    document.getElementById("balance").innerText = data.newBalance;
    document.getElementById("attempts").innerText = data.remainingAttempts;

    if (data.win) {
      document.getElementById("result").innerText =
        `🎉 You WON! Blue was in box ${data.blueBox + 1}. +${data.winAmount}`;
    } else {
      document.getElementById("result").innerText =
        `❌ You LOST! Blue was in box ${data.blueBox + 1}. -${data.lost}`;
    }

    // Auto-reset boxes after 2 sec
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const box = document.querySelectorAll(".box")[i];
        box.classList.remove("flipped");
        document.getElementById(`box${i}`).innerText = "";
      }
      document.getElementById("result").innerText = "";
      flippingAllowed = true;
    }, 2000);

  }, 1200);
}



// ---------------------
// Update Balance (example after playing game)
// ---------------------
async function updateBalance(newBalance, newAttempts) {
  const email = localStorage.getItem("email");
  if (!email) return;

  await fetch(`${API_BASE}/update-balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, balance: newBalance, attempts: newAttempts }),
  });
}

// ---------------------
// Logout
// ---------------------
function logout() {
  localStorage.removeItem("email");
  window.location.href = "login.html";
}
