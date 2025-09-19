const btnGif = document.getElementById("btn-gif");
const btnCaption = document.getElementById("btn-caption");
const btnBoth = document.getElementById("btn-both");
const topicInput = document.getElementById("topic");

const loader = document.getElementById("loader");
const gifEl = document.getElementById("gif");
const captionEl = document.getElementById("caption");
const hashtagsEl = document.getElementById("hashtags");

// Array of all buttons for easy disabling/enabling
const allButtons = [btnGif, btnCaption, btnBoth];

const showLoader = () => {
  loader.classList.remove("hidden");
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.backgroundColor = "grey";
  });
};

const hideLoader = () => {
  loader.classList.add("hidden");
  allButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.backgroundColor = "";
  });
};


const clearResult = () => {
  gifEl.src = "";
  gifEl.classList.add("hidden");
  gifEl.classList.remove("show"); // reset animation

  captionEl.textContent = "";
  captionEl.classList.add("hidden");
  captionEl.classList.remove("show");

  hashtagsEl.innerHTML = "";
  hashtagsEl.classList.add("hidden");
  hashtagsEl.classList.remove("show");
};


// ----------------- Button 1: GIF only -----------------
btnGif.addEventListener("click", async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert("Please enter a topic!");
  clearResult();
  showLoader();

  try {
    const res = await fetch("/api/generate-gif", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    gifEl.src = data.gifUrl;
    gifEl.classList.remove("hidden");
    gifEl.classList.add("show");
  } catch (err) {
    alert("Failed to generate GIF.");
    console.error(err);
  } finally {
    hideLoader();
  }
});

// ----------------- Button 2: Caption + Hashtags only -----------------
btnCaption.addEventListener("click", async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert("Please enter a topic!");
  clearResult();
  showLoader();

  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    captionEl.textContent = data.caption;
    captionEl.classList.remove("hidden");
    captionEl.classList.add("show");
    hashtagsEl.innerHTML = data.hashtags.map(tag => `<span class="tag">${tag}</span>`).join(" ");
    hashtagsEl.classList.remove("hidden");
    hashtagsEl.classList.add("show");
  } catch (err) {
    alert("Failed to generate caption.");
    console.error(err);
  } finally {
    hideLoader();
  }
});

// ----------------- Button 3: GIF + Caption + Hashtags -----------------
btnBoth.addEventListener("click", async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert("Please enter a topic!");
  clearResult();
  showLoader();

  try {
    const res = await fetch("/api/generate-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    gifEl.src = data.gifUrl;
    gifEl.classList.remove("hidden");
    gifEl.classList.add("show");
    captionEl.textContent = data.caption;
    captionEl.classList.remove("hidden");
    captionEl.classList.add("show");
    hashtagsEl.innerHTML = data.hashtags.map(tag => `<span class="tag">${tag}</span>`).join(" ");
    hashtagsEl.classList.remove("hidden");
    hashtagsEl.classList.add("show");
  } catch (err) {
    alert("Failed to generate meme.");
    console.error(err);
  } finally {
    hideLoader();
  }
});


const resetBtn = document.getElementById("reset-btn");

resetBtn.addEventListener("click", () => {
  topicInput.value = ""; // Clear input
  clearResult();         // Clear GIF, caption, hashtags
  hideLoader();          // Hide loader if visible
});
