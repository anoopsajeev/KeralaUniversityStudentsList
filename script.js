document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        document.getElementById('result').style.display = "none";
        document.getElementById("loading").style.display = "block";
        // Get form data
        const formData = new FormData(form);
        var collegeCode = formData.get('collegeCode');
        var courseCode = formData.get('courseCode');
        var year = formData.get('admissionYear');
        var yr = year % 100;
        var first_roll = courseCode * 100000000 + yr * 1000000 + collegeCode * 1000 + 1;

        const resultList = document.getElementById('resultlist');
        resultList.innerHTML = ''; // Clear previous results
        var tableHTML = '<table>';
        tableHTML += '<tr><th>Roll</th><th>Name</th></tr>';
        var roll = first_roll;
        var promises = [];

        // Loop to load candidate names asynchronously
        while (true) {
            promises.push(loadCandidateName(roll));
            console.log(roll);
            roll++;
            if (roll > first_roll + 75) { // Adjust the number of candidates to fetch as needed
                break;
            }
        }
        Promise.all(promises)
            .then(names => {
                names.forEach((name, index) => {
                    if (name !== "") {
                        roll = first_roll + index;
                        console.log(roll, name);
                        tableHTML += `<tr><td>${roll}</td><td>${name}</td></tr>`;
                    }
                });
                tableHTML += '</table>';
                resultList.innerHTML = tableHTML;
                document.getElementById("loading").style.display = "none"; // Hide loading indicator
                document.getElementById('result').style.display = "block";
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById("loading").style.display = "none"; // Hide loading indicator on error
            });
        
    });
});

// Function to load candidate name asynchronously
async function loadCandidateName(roll) {
    const proxyUrl = '/proxy?url='; // Replace with your proxy server URL
    const url = `${proxyUrl}https://pay.keralauniversity.ac.in/kupay/getCandidateName?candcode=${roll}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(data, 'text/html');
        const name = htmlDocument.body.textContent.trim();
        return name;
    } catch (error) {
        console.error('Error fetching data:', error);
        return '';
    }
}
