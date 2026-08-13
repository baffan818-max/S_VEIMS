import random
from flask import Flask, render_template, request

app = Flask(__name__)

def generate_seating(departments, rows=5, cols=6):
    """
    Generates a seating plan ensuring no two students from 
    the same department sit adjacent (Left/Right or Front/Back).
    """
    hall = [[None for _ in range(cols)] for _ in range(rows)]
    
    # Flatten department student pools
    student_pool = []
    for dept, count in departments.items():
        for i in range(1, count + 1):
            student_pool.append(f"{dept}-{i:03d}")
    
    # Shuffle to distribute evenly
    random.shuffle(student_pool)
    
    for r in range(rows):
        for c in range(cols):
            if not student_pool:
                break
                
            # Find a student who doesn't match adjacent neighbors
            for idx, student in enumerate(student_pool):
                dept = student.split('-')[0]
                
                # Check Left neighbor
                left_dept = hall[r][c-1].split('-')[0] if c > 0 and hall[r][c-1] else None
                # Check Top neighbor
                top_dept = hall[r-1][c].split('-')[0] if r > 0 and hall[r-1][c] else None
                
                if dept != left_dept and dept != top_dept:
                    hall[r][c] = student_pool.pop(idx)
                    break
            else:
                # Fallback if strict placement isn't possible
                hall[r][c] = student_pool.pop(0) if student_pool else "EMPTY"
                
    return hall

@app.route('/', methods=['GET', 'POST'])
def index():
    seating_plan = None
    if request.method == 'POST':
        # Default mock counts for VTU branches
        dept_counts = {
            'CSE': int(request.form.get('cse', 10)),
            'ISE': int(request.form.get('ise', 5)),
            'ECE': int(request.form.get('ece', 5)),
            'EEE': int(request.form.get('eee', 4)),
            'MECH': int(request.form.get('mech', 3)),
            'CIVIL': int(request.form.get('civil', 3))
        }
        seating_plan = generate_seating(dept_counts, rows=5, cols=6)
        
    return render_template('index.html', seating_plan=seating_plan)

if __name__ == '__main__':
    app.run(debug=True)