import { authenticateUser } from '../db.js';

console.log('--- TESTING AUTHENTICATION LOGIC ---');

// 1. Valid Admin Login (Admin.rk)
let res1 = authenticateUser('Admin.rk', 'admin@rk06');
console.log('1. Admin.rk / admin@rk06:', res1.success ? `SUCCESS (Role: ${res1.user.role}, Name: ${res1.user.name})` : `FAIL (${res1.message})`);

// 2. Valid Admin Login (admin.rk lower)
let res2 = authenticateUser('admin.rk', 'admin@rk06');
console.log('2. admin.rk / admin@rk06:', res2.success ? `SUCCESS (Role: ${res2.user.role}, Name: ${res2.user.name})` : `FAIL (${res2.message})`);

// 3. Admin Login with Wrong Password
let res3 = authenticateUser('admin.rk', 'wrongpass');
console.log('3. admin.rk / wrongpass:', res3.success ? 'SUCCESS' : `REJECTED AS EXPECTED (${res3.message})`);

// 4. Old Admin Login Attempt (ramesh)
let res4 = authenticateUser('ramesh', 'admin123');
console.log('4. ramesh / admin123 (old):', res4.success ? 'SUCCESS' : `REJECTED AS EXPECTED (${res4.message})`);

// 5. User Login with John & user@123
let res5 = authenticateUser('John', 'user@123');
console.log('5. John / user@123:', res5.success ? `SUCCESS (Role: ${res5.user.role}, Name: ${res5.user.name})` : `FAIL (${res5.message})`);

// 6. User Login with Sarah & user@123
let res6 = authenticateUser('Sarah', 'user@123');
console.log('6. Sarah / user@123:', res6.success ? `SUCCESS (Role: ${res6.user.role}, Name: ${res6.user.name})` : `FAIL (${res6.message})`);

// 7. User Login with Wrong Password
let res7 = authenticateUser('John', 'user123');
console.log('7. John / user123 (wrong):', res7.success ? 'SUCCESS' : `REJECTED AS EXPECTED (${res7.message})`);

// 8. User Login with Empty Name
let res8 = authenticateUser('  ', 'user@123');
console.log('8. <empty> / user@123:', res8.success ? 'SUCCESS' : `REJECTED AS EXPECTED (${res8.message})`);

console.log('--- ALL AUTH TESTS COMPLETED ---');
