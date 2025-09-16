const { createClient } = supabase;
    const supabaseUrl = "https://finxocxyrjizxjvvcbim.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbnhvY3h5cmppenhqdnZjYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODM1MjcsImV4cCI6MjA3MzU1OTUyN30.wK5N8xoDococE7AfACmP8LPh-nXE-lqKZte15MSM8P4";

  const supabaseClient = createClient(supabaseUrl, supabaseKey);

 // Debounce helper (to avoid spamming Supabase)
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const form = document.getElementById("antrianForm");
const successDiv = document.getElementById("success");
const h1 = document.getElementById("header");

const namaInput = document.getElementById("nama");
const kodeInput = document.getElementById("kode");
const namaSuggestions = document.getElementById("namaSuggestions");
const kodeSuggestions = document.getElementById("kodeSuggestions");

// Fetch Nama Satker suggestions
async function fetchNamaSuggestions(query) {
  if (!query) {
    namaSuggestions.classList.add("hidden");
    return;
  }

  const { data, error } = await supabaseClient
    .from("satker")
    .select("nama, kode")
    .ilike("nama", `%${query}%`)
    .limit(10);

  if (error) return console.error(error);

  namaSuggestions.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.nama;
    li.className = "p-2 hover:bg-blue-100 cursor-pointer";
    li.onclick = () => {
      namaInput.value = item.nama;
      kodeInput.value = item.kode; // autofill kode
      namaSuggestions.classList.add("hidden");
    };
    namaSuggestions.appendChild(li);
  });

  namaSuggestions.classList.toggle("hidden", data.length === 0);
}

// Fetch Kode Satker suggestions
async function fetchKodeSuggestions(query) {
  if (!query) {
    kodeSuggestions.classList.add("hidden");
    return;
  }

  const { data, error } = await supabaseClient
    .from("satker")
    .select("kode, nama")
    .ilike("kode", `%${query}%`)
    .limit(10);

  if (error) return console.error(error);

  kodeSuggestions.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.kode;
    li.className = "p-2 hover:bg-blue-100 cursor-pointer";
    li.onclick = () => {
      kodeInput.value = item.kode;
      namaInput.value = item.nama; // autofill nama
      kodeSuggestions.classList.add("hidden");
    };
    kodeSuggestions.appendChild(li);
  });

  kodeSuggestions.classList.toggle("hidden", data.length === 0);
}

// Attach events with debounce
namaInput.addEventListener("input", debounce((e) => {
  fetchNamaSuggestions(e.target.value);
}, 300));

kodeInput.addEventListener("input", debounce((e) => {
  fetchKodeSuggestions(e.target.value);
}, 300));

// Hide suggestions if clicked outside
document.addEventListener("click", (e) => {
  if (!namaInput.contains(e.target) && !namaSuggestions.contains(e.target)) {
    namaSuggestions.classList.add("hidden");
  }
  if (!kodeInput.contains(e.target) && !kodeSuggestions.contains(e.target)) {
    kodeSuggestions.classList.add("hidden");
  }
});


  // 🔹 Submit form
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = namaInput.value;
  const kode = kodeInput.value;
  const phone = document.getElementById("handphone").value;
  const deskripsi = document.getElementById("deskripsi").value;

  const { data ,error } = await supabaseClient
    .from("antrian")
    .insert([{ nama, kode, phone, deskripsi }])
    .select("nomor_antrian")
    .single();

  if (error) {
    alert("Gagal kirim data: " + error.message);
  } else {
    form.classList.add("hidden");
    h1.classList.add("hidden");
    successDiv.classList.remove("hidden");
  }

    // Show nomor antrian
    document.getElementById("nomorDisplay").textContent = data.nomor_antrian;
});