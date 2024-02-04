let IP;
let postOffices;

// getting IP address when document load
$(document).ready(() => {
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    IP = data.ip;
    console.log(IP);
    $("#right_container span").html(IP);
  });
});

const getStartedSection = document.getElementById("get_started_section");
const mainSection = document.getElementById("main_section");

document.getElementById("get_started_btn").addEventListener("click", () => {
  //   if (IP) {
  getStartedSection.style.display = "none";
  mainSection.style.display = "block";
  getInfo();
  //   }
});

// Getting data using IP address
async function getInfo() {
  try {
    const response = await fetch(`https://ipapi.co/${IP}/json/`);
    const res = await response.json();

    showUserDetails(res);
    showLocationOnMap(res);
    const postOfficeData = await fetchPostOffices(res.postal);
    const message = postOfficeData[0].Message;
    postOffices = postOfficeData[0].PostOffice;
    showMoreInfo(res, message);
    showPostOffices(postOffices);
  } catch (error) {
    console.error("Error fetching ipapi", error);
  }
}

// Function to show user details.
function showUserDetails(data) {
  const userDetails = document.getElementById("user_details");
  userDetails.innerHTML = `
        <p>IP Address : ${data.ip}</p>
        <div>
            <div>
                <p>Lat : ${data.latitude}</p>
                <p>Long : ${data.longitude}</p>
            </div>
            <div>
                <p>City : ${data.city}</p>
                <p>Region : ${data.region}</p>
            </div>
            <div>
                <p>Organisation : ${data.org}</p>
                <p>Hostname : ${data.asn}</p>
            </div>
        </div>
    `;
}

// Function to show user location on map
function showLocationOnMap(data) {
  const mapContainer = document.getElementById("map_container");
  mapContainer.innerHTML += `
        <iframe src="https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed"
        width="90%"
        height="85%"
        frameborder="0"
        style="border:0">
        </iframe>
    `;
}

// Function to show more info.
function showMoreInfo(data, message) {
  const myCurrentTime = new Date().toLocaleString(`en-${data.country_code}`, {
    timeZone: data.timezone,
  });

  const moreInfo = document.getElementById("more_info");
  moreInfo.innerHTML = `
        <div>
            <p>Time Zone: ${data.timezone}</p>
            <p>Date And Time: ${myCurrentTime}</p>
            <p>Pincode: ${data.postal}</p>
            <p>Message:<span> ${message}</span></p>
        </div>
    `;
}

// Getting post offices data
async function fetchPostOffices(pincode) {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post offices:", error);
    return [];
  }
}

// Function to show post offices on page.
function showPostOffices(data) {
  const postOfficeContainer = document.getElementById("post_offices");
  postOfficeContainer.innerHTML = "";
  if (!data || data.length === 0) {
    postOfficeContainer.innerHTML = "<h1>No Post Offices available</h1>";
  }
  data.forEach((postOffice) => {
    postOfficeContainer.innerHTML += `
            <div class="post_office">
                <p>Name : ${postOffice.Name}</p>
                <p>Branch Type : ${postOffice.BranchType}</p>
                <p>Delivery Status : ${postOffice.DeliveryStatus}</p>
                <p>District : ${postOffice.District}</p>
                <p>Division : ${postOffice.Division}</p>
            </div>
        `;
  });
}

// Adding event listener to search input for fitering post office data according to search query.
document.getElementById("search_input").addEventListener("input", (e) => {
  const searchQuery = e.target.value.trim().toLowerCase();
  showPostOffices(
    postOffices.filter(
      (item) =>
        item.Name.toLowerCase().includes(searchQuery) ||
        item.BranchType.toLowerCase().includes(searchQuery)
    )
  );
});