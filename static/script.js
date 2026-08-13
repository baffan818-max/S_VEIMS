// Faculty Database for Invigilation
const facultyList = [
    { name: "Dr. Sharma", dept: "MECH", exp: "12 Yrs" },
    { name: "Prof. Anitha", dept: "CIVIL", exp: "8 Yrs" },
    { name: "Dr. Ramesh", dept: "EEE", exp: "15 Yrs" },
    { name: "Prof. Suresh", dept: "ECE", exp: "6 Yrs" },
    { name: "Dr. Kavitha", dept: "ISE", exp: "10 Yrs" },
    { name: "Prof. Rahul", dept: "CSE", exp: "5 Yrs" }
];

function generateEverything() {
    const rows = 5;
    const cols = 6;
    
    // 1. Fetch Student Counts
    const depts = {
        'CS': parseInt(document.getElementById('cse').value) || 0,
        'IS': parseInt(document.getElementById('ise').value) || 0,
        'EC': parseInt(document.getElementById('ece').value) || 0,
        'EE': parseInt(document.getElementById('eee').value) || 0,
        'ME': parseInt(document.getElementById('mech').value) || 0,
        'CI': parseInt(document.getElementById('civil').value) || 0
    };

    // 2. Build VTU USN Pool (Format: 1MS21CS001)
    let studentPool = [];
    for (let branch in depts) {
        for (let i = 1; i <= depts[branch]; i++) {
            let num = i.toString().padStart(3, '0');
            studentPool.push(`1MS21${branch}${num}`);
        }
    }

    // Shuffle pool for fair mixing
    studentPool.sort(() => Math.random() - 0.5);

    // 3. Zero-Adjacent Seating Matrix Algorithm
    let hall = Array(rows).fill(null).map(() => Array(cols).fill(null));
    let branchCountsInHall = {};

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (studentPool.length === 0) break;

            let placed = false;
            for (let i = 0; i < studentPool.length; i++) {
                let usn = studentPool[i];
                let currentBranch = usn.substring(5, 7);

                let leftBranch = (c > 0 && hall[r][c - 1]) ? hall[r][c - 1].substring(5, 7) : null;
                let topBranch = (r > 0 && hall[r - 1][c]) ? hall[r - 1][c].substring(5, 7) : null;

                // Rule: No left or top neighbor from same branch
                if (currentBranch !== leftBranch && currentBranch !== topBranch) {
                    hall[r][c] = studentPool.splice(i, 1)[0];
                    branchCountsInHall[currentBranch] = (branchCountsInHall[currentBranch] || 0) + 1;
                    placed = true;
                    break;
                }
            }

            if (!placed && studentPool.length > 0) {
                let usn = studentPool.shift();
                hall[r][c] = usn;
                let b = usn.substring(5, 7);
                branchCountsInHall[b] = (branchCountsInHall[b] || 0) + 1;
            }
        }
    }

    // 4. Render Grid to HTML
    const gridContainer = document.getElementById('hall-grid');
    gridContainer.innerHTML = '';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let seat = document.createElement('div');
            seat.className = 'seat';
            let usn = hall[r][c] || 'EMPTY';
            seat.innerText = usn;

            if (usn !== 'EMPTY') {
                let branch = usn.substring(5, 7);
                seat.classList.add(`b-${branch}`);
            } else {
                seat.classList.add('b-EMPTY');
            }
            gridContainer.appendChild(seat);
        }
    }

    // 5. Assign Neutral Invigilator Algorithm
    // Find the branch with the MOST students in the hall
    let dominantBranch = Object.keys(branchCountsInHall).reduce((a, b) => 
        branchCountsInHall[a] > branchCountsInHall[b] ? a : b, 'CS');

    // Rule: Pick a faculty who is NOT from the dominant branch
    let neutralFaculty = facultyList.find(f => f.dept.substring(0,2) !== dominantBranch) || facultyList[0];

    document.getElementById('invigilator-info').innerHTML = `
        <p><strong>Name:</strong> ${neutralFaculty.name}</p>
        <p><strong>Department:</strong> ${neutralFaculty.dept}</p>
        <p><strong>Status:</strong> <span class="badge-success">Verified Neutral (Dominant Hall Branch is ${dominantBranch})</span></p>
    `;
}

// Auto-run on page start
window.onload = generateEverything;