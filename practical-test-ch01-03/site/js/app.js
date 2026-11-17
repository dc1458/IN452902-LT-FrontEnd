// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000/api/events';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });


const searchForm = document.getElementById("search-form");
const keywordInput = document.getElementById("keyword");
const statusElement = document.getElementById("status");
const eventList = document.getElementById("event-list");



// Hàm tính số chỗ còn lại

const formatSeats = (event) => {
    const capacity = Number(event.capacity);
    const registeredCount = Number(event.registeredCount);

    if (
        !Number.isFinite(capacity) ||
        !Number.isFinite(registeredCount)
    ) {
        return "Không xác định số chỗ";
    }

    const remaining = Math.max(0, capacity - registeredCount);

    if (remaining === 0) {
        return "Hết chỗ";
    }

    return `Còn ${remaining}/${capacity} chỗ`;
};


// Tạo card sự kiện

const createEventCard = (event, index) => {

    const article = document.createElement("article");
    article.className = "event-card";

    const image = document.createElement("img");

    const imageSources = [
        "img/event.svg",
        "img/event.svg",
        "img/event.svg"
    ];

    image.setAttribute(
        "src",
        imageSources[index % imageSources.length]
    );

    image.setAttribute(
        "alt",
        `Hình ảnh sự kiện ${event.name || "EduHub"}`
    );

    image.className = "event-image";

    // Tạo div chứa nội dung
    const content = document.createElement("div");
    content.className = "event-content";

    const heading = document.createElement("h2");

    const titleLink = document.createElement("a");

    titleLink.textContent = event.name || "Sự kiện chưa có tên";

    titleLink.setAttribute(
        "href",
        `event-detail.html?id=${encodeURIComponent(event.id)}`
    );

    heading.appendChild(titleLink);

    // Tạo thời gian
    const timeParagraph = document.createElement("p");

    const timeLabel = document.createElement("strong");
    timeLabel.textContent = "Thời gian: ";

    const timeElement = document.createElement("time");

    timeElement.setAttribute("datetime", event.startTime);

    timeElement.textContent = formatDateTime(event.startTime);

    timeParagraph.appendChild(timeLabel);
    timeParagraph.appendChild(timeElement);

    // Tạo địa điểm
    const locationParagraph = document.createElement("p");

    const locationLabel = document.createElement("strong");
    locationLabel.textContent = "Địa điểm: ";

    const locationText = document.createTextNode(
        event.location || "Chưa cập nhật"
    );

    locationParagraph.appendChild(locationLabel);
    locationParagraph.appendChild(locationText);

    // Tạo số chỗ
    const seatsParagraph = document.createElement("p");
    seatsParagraph.className = "event-seats";

    const seatsText = formatSeats(event);

    if (seatsText === "Hết chỗ") {
        const badge = document.createElement("span");

        badge.className = "full-label";
        badge.textContent = "Hết chỗ";

        seatsParagraph.appendChild(badge);
    } else {
        seatsParagraph.textContent = seatsText;
    }

    // Ghép các phần tử vào card
    content.appendChild(heading);
    content.appendChild(timeParagraph);
    content.appendChild(locationParagraph);
    content.appendChild(seatsParagraph);

    article.appendChild(image);
    article.appendChild(content);

    return article;
};


// Hàm hiển thị danh sách sự kiện

const renderEvents = (events) => {

    const cards = events.map((event, index) => {
        return createEventCard(event, index);
    });

    eventList.replaceChildren(...cards);
};


// Hàm gọi API

const loadEvents = async (keyword = "") => {

    statusElement.textContent = "Đang tải...";

    try {

        const params = new URLSearchParams();

        params.set("pageSize", "50");

        const trimmedKeyword = keyword.trim();

        if (trimmedKeyword !== "") {
            params.set("q", trimmedKeyword);
        }

        // Dựng URL API, gửi request Get
        const url = `${API_URL}?${params.toString()}`;


        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        // check dữ liệu trả về
        const events = Array.isArray(data)
            ? data
            : data && Array.isArray(data.items)
                ? data.items
                : null;

        if (events === null) {
            throw new Error("Invalid events response");
        }

        // Không có sự kiện
        if (events.length === 0) {

            eventList.replaceChildren();

            statusElement.textContent =
                "Không có sự kiện nào khớp từ khoá.";

            return;
        }

        renderEvents(events);

        // Hiển thị số lượng sự kiện
        statusElement.textContent =
            `Tìm thấy ${events.length} sự kiện`;

    } catch (error) {

        console.error("Lỗi tải sự kiện:", error);

        statusElement.textContent =
            "Không tải được dữ liệu từ máy chủ; đang hiển thị sự kiện có sẵn.";
    }
};


// Xử lý form search

searchForm.addEventListener("submit", (event) => {

    // Chặn tải lại trang
    event.preventDefault();

    
    const keyword = keywordInput.value.trim();

    loadEvents(keyword);
});

loadEvents();