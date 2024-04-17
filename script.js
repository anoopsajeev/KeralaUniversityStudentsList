document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        document.getElementById("loading").style.display = "block";
        // Get form data
        const formData = new FormData(form);
        var collegeCode = formData.get('collegeCode');
        var courseCode = formData.get('courseCode');
        var year = formData.get('admissionYear');
        var yr = year % 100;
        var first_roll = courseCode * 100000000 + yr * 1000000 + collegeCode * 1000 + 1;

        // Send POST request to Flask server
        fetch('/scrap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'roll' : first_roll})
        })
        .then(response => response.json())
        .then(data => {
            // Update HTML with student list
            document.getElementById("loading").style.display = "none";
            document.getElementById('result').style.display = 'block';
            const resultList = document.getElementById('resultList');
            resultList.innerHTML = ''; // Clear previous results
            console.log(data.student_list)
            const studentList = JSON.parse(data.student_list);
            var tableHTML = '<table>';
            tableHTML += '<tr><th>Roll</th><th>Name</th></tr>';
            for (const roll in studentList) {
                if (Object.hasOwnProperty.call(studentList, roll)) {
                    const name = studentList[roll];
                    console.log(roll, studentList[roll]);
                    tableHTML += `<tr><td>${roll}</td><td>${name}</td></tr>`;
                }
            }
            tableHTML += '</table>';
            resultList.innerHTML = tableHTML;
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error
        });
    });
});
