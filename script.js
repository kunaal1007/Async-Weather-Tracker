const API_KEY = "3e67c7dd9acf6adb1fcc497c251864cf";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

function printLog(message, type) {
  const output = document.getElementById("console-output");

  if (output.textContent === "Waiting for search...") {
    output.innerHTML = "";
  }

  const line = document.createElement("div");
  line.className = "log-" + type;
  line.textContent = "▶ " + message;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function loadHistory() {
  const saved = localStorage.getItem("searchHistory");
  return saved ? JSON.parse(saved) : [];
}

function saveToHistory(cityName) {
  let history = loadHistory();

  const exists = history.some(c => c.toLowerCase() === cityName.toLowerCase());

  if (!exists) {
    history.unshift(cityName);
    if (history.length > 5) history = history.slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  showHistory();
}

function showHistory() {
  const history = loadHistory();
  const container = document.getElementById("history-list");
  container.innerHTML = "";

  if (history.length === 0) {
    container.textContent = "No history yet.";
    return;
  }

  history.forEach(function(city) {
    const btn = document.createElement("button");
    btn.className = "history-tag";
    btn.textContent = city;
    btn.onclick = function() {
      document.getElementById("city-input").value = city;
      searchWeather();
    };
    container.appendChild(btn);
  });
}

async function searchWeather() {
  const city = document.getElementById("city-input").value.trim();

  if (city === "") {
    alert("Please enter a city name.");
    return;
  }

  document.getElementById("weather-table").style.display = "none";
  document.getElementById("weather-placeholder").style.display = "block";
  document.getElementById("error-msg").style.display = "none";
  document.getElementById("console-output").innerHTML = "";

  printLog("Sync Start", "sync");
  printLog("Sync End", "sync");
  printLog("[ASYNC] Start fetching...", "async");

  const url = BASE_URL + "?q=" + city + "&appid=" + API_KEY + "&units=metric";

  try {
    const response = await fetch(url);
    printLog("Promise (Microtask)", "async");

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    printLog("Settlement (Resolved)", "async");
    printLog("[ASYNC] Data received!", "async");

    document.getElementById("w-city").textContent     = data.name + ", " + data.sys.country;
    document.getElementById("w-temp").textContent     = data.main.temp + " °C";
    document.getElementById("w-weather").textContent  = data.weather[0].main;
    document.getElementById("w-humidity").textContent = data.main.humidity + "%";
    document.getElementById("w-wind").textContent     = data.wind.speed + " m/s";

    document.getElementById("weather-placeholder").style.display = "none";
    document.getElementById("weather-table").style.display = "table";

    saveToHistory(data.name);

  } catch (error) {
    printLog("Settlement (Rejected)", "async");
    printLog("Error: " + error.message, "error");

    document.getElementById("weather-placeholder").style.display = "none";
    document.getElementById("error-msg").style.display = "block";
  }
}

document.getElementById("city-input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

showHistory();