// ========== INISIALISASI ==========
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// ========== DATA PESANAN (disimpan di localStorage) ==========
let daftarPesanan = [];

function loadPesanan() {
    const saved = localStorage.getItem('naoryPesanan');
    if (saved) {
        daftarPesanan = JSON.parse(saved);
    } else {
        daftarPesanan = [
            {
                kode: "NAORY-001",
                nama: "Ayu",
                produk: "Chocolate Lava Cake",
                jumlah: 2,
                total: 110000,
                alamat: "Jl. Mawar No. 5, Jakarta Selatan",
                status: "completed",
                tanggal: new Date().toLocaleString('id-ID')
            },
            {
                kode: "NAORY-002",
                nama: "Budi",
                produk: "Red Velvet Cake",
                jumlah: 1,
                total: 65000,
                alamat: "Jl. Melati No. 10, Jakarta Selatan",
                status: "delivery",
                tanggal: new Date().toLocaleString('id-ID')
            }
        ];
        savePesanan();
    }
}

function savePesanan() {
    localStorage.setItem('naoryPesanan', JSON.stringify(daftarPesanan));
}

// Generate kode pesanan unik
function generateKodePesanan() {
    const now = new Date();
    const random = Math.floor(Math.random() * 1000);
    return `NAORY-${now.getDate()}${now.getMonth()+1}${now.getFullYear()}${random}`;
}

// ========== FORM PEMESANAN ==========
const orderForm = document.getElementById('orderForm');
const orderProduk = document.getElementById('orderProduk');
const orderJumlah = document.getElementById('orderJumlah');
const totalBayarSpan = document.getElementById('totalBayar');

function updateTotal() {
    if (orderProduk && orderJumlah) {
        const selectedOption = orderProduk.options[orderProduk.selectedIndex];
        const price = selectedOption.getAttribute('data-price') || 0;
        const jumlah = parseInt(orderJumlah.value) || 0;
        const total = price * jumlah;
        totalBayarSpan.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    }
}

if (orderProduk && orderJumlah) {
    orderProduk.addEventListener('change', updateTotal);
    orderJumlah.addEventListener('input', updateTotal);
    updateTotal();
}

// Tombol pesan dari card produk
document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const product = this.getAttribute('data-product');
        if (orderProduk) {
            for (let i = 0; i < orderProduk.options.length; i++) {
                if (orderProduk.options[i].value === product) {
                    orderProduk.selectedIndex = i;
                    break;
                }
            }
            updateTotal();
            document.getElementById('transaksi').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Submit pesanan
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('orderNama').value.trim();
        const telp = document.getElementById('orderTelp').value.trim();
        const produk = document.getElementById('orderProduk').value;
        const jumlah = parseInt(document.getElementById('orderJumlah').value);
        const metode = document.getElementById('orderMetode').value; // PERBAIKAN: orderMetode, bukan orderMetade
        const alamat = document.getElementById('orderAlamat').value.trim();
        const catatan = document.getElementById('orderCatatan').value;
        
        // Validasi lengkap
        if (!nama) {
            alert('❌ Nama lengkap harus diisi!');
            return;
        }
        if (!telp) {
            alert('❌ Nomor WhatsApp harus diisi!');
            return;
        }
        if (!produk) {
            alert('❌ Silakan pilih produk terlebih dahulu!');
            return;
        }
        if (!alamat) {
            alert('❌ Alamat pengiriman harus diisi!');
            return;
        }
        
        const selectedOption = orderProduk.options[orderProduk.selectedIndex];
        const harga = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const total = harga * jumlah;
        const kodePesanan = generateKodePesanan();
        
        const pesananBaru = {
            kode: kodePesanan,
            nama: nama,
            telp: telp,
            produk: produk,
            jumlah: jumlah,
            total: total,
            metode: metode,
            alamat: alamat,
            catatan: catatan,
            status: "received",
            tanggal: new Date().toLocaleString('id-ID')
        };
        
        daftarPesanan.push(pesananBaru);
        savePesanan();
        
        // Notifikasi sukses dengan detail lengkap
        alert(`✅ PESANAN BERHASIL!\n\nKode Pesanan: ${kodePesanan}\nNama: ${nama}\nProduk: ${produk}\nJumlah: ${jumlah}\nTotal: Rp ${total.toLocaleString('id-ID')}\nMetode: ${metode}\nAlamat: ${alamat}\n\n📦 Simpan kode pesanan untuk melacak pengiriman.\n\nKami akan segera memproses pesanan Anda!`);
        
        // Reset form
        orderForm.reset();
        document.getElementById('orderJumlah').value = 1;
        updateTotal();
        
        // Tanya apakah mau langsung lacak
        const lacakSekarang = confirm('🔍 Apakah Anda ingin melacak pesanan sekarang?');
        if (lacakSekarang) {
            document.getElementById('lacak').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('trackingCode').value = kodePesanan;
            trackOrder();
        }
    });
}

// ========== LACAK PESANAN ==========
function trackOrder() {
    const kode = document.getElementById('trackingCode').value.trim().toUpperCase();
    const resultDiv = document.getElementById('trackingResult');
    const notFoundDiv = document.getElementById('trackingNotFound');
    
    const pesanan = daftarPesanan.find(p => p.kode === kode);
    
    if (!pesanan) {
        resultDiv.style.display = 'none';
        notFoundDiv.style.display = 'block';
        return;
    }
    
    notFoundDiv.style.display = 'none';
    resultDiv.style.display = 'block';
    
    document.getElementById('trackNama').innerHTML = `<i class="fas fa-user"></i> ${pesanan.nama} (${pesanan.kode})`;
    document.getElementById('trackProduk').innerHTML = `<i class="fas fa-cake"></i> ${pesanan.produk} x${pesanan.jumlah} - Rp ${pesanan.total.toLocaleString('id-ID')}`;
    document.getElementById('trackAlamat').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${pesanan.alamat}`;
    
    // Update status timeline
    const statuses = ['received', 'preparing', 'delivery', 'completed'];
    const currentStatus = pesanan.status;
    const currentIndex = statuses.indexOf(currentStatus);
    
    const steps = ['status1', 'status2', 'status3', 'status4'];
    steps.forEach((stepId, index) => {
        const stepEl = document.getElementById(stepId);
        if (stepEl) {
            if (index <= currentIndex) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else {
                stepEl.classList.remove('completed', 'active');
            }
        }
    });
    
    if (currentIndex < steps.length - 1 && currentStatus !== 'completed') {
        const activeStep = document.getElementById(steps[currentIndex]);
        if (activeStep) activeStep.classList.add('active');
    }
}

// ========== FUNGSI UNTUK MENGGANTI LOGO ==========
document.addEventListener('DOMContentLoaded', function() {
    loadPesanan();
    loadSaran();
    
    const logoImg = document.getElementById('logo-img');
    if (logoImg) {
        logoImg.addEventListener('dblclick', function() {
            const newLogoUrl = prompt('Masukkan URL gambar logo baru:', logoImg.src);
            if (newLogoUrl && newLogoUrl.trim() !== '') {
                logoImg.src = newLogoUrl;
                localStorage.setItem('naoryLogo', newLogoUrl);
            }
        });
        
        const savedLogo = localStorage.getItem('naoryLogo');
        if (savedLogo) {
            logoImg.src = savedLogo;
        }
    }
    
    // Inisialisasi Peta
    initMap();
});

// ========== PETA dengan Leaflet ==========
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Lokasi toko: Jl. Kenangan Indah No. 123, Jakarta Selatan
    const tokoLocation = [-6.2439, 106.8456]; // Koordinat Jakarta Selatan
    
    const map = L.map('map').setView(tokoLocation, 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Marker toko
    const tokoIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
    
    L.marker(tokoLocation, { icon: tokoIcon }).addTo(map)
        .bindPopup('<b>Naory Bakery</b><br>Jl. Kenangan Indah No. 123<br>Jakarta Selatan')
        .openPopup();
    
    // Radius 3km (estimasi gratis ongkir)
    L.circle(tokoLocation, {
        color: '#C49A6C',
        fillColor: '#F9E4C5',
        fillOpacity: 0.3,
        radius: 3000
    }).addTo(map).bindPopup('Area Gratis Ongkir (3km)');
}

function downloadQRIS() {
    const qrisImg = document.getElementById('qrisImg');
    if (qrisImg) {
        const link = document.createElement('a');
        link.download = 'QRIS_Naory_Bakery.png';
        link.href = qrisImg.src;
        link.click();
    }
}

// ========== DATA SARAN ==========
let daftarSaran = [];

function saveSaranToLocal() {
    localStorage.setItem('naorySaran', JSON.stringify(daftarSaran));
}

function loadSaran() {
    const saved = localStorage.getItem('naorySaran');
    if (saved) {
        daftarSaran = JSON.parse(saved);
    } else {
        daftarSaran = [
            {
                id: Date.now() + 1,
                nama: "Sarah",
                isi: "Kue black forestnya enak banget! Lembut dan tidak terlalu manis.",
                kategori: "Pujian",
                tanggal: new Date(Date.now() - 86400000).toLocaleString('id-ID')
            },
            {
                id: Date.now() + 2,
                nama: "Raka",
                isi: "Saran: mungkin bisa ditambahin varian kue yang tanpa gluten ya.",
                kategori: "Saran",
                tanggal: new Date(Date.now() - 172800000).toLocaleString('id-ID')
            }
        ];
        saveSaranToLocal();
    }
    renderSaran();
}

function renderSaran() {
    const container = document.getElementById('saranListContainer');
    const countSpan = document.getElementById('saranCount');
    
    if (!container) return;
    
    if (daftarSaran.length === 0) {
        container.innerHTML = `
            <div class="empty-saran text-center py-5">
                <i class="fas fa-comment-dots fa-3x mb-3" style="color: #d9b48b;"></i>
                <p>Belum ada saran. Jadilah yang pertama!</p>
            </div>
        `;
        if (countSpan) countSpan.innerText = '0 saran';
        return;
    }
    
    let html = '';
    daftarSaran.slice().reverse().forEach(saran => {
        const kategoriClass = saran.kategori.replace(/ /g, '-');
        html += `
            <div class="saran-item">
                <div class="saran-header">
                    <span class="saran-nama"><i class="fas fa-user-circle"></i> ${escapeHtml(saran.nama)}</span>
                    <span class="saran-kategori ${kategoriClass}">${escapeHtml(saran.kategori)}</span>
                </div>
                <div class="saran-isi">${escapeHtml(saran.isi)}</div>
                <div class="saran-tanggal"><i class="far fa-clock"></i> ${saran.tanggal}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (countSpan) countSpan.innerText = daftarSaran.length + ' saran';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Form Saran
const saranForm = document.getElementById('saranForm');
if (saranForm) {
    saranForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('namaPengirim').value.trim();
        const isi = document.getElementById('isiSaran').value.trim();
        const kategori = document.getElementById('kategoriSaran').value;
        
        if (!nama) {
            alert('❌ Silakan isi nama Anda terlebih dahulu.');
            return;
        }
        if (!isi) {
            alert('❌ Silakan tulis saran/masukan Anda.');
            return;
        }
        
        const newSaran = {
            id: Date.now(),
            nama: nama,
            isi: isi,
            kategori: kategori,
            tanggal: new Date().toLocaleString('id-ID')
        };
        
        daftarSaran.push(newSaran);
        saveSaranToLocal();
        renderSaran();
        saranForm.reset();
        alert(`✅ Terima kasih ${nama}! Saran Anda telah kami terima.`);
    });
}

// Form Kontak
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('input[placeholder="Nama Anda"]')?.value;
        const email = this.querySelector('input[placeholder="Email"]')?.value;
        if (name && email) {
            alert(`✅ Halo ${name}, pesan Anda telah terkirim! Kami akan membalas dalam 1x24 jam.`);
            this.reset();
        } else {
            alert('❌ Silakan isi nama dan email Anda terlebih dahulu.');
        }
    });
}

// Smooth Scroll
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

console.log('Naory Bakery website ready — dengan transaksi, QRIS, peta & lacak pesanan!');