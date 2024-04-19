var currentYear = new Date().getFullYear();
var startYear = 2014;
var selectElement = document.getElementById('admissionYear');
      
for (var i = currentYear; i >= startYear; i--) {
    var option = document.createElement('option');
    option.text = option.value = i;
    selectElement.add(option);
}

var clgName;
var courseName;
var year;

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        document.getElementById('result').style.display = "none";
        document.getElementById("message").innerHTML = 'Fetching data from university server<br>Please Wait';
        document.getElementById("message").style.display = "block";
        // Get form data
        const formData = new FormData(form);
        var collegeCode = formData.get('collegeCode');
        var courseCode = formData.get('courseCode');
        year = formData.get('admissionYear');
        var yr = year % 100;
        var first_roll = courseCode * 100000000 + yr * 1000000 + collegeCode * 1000 + 1;

        var selectElementclg = document.getElementById('collegeCode');
        var selectedOptionclg = selectElementclg.options[selectElementclg.selectedIndex];
        clgName = selectedOptionclg.textContent;
        var selectElementcrs = document.getElementById('courseCode');
        var selectedOptioncrs = selectElementcrs.options[selectElementcrs.selectedIndex];
        courseName = selectedOptioncrs.textContent;

        const resultList = document.getElementById('resultlist');
        resultList.innerHTML = ''; // Clear previous results
        var tableHTML = `<table id="studenttable"><caption style="text-align:left;">College Name: ${clgName} <br><br>Course Name: ${courseName} <br><br>Year of Admission: ${year}<br><br>`;
        tableHTML += '<tr><th>Roll</th><th>Name</th></tr>';
        var roll = first_roll;
        var promises = [];

        // Loop to load candidate names asynchronously
        while (roll < first_roll + 75) {
            promises.push(loadCandidateName(roll));
            roll++;
        }

        let loadedCount = 0;
        Promise.all(promises)
            .then(names => {
                names.forEach((name, index) => {
                    loadedCount++;
                    const percentage = Math.round((loadedCount / promises.length) * 100);
                    document.getElementById("message").innerHTML = `Fetching data from university server.....<br>${percentage} completed`;
                    if (name !== "") {
                        roll = first_roll + index;
                        console.log(roll, name);
                        tableHTML += `<tr><td>${roll}</td><td>${name}</td></tr>`;
                    }
                });
                tableHTML += '</table><br><br><center><button onclick="downloadPDF()">Download as PDF</button></center>';
                resultList.innerHTML = tableHTML;
                document.getElementById("message").style.display = "none"; // Hide loading indicator
                document.getElementById('result').style.display = "block";
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById("message").innerHTML = 'Error fetching data from university server.'; // Hide loading indicator on error
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

function downloadPDF() {
    const table = document.getElementById("studenttable");
    const { jsPDF } = window.jspdf
    const doc = new jsPDF('p', 'pt', 'letter');
    var htmlstring = '';  
    var tempVarToCheckPageHeight = 0;  
    var pageHeight = 0;  
    pageHeight = doc.internal.pageSize.height;  
    specialElementHandlers = {  
        '#bypassme': function(element, renderer) {  
            return true  
        }  
    };  
    margins = {  
        top: 60,  
        bottom: 60,  
        left: 40,  
        right: 40,  
        width: 600  
    };  
    var y = 20;
    doc.text("STUDENTS LIST", doc.internal.pageSize.width / 2, 40, { align: "center" });

 
    doc.setFontSize(12); 

    let captionText = `College: ${clgName} \nCourse: ${courseName} \nYear of Admission: ${year} \n`
    
    doc.setFontSize(12); 
    doc.text(captionText, 40, 70);
    doc.setLineWidth(2);    
    doc.autoTable({  
        html: '#studenttable',  
        margin: { top: 80 },
        startY: 120,  
        theme: 'grid',  
        columnStyles: {  
            0: {  
                cellWidth: 180,  
            },  
            1: {  
                cellWidth: 180,  
            },    
        },  
        styles: {  
            minCellHeight: 20,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],  
        },
        headStyles: {
            fontStyle: 'bold',
            fillColor: [200, 200, 200], 
            textColor: [0, 0, 0],
        },  
    })  
    doc.save("students_list.pdf");
}

