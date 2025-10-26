# 🚀 SCHEDULE MODULE - Quick Integration Guide

## ✅ Files Created

1. **schedule.service.js** - Business logic (8 functions)
2. **schedule.controller.js** - HTTP handlers (8 controllers)
3. **schedule.validation.js** - Input validation (8 schemas)
4. **schedule.helper.js** - Schedule utilities (10 functions)
5. **date.helper.js** - Shared date utilities (20 functions)

---

## 📦 Installation Steps

### Step 1: Copy Files
```bash
# Copy schedule module files
cp schedule.service.js backend/src/services/
cp schedule.controller.js backend/src/controllers/
cp schedule.validation.js backend/src/validations/
cp schedule.helper.js backend/src/helpers/
cp date.helper.js backend/src/helpers/
```

### Step 2: Update Routes

#### **Common Routes** (Student & Teacher)
```javascript
// routes/api.js or routes/common.routes.js
import scheduleController from '../controllers/schedule.controller.js';

// =======================================
// SCHEDULE ROUTES (Students & Teachers)
// =======================================

// Get schedule by date
userRouter.get('/api/users/schedule/date', 
    scheduleController.getScheduleByDateController);

// Get weekly schedule
userRouter.get('/api/users/schedule/weekly', 
    scheduleController.getWeeklyScheduleController);

// Get schedule by academic period (UNIFIED ENDPOINT)
userRouter.get('/api/users/schedule/academic-period/:academicPeriodId', 
    scheduleController.getScheduleByAcademicPeriodController);
```

#### **Teacher Routes**
```javascript
// routes/teacher.routes.js
import scheduleController from '../controllers/schedule.controller.js';

// Get teacher's classes
userRouter.get('/api/teacher/schedules', 
    scheduleController.getTeacherSchedulesController);
```

#### **Admin Routes**
```javascript
// routes/admin.routes.js
import scheduleController from '../controllers/schedule.controller.js';

// ===============
// ADMIN ROUTES - Schedule Management
// ===============

// Create schedule
userRouter.post('/api/admin/schedules', 
    scheduleController.createScheduleController);

// Update schedule
userRouter.patch('/api/admin/schedules/:id', 
    scheduleController.updateScheduleController);

// Delete schedule
userRouter.delete('/api/admin/schedules/:id', 
    scheduleController.deleteScheduleController);

// Bulk create schedules
userRouter.post('/api/admin/schedules/bulk', 
    scheduleController.bulkCreateSchedulesController);
```

---

## 🧪 Quick Tests

### Test 1: Get Daily Schedule
```bash
curl -X GET "http://localhost:3000/api/users/schedule/date?date=2025-10-26" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Get Weekly Schedule
```bash
curl -X GET "http://localhost:3000/api/users/schedule/weekly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Get Academic Period Schedule (THE BIG ONE!)
```bash
curl -X GET "http://localhost:3000/api/users/schedule/academic-period/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Create Schedule (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "classId": 1,
    "subjectId": 5,
    "teacherId": 10,
    "dayOfWeek": 1,
    "startTime": "08:00:00",
    "endTime": "09:30:00",
    "room": "Room 101",
    "academicPeriodId": 1
  }'
```

### Test 5: Update Schedule (Admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/schedules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "room": "Lab 2",
    "startTime": "09:00:00"
  }'
```

### Test 6: Delete Schedule (Admin)
```bash
curl -X DELETE "http://localhost:3000/api/admin/schedules/1?softDelete=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Date Format Errors
```
Error: Invalid date format
```
**Solution:** Use YYYY-MM-DD format (e.g., "2025-10-26")

### Issue 2: Time Format Errors
```
Error: Start time must be in HH:MM:SS format
```
**Solution:** Use HH:MM:SS format (e.g., "08:00:00")

### Issue 3: Conflict Errors
```
Error: Teacher has conflicting schedule
```
**Solution:** Check existing schedules, adjust time slots

### Issue 4: Import Path Errors
```
Error: Cannot find module '../helpers/date.helper.js'
```
**Solution:** Make sure date.helper.js is in helpers folder

---

## ✅ Integration Checklist

### Files:
- [ ] schedule.service.js copied to services/
- [ ] schedule.controller.js copied to controllers/
- [ ] schedule.validation.js copied to validations/
- [ ] schedule.helper.js copied to helpers/
- [ ] date.helper.js copied to helpers/

### Routes:
- [ ] Common routes added (date, weekly, academic-period)
- [ ] Teacher routes added (schedules list)
- [ ] Admin routes added (CRUD operations)

### Testing:
- [ ] Get schedule by date (student)
- [ ] Get schedule by date (teacher)
- [ ] Get weekly schedule
- [ ] Get academic period schedule (UNIFIED!)
- [ ] Get teacher schedules
- [ ] Create schedule (admin)
- [ ] Update schedule (admin)
- [ ] Delete schedule (admin)
- [ ] Bulk create schedules (admin)
- [ ] Conflict detection working
- [ ] Authorization working

### Integration:
- [ ] Works with Session module
- [ ] Date helpers accessible by all modules
- [ ] No import errors
- [ ] All endpoints respond correctly

---

## 🔄 Replacing Old Code

### Before:
```javascript
// Old mixed file
userRouter.get('/api/users/schedule/date', 
    classSessionController.getClassScheduleByDateController);
```

### After:
```javascript
// New schedule module
import scheduleController from '../controllers/schedule.controller.js';

userRouter.get('/api/users/schedule/date', 
    scheduleController.getScheduleByDateController);
```

---

## 📊 Module Stats

| Metric | Value |
|--------|-------|
| **Total Files** | 5 |
| **Total Functions** | 46 |
| **API Endpoints** | 8 |
| **Lines of Code** | ~1,900 |
| **Roles Supported** | 3 (Student/Teacher/Admin) |

---

## 🎯 Key Endpoints

### **For Students:**
- View daily schedule
- View weekly timetable
- View full academic period (with their attendance!)

### **For Teachers:**
- View daily schedule
- View weekly timetable
- View full academic period (with session summaries!)
- Get list of classes they teach

### **For Admins:**
- All viewing features
- Create schedules (with conflict detection)
- Update schedules (with conflict re-checking)
- Delete schedules (smart soft/hard delete)
- Bulk create schedules

---

## 🚀 You're Done!

**Schedule module integrated!** ✅

Next:
1. ✅ Session module (already done!)
2. ✅ Schedule module (just finished!)
3. ⏳ Attendance module (next up!)

**Almost there!** 💪🚀
