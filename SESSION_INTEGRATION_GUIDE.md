# 🚀 SESSION MODULE - Quick Integration Guide

## Step-by-Step Setup

### 1️⃣ **Copy Files to Project**

```bash
# Create directories if they don't exist
mkdir -p backend/src/services
mkdir -p backend/src/controllers
mkdir -p backend/src/validations
mkdir -p backend/src/helpers

# Copy the files
cp session.service.js backend/src/services/
cp session.controller.js backend/src/controllers/
cp session.validation.js backend/src/validations/
cp session.helper.js backend/src/helpers/
```

---

### 2️⃣ **Update Import Paths**

In `session.service.js`, update the import:
```javascript
// Change this line:
import { calculateSessionSummary, validateSessionOwnership } from "../helpers/session.helper.js";

// If your helpers folder is named 'helper' instead of 'helpers':
import { calculateSessionSummary, validateSessionOwnership } from "../helper/session.helper.js";
```

In `session.controller.js`, update the import:
```javascript
// Change this line:
import sessionService from "../services/session.service.js";

// If your services folder is named 'service' instead of 'services':
import sessionService from "../service/session.service.js";
```

---

### 3️⃣ **Update Teacher Routes**

Edit `backend/src/routes/api.js` or your teacher routes file:

```javascript
import sessionController from "../controllers/session.controller.js";

// Add these routes to teacher section
// ===============
// TEACHER ROUTES - Session Management
// ===============

// Create new session
userRouter.post('/api/teacher/sessions', 
    sessionController.createSessionController);

// Get session details
userRouter.get('/api/teacher/sessions/:id', 
    sessionController.getSessionController);

// Get sessions list for a schedule
userRouter.get('/api/teacher/schedule/:scheduleId/sessions', 
    sessionController.getSessionsListController);

// Update session status
userRouter.patch('/api/teacher/sessions/:id/status', 
    sessionController.updateSessionStatusController);

// End session (shortcut for completing)
userRouter.post('/api/teacher/sessions/:id/end', 
    sessionController.endSessionController);

// Cancel session
userRouter.post('/api/teacher/sessions/:id/cancel', 
    sessionController.cancelSessionController);

// Get active sessions
userRouter.get('/api/teacher/sessions/active', 
    sessionController.getActiveSessionsController);
```

---

### 4️⃣ **Update Student Routes**

Add to student section in your routes:

```javascript
import sessionController from "../controllers/session.controller.js";

// ===============
// STUDENT ROUTES
// ===============

// Get active sessions (where student needs to check in)
userRouter.get('/api/student/sessions/active', 
    sessionController.getActiveSessionsController);
```

---

### 5️⃣ **Update Admin Routes**

Add to admin section:

```javascript
import sessionController from "../controllers/session.controller.js";

// ===============
// ADMIN ROUTES
// ===============

// Get session statistics
userRouter.get('/api/admin/sessions/statistics', 
    sessionController.getSessionStatisticsController);
```

---

### 6️⃣ **Deprecate Old Endpoints (Optional)**

If you want to keep old endpoints temporarily:

```javascript
// OLD ENDPOINTS (Deprecated - will be removed in future version)
// Use new session controller endpoints instead

userRouter.post('/api/teacher/sessions/OLD', 
    classSessionController.createClassSessionController);

userRouter.get('/api/teacher/session/:id/OLD', 
    classSessionController.getClassSessionController);

// ... etc
```

Or just replace them entirely with the new ones!

---

## 🧪 Testing the Integration

### Test 1: Create Session
```bash
curl -X POST http://localhost:3000/api/teacher/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "classScheduleId": 1,
    "date": "2025-10-27",
    "notes": "Regular class"
  }'
```

**Expected:** 201 status with session data

---

### Test 2: Get Session Details
```bash
curl -X GET http://localhost:3000/api/teacher/sessions/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected:** 200 status with full session details + attendances

---

### Test 3: Get Sessions List
```bash
curl -X GET http://localhost:3000/api/teacher/schedule/1/sessions \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected:** 200 status with array of sessions + summaries

---

### Test 4: End Session
```bash
curl -X POST http://localhost:3000/api/teacher/sessions/1/end \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

**Expected:** 200 status with completed session info

---

### Test 5: Get Active Sessions (Student)
```bash
curl -X GET http://localhost:3000/api/student/sessions/active \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected:** 200 status with array of ongoing sessions where student is absent

---

### Test 6: Get Statistics (Admin)
```bash
curl -X GET "http://localhost:3000/api/admin/sessions/statistics?startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** 200 status with statistics object

---

## ⚠️ Common Issues & Solutions

### Issue 1: Import Errors
```
Error: Cannot find module '../helpers/session.helper.js'
```

**Solution:** Check your folder naming. Change `helpers` to `helper` if needed.

---

### Issue 2: Validation Errors
```
Error: "profileId" is required
```

**Solution:** Make sure your auth middleware sets `req.user.profileId`

---

### Issue 3: Database Connection
```
Error: Cannot connect to database
```

**Solution:** Check `prismaClient` is properly initialized in `../application/database.js`

---

### Issue 4: 404 on Routes
```
Cannot GET /api/teacher/sessions/1
```

**Solution:** Make sure you've added the routes to your router and the router is mounted in your main app

---

## 🔄 Migration from Old Code

### Before (Old Way):
```javascript
// routes/api.js
userRouter.post('/api/teacher/sessions', 
    classSessionController.createClassSessionController);
```

### After (New Way):
```javascript
// routes/api.js
import sessionController from '../controllers/session.controller.js';

userRouter.post('/api/teacher/sessions', 
    sessionController.createSessionController);
```

---

## ✅ Integration Checklist

- [ ] Files copied to correct locations
- [ ] Import paths updated (helpers vs helper, services vs service)
- [ ] Teacher routes added
- [ ] Student routes added
- [ ] Admin routes added
- [ ] Old routes deprecated or removed
- [ ] Test with Postman: Create session
- [ ] Test with Postman: Get session details
- [ ] Test with Postman: Get sessions list
- [ ] Test with Postman: End session
- [ ] Test with Postman: Active sessions (student)
- [ ] Test with Postman: Active sessions (teacher)
- [ ] Test with Postman: Statistics (admin)
- [ ] Authorization working correctly
- [ ] Error handling working
- [ ] Response format consistent

---

## 📞 Quick Reference

### File Locations:
```
backend/src/
├── services/
│   └── session.service.js         ← Business logic
├── controllers/
│   └── session.controller.js      ← HTTP handlers
├── validations/
│   └── session.validation.js      ← Input validation
└── helpers/
    └── session.helper.js          ← Utility functions
```

### Dependencies:
- `prismaClient` from `../application/database.js`
- `ResponseError` from `../error/response-error.js`
- `validate` from `../validation/validation.js`
- `Joi` package for validation

### Key Functions:
- `createSession()` - Create new session
- `getSession()` - Get session details
- `getSessionsList()` - List sessions
- `endSession()` - Complete session
- `getActiveSessions()` - Active sessions

---

## 🎉 You're Done!

Once all tests pass, your session module is **production-ready**! 

Next steps:
1. ✅ Test thoroughly with real data
2. ✅ Update frontend to use new endpoints
3. ✅ Move on to Schedule or Attendance module
4. ✅ Remove old session code once migration complete

**Happy coding! 🚀**
