// Simple client-side gallery with lightbox, search, add by URL and upload local files.

const galleryEl = document.getElementById('gallery');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const urlInput = document.getElementById('urlInput');
const fileInput = document.getElementById('fileInput');
const resetBtn = document.getElementById('resetBtn');
const filtersNav = document.getElementById('album-filters'); // Thêm bộ chọn filters

// Lightbox elements
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let images = []; // {src, name, id, album, timestamp}
let currentIndex = -1;
let currentFilter = 'all'; // Biến theo dõi bộ lọc hiện tại

// Hàm tạo timestamp ngẫu nhiên (từ 1/1/2024 đến hiện tại)
function randomTimestamp() {
    const start = new Date(2024, 0, 1).getTime();
    const end = new Date().getTime();
    return new Date(start + Math.random() * (end - start));
}

// Dữ liệu ảnh demo mặc định đã được bổ sung album và timestamp
const defaultImages = [
    { src: 'images/mountain/1.jpg', name: 'Mountain Lake', album: 'mountain' },
    { src: 'images/mountain/2.jpg', name: 'Mountain Plateau', album: 'mountain' },
    { src: 'images/mountain/3.jpg', namee: 'Alpine Summit', album: 'mountain' },
    { src: 'images/mountain/4.jpg', name: 'Snowy Ridge', album: 'mountain' },
    { src: 'images/mountain/5.jpg', name: 'Seasonal Peaks', album: 'mountain' },
    { src: 'images/mountain/6.jpg', name: 'Frostbitten Fall', album: 'mountain' },

    { src: 'images/city/1.jpg', name: 'Sydney Opera House', album: 'city' },
    { src: 'images/city/2.jpg', name: 'City Lights', album: 'city' },
    { src: 'images/city/3.jpg', name: 'Cherry Blossom Road', album: 'city' },
    { src: 'images/city/4.jpg', name: 'Skyscraper View', album: 'city' },
    { src: 'images/city/5.jpg', name: 'Eiffel Tower', album: 'city' },
    { src: 'images/city/6.jpg', name: 'Cherry Blossom Lake', album: 'city' },

    { src: 'images/forest/1.jpg', name: 'Sunlight Dapple', album: 'forest' },
    { src: 'images/forest/2.jpg', name: 'Path Less Taken', album: 'forest' },
    { src: 'images/forest/3.jpg', name: 'Deep Canopy', album: 'forest' },
    { src: 'images/forest/4.jpg', name: 'Mossy Ground', album: 'forest' },
    { src: 'images/forest/5.jpg', name: 'Ancient Woods', album: 'forest' },
    { src: 'images/forest/6.jpg', name: 'Forest Stream', album: 'forest' },

    { src: 'images/people/1.jpg', name: 'Floating Market', album: 'people' },
    { src: 'images/people/2.jpg', name: 'Lion Dance Child', album: 'people' },
    { src: 'images/people/3.jpg', name: 'Salt Carrier', album: 'people' },
    { src: 'images/people/4.jpg', name: 'Playful Duo', album: 'people' },
    { src: 'images/people/5.jpg', name: 'Street Market', album: 'people' },
    { src: 'images/people/6.jpg', name: 'Candid Moment', album: 'people' },
    
];

// ---------- helpers ----------
function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function preprocessImage(imgObj) {
    return { 
        ...imgObj, 
        id: uid(), 
        album: imgObj.album || 'others',
        timestamp: randomTimestamp() // Gán timestamp ngẫu nhiên
    };
}

// Hàm sắp xếp theo thời gian (mới nhất lên đầu)
function sortImages(list) {
    return [...list].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function renderGallery(list = images) {
    // Sắp xếp trước khi render
    const sortedList = sortImages(list);

    galleryEl.innerHTML = '';
    if (!sortedList.length) {
        emptyEl.classList.add("show");
        return;
    }
    emptyEl.classList.remove("show");


    sortedList.forEach((imgObj, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.id = imgObj.id; // Lưu id vào dataset
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open ${imgObj.name}`);
        
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = imgObj.src;
        img.alt = imgObj.name || 'Photo';

        const meta = document.createElement('div');
        meta.className = 'meta';
        // Hiển thị cả tên ảnh và thời gian chụp (ngẫu nhiên)
        const timeStr = imgObj.timestamp.toLocaleDateString('vi-VN');
        meta.innerHTML = `<div class="name">${imgObj.name || 'Untitled'}</div>
                          <div class="time">${timeStr}</div>`;

        // === Thêm NÚT XÓA ===
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Xóa ảnh này';
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteImage(imgObj.id);
        });
        // =======================

        card.appendChild(img);
        card.appendChild(meta);
        card.appendChild(deleteBtn);
        
        // Gắn sự kiện mở lightbox vào card
        card.addEventListener('click', () => openLightbox(Number(card.dataset.index)));
        
        galleryEl.appendChild(card);
    });
}

function openLightbox(index) {
    const currentList = sortImages(filterBySearch(searchEl.value));
    currentIndex = index;

    const it = currentList[index];
    lbImg.src = it.src;
    lbCaption.textContent = it.name || "Untitled";

    lb.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lb.classList.remove("show");
    lbImg.src = "";
    lbCaption.textContent = "";
    document.body.style.overflow = "";
}


function showPrev() {
    // Lấy danh sách ảnh hiện tại (đã lọc và sắp xếp)
    const currentList = sortImages(filterBySearch(searchEl.value));
    if (currentList.length === 0) return;
    
    // Tính toán lại currentIndex dựa trên danh sách đã lọc
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    openLightbox(currentIndex);
}
function showNext() {
    // Lấy danh sách ảnh hiện tại (đã lọc và sắp xếp)
    const currentList = sortImages(filterBySearch(searchEl.value));
    if (currentList.length === 0) return;
    
    // Tính toán lại currentIndex dựa trên danh sách đã lọc
    currentIndex = (currentIndex + 1) % currentList.length;
    openLightbox(currentIndex);
}

// ---------- data ops ----------
function addImageFromURL(url) {
    if (!url) return;
    const name = url.split('/').pop().split('?')[0] || 'Image';
    // Đặt album mặc định là 'others' khi thêm mới
    const newImage = preprocessImage({ src: url, name, album: 'others' }); 
    images.unshift(newImage);
    renderGallery(filterBySearch(searchEl.value));
}

function addImageFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        // Đặt album mặc định là 'others' khi thêm mới
        const newImage = preprocessImage({ src: e.target.result, name: file.name, album: 'others' });
        images.unshift(newImage);
        renderGallery(filterBySearch(searchEl.value));
    };
    reader.readAsDataURL(file);
}

function deleteImage(id) {
   
    images = images.filter(img => img.id !== id);
    
    renderGallery(filterBySearch(searchEl.value));
    
    if (lb.classList.contains("show")) {
    closeLightbox();
    }

}


function resetGallery() {
    // Gán lại album và timestamp cho ảnh mặc định
    images = defaultImages.map(preprocessImage);
    renderGallery();
}

// ---------- search & filter ----------
function filterBySearch(q) {
    let list = images;
    
    // 1. Lọc theo Album
    if (currentFilter !== 'all') {
        list = list.filter(i => i.album === currentFilter);
    }

    // 2. Lọc theo Search (nếu có)
    if (q) {
        q = q.trim().toLowerCase();
        list = list.filter(i => (i.name || '').toLowerCase().includes(q) || i.src.toLowerCase().includes(q));
    }
    
    return list;
}

// ---------- events ----------
searchEl.addEventListener('input', (e) => {
    const filtered = filterBySearch(e.target.value);
    renderGallery(filtered);
});

// Xử lý sự kiện click trên bộ lọc album
filtersNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    
    // 1. Cập nhật trạng thái active cho nút
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 2. Cập nhật bộ lọc hiện tại và render lại
    currentFilter = btn.dataset.filter;
    const filtered = filterBySearch(searchEl.value);
    renderGallery(filtered);
});


// Enter on URL input
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const url = urlInput.value.trim();
        if (url) {
            addImageFromURL(url);
            urlInput.value = '';
        }
    }
});

// file uploads
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
        if (f.type && f.type.startsWith('image/')) addImageFromFile(f);
    });
    fileInput.value = '';
});

resetBtn.addEventListener('click', () => {
    resetGallery();
});

// lightbox controls
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', showPrev);
lbNext.addEventListener('click', showNext);

// click outside image closes
lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
});

// keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains("show")) return;
    if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'Escape') closeLightbox();
});
// initialize
resetGallery();