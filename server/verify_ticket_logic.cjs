const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

const run = (query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const get = (query, params = []) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

async function verify() {
    console.log("Verifying Ticket Logic...");
    const userId = 99999;
    
    // Cleanup first
    await run('DELETE FROM Exhibitions WHERE user_id = ?', [userId]);

    const locationName = "Test Museum";
    const date1 = "2025.01.01";
    const date2 = "2025.01.02";

    // 1. Simulate Upload 1 (Date 1)
    console.log(`\n1. Creating Exhibition for '${locationName}' on ${date1}`);
    let ex1 = await get('SELECT id FROM Exhibitions WHERE user_id = ? AND name = ? AND visit_date = ?', [userId, locationName, date1]);
    if (!ex1) {
        const res = await run(
            'INSERT INTO Exhibitions (user_id, name, visit_date, location, review, bg_color) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, locationName, date1, 'Seoul', '', '#FF0000']
        );
        ex1 = { id: res.lastID };
        console.log("   -> Created Exhibition ID:", ex1.id);
    } else {
        console.log("   -> Found Existing ID:", ex1.id);
    }

    // 2. Simulate Upload 2 (Date 1 - SAME DATE)
    console.log(`\n2. Creating Exhibition for '${locationName}' on ${date1} (SAME DATE)`);
    let ex2 = await get('SELECT id FROM Exhibitions WHERE user_id = ? AND name = ? AND visit_date = ?', [userId, locationName, date1]);
    if (ex2) {
        console.log("   -> Found Existing ID:", ex2.id);
        if (ex2.id === ex1.id) console.log("   -> SUCCESS: Reused same ticket for same date.");
        else console.error("   -> FAIL: Created duplicate ticket for same date!");
    } else {
        console.error("   -> FAIL: Did not find existing ticket for same date!");
    }

    // 3. Simulate Upload 3 (Date 2 - DIFFERENT DATE)
    console.log(`\n3. Creating Exhibition for '${locationName}' on ${date2} (DIFFERENT DATE)`);
    let ex3 = await get('SELECT id FROM Exhibitions WHERE user_id = ? AND name = ? AND visit_date = ?', [userId, locationName, date2]);
    if (!ex3) {
        const res = await run(
            'INSERT INTO Exhibitions (user_id, name, visit_date, location, review, bg_color) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, locationName, date2, 'Seoul', '', '#00FF00']
        );
        ex3 = { id: res.lastID };
        console.log("   -> Created Exhibition ID:", ex3.id);
    }
    
    if (ex3.id !== ex1.id) {
        console.log("   -> SUCCESS: Created NEW ticket for different date.");
    } else {
        console.error("   -> FAIL: Reused ticket for different date!");
    }

    // Cleanup
    await run('DELETE FROM Exhibitions WHERE user_id = ?', [userId]);
}

verify();
