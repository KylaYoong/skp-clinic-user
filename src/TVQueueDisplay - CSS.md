.tv-display {
    font-family: Arial, sans-serif;
    text-align: center;
    /* background-color: #f4f4f4; */
    background-color: #000000;
    display: flex;
    flex-direction: column;
    /* height: 100vh; */
    overflow: hidden;
}


/* Header Improvements */
.header {
    font-weight: bold;
    
    color: black;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    padding: 0 30px;
    border-bottom: 1px solid #ccc;
    margin-top: 30px;
}


.date,
.time {
    font-size: 70px;
    white-space: nowrap;
    color: white
}

.main-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex-grow: 1;
    padding: 10px; /* inititally 20px */
}

.horizontal-section {
    display: flex;
    justify-content: center;
    padding: 20px;
    margin-top: 0px;
}

.now-serving-horizontal {
    flex: 1;
    /* border: 3px solid #f44336; */
    /* border: 3px solid #ff9901; */
    /* background-color: #ffebee; */
    /* background-color: #ffffff; */
    border-radius: 10px;
    padding: 10px;
    margin: 0 20px;
    text-align: center;
}

.now-serving-horizontal .queue-number {
    margin-top: 0;
    font-size: 360px;
    /* color: #d32f2f; */
    /* color: #ff9900; */
    color: hsl(56, 100%, 87%);
    font-weight: bold;
}

.waiting-completed {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 10px;
    margin-left: 20px; /* Matches the left margin of the "Now Serving" section */
    margin-right: 20px; /* Matches the right margin of the "Now Serving" section */
}

.waiting-left-side,
.completed-right-side {
    flex: 1;
    margin: 0 20px;
    padding: 20px;
    border-radius: 10px;
    background-color: #ffffff;
}

.waiting-left-side {
    border: 5px solid #f44336;
}

.completed-right-side {
    /* border: 3px solid #ff9800; */
    border: 5px solid #4caf50;
    overflow-y: auto; /* Enable vertical scrolling */
    max-height: calc(100vh - 350px); /* Adjust height based on your layout */
}

.waiting-left-side .queue-item,
.completed-right-side .completed-item {
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 40px;
    padding: 10px;
    border-radius: 10px;
}

.waiting-left-side .queue-item {
    background-color: #f9cad1;
}

.completed-right-side .completed-item {
    /* background-color: #ffe0b2; */
    background-color: #c8e6c9;
}

/* Last item in both sections should not have bottom margin */
.queue-item:last-child,
.completed-item:last-child {
    margin-bottom: 0;
}

/* Current Queue Number */
.now-serving-horizontal h2 {
    margin: 0;
    font-size: 60px;
    padding: 10px 0;
    font-weight: bold;
    /* color: #4caf50 */
    color: #ede570
}

/* Nombor Giliran Sekarang */
.now-serving-horizontal h3 {
    margin: 0;
    font-size: 50px;
    padding: 10px 0;
    font-weight: bold;
    /* color: #4caf50 */
    color: #938e8e
}


/* Align Section Headers */
/* Waiting (Menunggu) & Completed (Selesai) */
.waiting-left-side h2,
.completed-right-side h2 {
    margin: 0;
    font-size: 40px;
    padding: 10px 0;
    font-weight: bold;
}

.waiting-left-side h3,
.completed-right-side h3 {
    margin: 0;
    font-size: 30px;
    padding: 10px 0;
    font-weight: bold;
    color: #696969
}

