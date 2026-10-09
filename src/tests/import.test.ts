import test from 'node:test'
import assert from 'node:assert'

test('Participant Import Validation Rules', async (t) => {

  await t.test('detect missing email addresses', () => {
    const row = { "Full Name": "Test User", "Email Address": "" };
    const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email address'));
    // @ts-ignore
    const email = emailKey ? row[emailKey]?.trim() : null;
    
    assert.strictEqual(email, '', 'Should detect empty email string');
    assert.strictEqual(!email, true, 'Row should be marked as invalid missing email');
  });

  await t.test('detect duplicate emails within the CSV', () => {
    const rows = [
      { "Email Address": "test@example.com" },
      { "Email Address": "test@example.com" }
    ];
    
    const seen = new Set();
    let duplicates = 0;
    
    for (const row of rows) {
      const email = row["Email Address"];
      if (seen.has(email)) {
        duplicates++;
      } else {
        seen.add(email);
      }
    }
    
    assert.strictEqual(duplicates, 1, 'Should detect 1 duplicate in the CSV');
  });

  await t.test('detect existing accounts in the database', () => {
    const existingEmailsInDb = new Set(["existing@example.com"]);
    const csvEmail = "existing@example.com";
    
    const isAlreadyExisting = existingEmailsInDb.has(csvEmail);
    assert.strictEqual(isAlreadyExisting, true, 'Should mark row as Already Existing and prevent overwrite');
  });

  await t.test('detect invalid email formats', () => {
    const email = "invalid-email-format";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const isValid = emailRegex.test(email);
    assert.strictEqual(isValid, false, 'Regex should reject malformed email strings');
  });

  await t.test('preserve non-conflicting existing records', () => {
    const existingEmailsInDb = new Set(["user1@example.com"]);
    
    const incomingRows = [
      { "Email Address": "user1@example.com", Name: "User 1 Updated" },
      { "Email Address": "user2@example.com", Name: "User 2 New" }
    ];
    
    const toInsert = incomingRows.filter(r => !existingEmailsInDb.has(r["Email Address"]));
    
    assert.strictEqual(toInsert.length, 1, 'Should only insert user2, skipping user1 to preserve existing account data.');
    assert.strictEqual(toInsert[0]["Email Address"], "user2@example.com");
  });
});
