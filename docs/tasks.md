# Implementation Plan: Group Meeting Management

## Overview

This implementation plan breaks down the Group Meeting Management feature into discrete, manageable coding tasks. The feature is a full-stack Next.js application with PostgreSQL database, authentication, role-based access control, and real-time notifications. The implementation follows an incremental approach, building core infrastructure first, then implementing features layer by layer, with integration and testing at each checkpoint.

## Tasks

- [ ] 1. Set up project infrastructure and database schema
  - [ ] 1.1 Initialize Next.js project with TypeScript and configure dependencies
    - Install Next.js 14+, React 18+, TypeScript, Tailwind CSS, Drizzle ORM, Zustand, NextAuth.js
    - Configure TypeScript with strict mode
    - Set up Tailwind CSS configuration
    - _Requirements: 12.1, 12.2_
  
  - [ ] 1.2 Create database schema files with Drizzle ORM
    - Create `schema/users.ts` with users table definition
    - Create `schema/groups.ts` with groups and group_members tables
    - Create `schema/meetings.ts` with meetings table
    - Create `schema/weeklyReports.ts` with weekly_reports table
    - Create `schema/comments.ts` with comments table
    - Create `schema/questions.ts` with questions and question_replies tables
    - Create `schema/taskAssignments.ts` with task_assignments table
    - Create `schema/meetingMaterials.ts` with meeting_materials table
    - Create `schema/notifications.ts` with notifications table
    - _Requirements: 11.1_
  
  - [ ] 1.3 Create TypeScript type definitions
    - Create `types/index.ts` with all entity interfaces (User, Group, Meeting, WeeklyReport, Comment, Question, QuestionReply, TaskAssignment, MeetingMaterial, Notification)
    - Define type aliases (UserRole, PermissionLevel, NotificationType, FileType)
    - _Requirements: 9.2_
  
  - [ ]* 1.4 Set up database connection and run migrations
    - Configure PostgreSQL connection with Drizzle
    - Create migration scripts
    - Test database connectivity
    - _Requirements: 11.1_

- [ ] 2. Implement authentication and authorization
  - [ ] 2.1 Set up NextAuth.js configuration
    - Create `app/api/auth/[...nextauth]/route.ts`
    - Configure credentials provider with email/password
    - Implement session management
    - Create authentication middleware
    - _Requirements: 9.1, 9.5_
  
  - [ ] 2.2 Create authentication pages
    - Create `app/(auth)/login/page.tsx` with login form
    - Create `app/(auth)/register/page.tsx` with registration form
    - Implement form validation with Zod schemas
    - _Requirements: 9.1_
  
  - [ ] 2.3 Implement authorization utilities
    - Create `lib/auth/permissions.ts` with role-checking functions
    - Implement `canViewReport()` function for report permission logic
    - Implement `isAdvisor()` and `isStudent()` helper functions
    - Create middleware to protect routes based on user role
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 2.4 Write unit tests for authorization utilities
    - Test `canViewReport()` with different user roles and permission levels
    - Test role-checking functions
    - Test middleware protection logic
    - _Requirements: 9.3, 9.4_

- [ ] 3. Checkpoint - Verify authentication setup
  - Ensure database migrations run successfully
  - Verify users can register and log in
  - Test role-based route protection
  - Ask the user if questions arise

- [ ] 4. Create Zustand stores for state management
  - [ ] 4.1 Create auth store
    - Create `stores/authStore.ts` with user session state
    - Implement `setUser()` and `logout()` actions
    - _Requirements: 9.1_
  
  - [ ] 4.2 Create groups store
    - Create `stores/groupsStore.ts` with groups state
    - Implement `fetchGroups()`, `selectGroup()`, `createGroup()`, `addMember()`, `removeMember()` actions
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 4.3 Create meetings store
    - Create `stores/meetingsStore.ts` with meetings state
    - Implement `fetchMeetings()`, `createMeeting()`, `updateMeeting()`, `deleteMeeting()` actions
    - _Requirements: 2.1, 2.2_
  
  - [ ] 4.4 Create reports store
    - Create `stores/reportsStore.ts` with weekly reports state
    - Implement `fetchReports()`, `createReport()`, `updateReport()`, `submitReport()`, `addComment()` actions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2_
  
  - [ ] 4.5 Create notifications store
    - Create `stores/notificationsStore.ts` with notifications state
    - Implement `fetchNotifications()`, `markAsRead()`, `markAllAsRead()` actions
    - Set up polling mechanism (every 30 seconds)
    - _Requirements: 10.5, 10.6_
  
  - [ ]* 4.6 Write unit tests for Zustand stores
    - Test state updates and action handlers
    - Mock API calls and verify state changes
    - Test error handling in stores
    - _Requirements: 1.1, 2.1, 3.1, 10.5_

- [ ] 5. Implement Groups API and UI
  - [ ] 5.1 Create Groups API routes
    - Create `app/api/groups/route.ts` with GET (list groups) and POST (create group) handlers
    - Create `app/api/groups/[id]/route.ts` with GET (group details), PATCH (update), DELETE handlers
    - Create `app/api/groups/[id]/members/route.ts` with POST (add member) handler
    - Create `app/api/groups/[id]/members/[userId]/route.ts` with DELETE (remove member) handler
    - Implement authorization checks (advisor-only for create/update/delete)
    - _Requirements: 1.1, 1.2, 1.3, 9.3_
  
  - [ ] 5.2 Create Group components
    - Create `components/groups/GroupCard.tsx` to display group summary
    - Create `components/groups/GroupForm.tsx` for create/edit group
    - Create `components/groups/MemberList.tsx` to display and manage members
    - _Requirements: 1.4, 1.5_
  
  - [ ] 5.3 Create Group pages
    - Create `app/(dashboard)/groups/page.tsx` to list all groups
    - Create `app/(dashboard)/groups/[groupId]/page.tsx` for group detail view
    - Integrate with groups store for data fetching
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 5.4 Write integration tests for Groups API
    - Test group creation, retrieval, update, deletion
    - Test member addition and removal
    - Test authorization checks
    - Use test database for integration tests
    - _Requirements: 1.1, 1.2, 1.3, 9.3_

- [ ] 6. Implement Meetings API and UI
  - [ ] 6.1 Create Meetings API routes
    - Create `app/api/meetings/route.ts` with GET (list meetings) and POST (create meeting) handlers
    - Create `app/api/meetings/[id]/route.ts` with GET (meeting details), PATCH (update), DELETE handlers
    - Implement notification creation when meeting is created
    - _Requirements: 2.1, 2.2, 2.3, 10.1_
  
  - [ ] 6.2 Create Meeting components
    - Create `components/meetings/MeetingCard.tsx` to display meeting summary
    - Create `components/meetings/MeetingForm.tsx` for create/edit meeting
    - _Requirements: 2.4, 2.5_
  
  - [ ] 6.3 Create Meeting pages
    - Create `app/(dashboard)/meetings/page.tsx` to list all meetings
    - Create `app/(dashboard)/meetings/[meetingId]/page.tsx` for meeting detail view
    - Create `app/(dashboard)/groups/[groupId]/meetings/page.tsx` for group-specific meetings
    - Integrate with meetings store for data fetching
    - _Requirements: 2.4, 2.5_
  
  - [ ]* 6.4 Write integration tests for Meetings API
    - Test meeting creation, retrieval, update, deletion
    - Test notification creation on meeting creation
    - Test filtering meetings by group
    - _Requirements: 2.1, 2.2, 2.3, 10.1_

- [ ] 7. Checkpoint - Verify groups and meetings functionality
  - Ensure groups can be created and members managed
  - Verify meetings can be created and associated with groups
  - Test notifications are created when meetings are created
  - Ask the user if questions arise

- [ ] 8. Implement Weekly Reports API and UI
  - [ ] 8.1 Create Weekly Reports API routes
    - Create `app/api/reports/route.ts` with GET (list reports with permission filtering) and POST (create report) handlers
    - Create `app/api/reports/[id]/route.ts` with GET (report details), PATCH (update report) handlers
    - Create `app/api/reports/[id]/submit/route.ts` with POST (submit report) handler
    - Create `app/api/reports/[id]/comments/route.ts` with POST (add comment) handler
    - Implement permission-based filtering logic (advisor-only vs group-visible)
    - Implement notification creation when comment is added
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.4_
  
  - [ ] 8.2 Create Weekly Report components
    - Create `components/reports/WeeklyReportCard.tsx` to display report summary
    - Create `components/reports/WeeklyReportForm.tsx` for create/edit report with rich text editor
    - Create `components/comments/CommentSection.tsx` to display and add comments
    - _Requirements: 3.1, 3.2, 4.1, 5.3_
  
  - [ ] 8.3 Create Weekly Report pages
    - Create `app/(dashboard)/reports/page.tsx` to list user's reports
    - Create `app/(dashboard)/reports/new/page.tsx` for creating new report
    - Create `app/(dashboard)/reports/[reportId]/page.tsx` for report detail view with comments
    - Create `app/(dashboard)/groups/[groupId]/reports/page.tsx` for group-specific reports
    - Integrate with reports store for data fetching
    - _Requirements: 3.1, 3.2, 4.1, 5.1, 5.3_
  
  - [ ]* 8.4 Write integration tests for Weekly Reports API
    - Test report creation, retrieval, update, submission
    - Test permission level changes before submission
    - Test permission-based filtering (advisor-only vs group-visible)
    - Test comment addition and notification creation
    - Test prevention of editing after submission
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.4_

- [ ] 9. Implement Q&A API and UI
  - [ ] 9.1 Create Questions API routes
    - Create `app/api/questions/route.ts` with GET (list questions) and POST (create question) handlers
    - Create `app/api/questions/[id]/route.ts` with GET (question details with replies) handler
    - Create `app/api/questions/[id]/replies/route.ts` with POST (add reply) handler
    - Implement anonymous posting logic (hide author when isAnonymous is true)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 9.2 Create Q&A components
    - Create `components/qa/QuestionCard.tsx` to display question with replies
    - Create `components/qa/QuestionForm.tsx` for creating questions with anonymous toggle
    - _Requirements: 6.2, 6.3, 6.7_
  
  - [ ] 9.3 Create Q&A pages
    - Create `app/(dashboard)/groups/[groupId]/qa/page.tsx` for group Q&A area
    - Integrate question creation and reply functionality
    - _Requirements: 6.1, 6.7_
  
  - [ ]* 9.4 Write integration tests for Questions API
    - Test question creation (anonymous and identified)
    - Test reply creation
    - Test author hiding for anonymous questions
    - Test filtering questions by group
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 10. Implement Task Assignments API and UI
  - [ ] 10.1 Create Task Assignments API routes
    - Create `app/api/tasks/route.ts` with GET (list tasks) and POST (create task) handlers
    - Create `app/api/tasks/[id]/route.ts` with GET (task details), PATCH (update), DELETE handlers
    - Implement authorization checks (advisor-only for create/update/delete)
    - Implement notification creation when task is assigned
    - _Requirements: 8.1, 8.2, 8.4, 10.3_
  
  - [ ] 10.2 Create Task Assignment components
    - Create `components/tasks/TaskAssignmentCard.tsx` to display task assignment
    - Create `components/tasks/TaskAssignmentForm.tsx` for creating/editing tasks
    - _Requirements: 8.3, 8.6_
  
  - [ ] 10.3 Create Task Assignment pages
    - Create `app/(dashboard)/groups/[groupId]/tasks/page.tsx` for group task assignments
    - Display tasks filtered by meeting and student
    - Integrate with task creation and editing
    - _Requirements: 8.3, 8.6_
  
  - [ ]* 10.4 Write integration tests for Task Assignments API
    - Test task creation, retrieval, update, deletion
    - Test authorization checks (advisor-only)
    - Test notification creation on task assignment
    - Test filtering tasks by meeting and student
    - _Requirements: 8.1, 8.2, 8.4, 10.3_

- [ ] 11. Checkpoint - Verify reports, Q&A, and tasks functionality
  - Ensure weekly reports can be created with permission controls
  - Verify comments can be added by advisors
  - Test Q&A area with anonymous and identified questions
  - Verify task assignments work correctly
  - Ask the user if questions arise

- [ ] 12. Implement Meeting Materials API and UI
  - [ ] 12.1 Create Meeting Materials API routes
    - Create `app/api/materials/route.ts` with GET (list materials) and POST (upload material) handlers
    - Create `app/api/materials/[id]/route.ts` with GET (download material) and DELETE handlers
    - Implement file upload handling (PDF, PPTX, DOCX)
    - Implement file size validation (max 10MB)
    - Implement notification creation when material is uploaded
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 10.4_
  
  - [ ] 12.2 Create Meeting Materials components
    - Create `components/materials/FileUpload.tsx` with drag-and-drop functionality
    - Create `components/materials/MaterialsList.tsx` to display uploaded materials
    - Implement progress indicator for uploads
    - _Requirements: 7.4, 7.5_
  
  - [ ] 12.3 Integrate materials into Meeting detail page
    - Add materials section to `app/(dashboard)/meetings/[meetingId]/page.tsx`
    - Display uploaded materials with download links
    - Add file upload component for authorized users
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 12.4 Write integration tests for Meeting Materials API
    - Test file upload with valid file types
    - Test file size validation
    - Test file download
    - Test file deletion
    - Test notification creation on upload
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 10.4_

- [ ] 13. Implement Notifications API and UI
  - [ ] 13.1 Create Notifications API routes
    - Create `app/api/notifications/route.ts` with GET (list notifications) handler
    - Create `app/api/notifications/[id]/route.ts` with PATCH (mark as read) handler
    - Create `app/api/notifications/mark-all-read/route.ts` with POST handler
    - _Requirements: 10.5, 10.6_
  
  - [ ] 13.2 Create Notifications components
    - Create `components/notifications/NotificationList.tsx` to display notifications
    - Create `components/notifications/NotificationBell.tsx` for header notification icon with unread count
    - Implement click-to-navigate functionality for notifications
    - _Requirements: 10.5, 10.6_
  
  - [ ] 13.3 Create Notifications page
    - Create `app/(dashboard)/notifications/page.tsx` for notification center
    - Integrate with notifications store for real-time updates
    - _Requirements: 10.5_
  
  - [ ]* 13.4 Write integration tests for Notifications API
    - Test notification retrieval
    - Test marking notifications as read
    - Test marking all notifications as read
    - Test notification filtering by user
    - _Requirements: 10.5, 10.6_

- [ ] 14. Create layout and navigation components
  - [ ] 14.1 Create dashboard layout
    - Create `app/(dashboard)/layout.tsx` with authenticated layout wrapper
    - Create `components/layouts/DashboardLayout.tsx` with sidebar and header
    - Create `components/layouts/Sidebar.tsx` with role-based navigation links
    - Implement responsive design (hamburger menu on mobile)
    - _Requirements: 12.2, 12.3, 12.4_
  
  - [ ] 14.2 Create dashboard home page
    - Create `app/(dashboard)/page.tsx` with overview of recent activity
    - Display upcoming meetings, recent reports, unread notifications
    - _Requirements: 2.4, 3.1, 10.5_
  
  - [ ]* 14.3 Write component tests for layout components
    - Test sidebar navigation rendering based on user role
    - Test responsive behavior (mobile vs desktop)
    - Test notification bell display and unread count
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 15. Implement error handling and validation
  - [ ] 15.1 Create error handling utilities
    - Create `lib/errors/apiErrors.ts` with consistent error response format
    - Create `lib/errors/errorHandler.ts` with centralized error handling logic
    - Implement error logging for server-side errors
    - _Requirements: 11.4_
  
  - [ ] 15.2 Create validation schemas
    - Create Zod schemas for all API input validation (groups, meetings, reports, questions, tasks, materials)
    - Implement client-side form validation with React Hook Form
    - _Requirements: 3.1, 3.2, 7.3_
  
  - [ ] 15.3 Create error UI components
    - Create `components/errors/ErrorBoundary.tsx` for React error boundaries
    - Create `components/errors/ErrorMessage.tsx` for displaying error messages
    - Create `components/errors/Toast.tsx` for temporary success/error notifications
    - _Requirements: 11.4_
  
  - [ ]* 15.4 Write unit tests for validation schemas
    - Test Zod schemas with valid and invalid inputs
    - Test error message generation
    - _Requirements: 3.1, 3.2, 7.3_

- [ ] 16. Checkpoint - Verify complete feature integration
  - Test all CRUD operations across all entities
  - Verify notifications are created for all relevant events
  - Test file upload and download functionality
  - Verify error handling and validation work correctly
  - Ask the user if questions arise

- [ ] 17. Implement responsive design and styling
  - [ ] 17.1 Apply Tailwind CSS styling to all components
    - Style all cards with consistent padding, shadows, and borders
    - Apply color scheme (primary: blue-600, success: green-600, danger: red-600)
    - Implement loading states with skeleton screens
    - Implement empty states with helpful messages
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 17.2 Implement responsive breakpoints
    - Test and adjust layouts for mobile (< 640px)
    - Test and adjust layouts for tablet (640px - 1024px)
    - Test and adjust layouts for desktop (> 1024px)
    - _Requirements: 12.2, 12.3, 12.4_
  
  - [ ]* 17.3 Test responsive design manually
    - Test on mobile devices (iOS and Android)
    - Test on tablets
    - Test on desktop browsers (Chrome, Firefox, Safari)
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 18. Implement accessibility features
  - [ ] 18.1 Add semantic HTML and ARIA labels
    - Use semantic HTML elements (nav, main, article, aside)
    - Add ARIA labels to all interactive elements
    - Add alt text to all images
    - _Requirements: 12.4_
  
  - [ ] 18.2 Implement keyboard navigation
    - Add keyboard shortcuts for common actions
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - _Requirements: 12.4_
  
  - [ ]* 18.3 Test accessibility manually
    - Test with screen reader (NVDA or JAWS)
    - Test keyboard navigation
    - Verify color contrast ratios meet WCAG AA standards
    - _Requirements: 12.4_

- [ ] 19. Optimize performance
  - [ ] 19.1 Implement database query optimization
    - Add database indexes for frequently queried fields
    - Optimize N+1 queries with proper joins
    - Implement pagination for large lists
    - _Requirements: 11.3_
  
  - [ ] 19.2 Implement client-side optimizations
    - Add React.memo to prevent unnecessary re-renders
    - Implement code splitting for large pages
    - Optimize image loading with Next.js Image component
    - _Requirements: 12.5_
  
  - [ ]* 19.3 Test performance manually
    - Measure page load times (target: < 3 seconds)
    - Measure database query times (target: < 1 second)
    - Test with large datasets
    - _Requirements: 11.3, 12.5_

- [ ] 20. Final checkpoint and integration testing
  - [ ]* 20.1 Run complete end-to-end test suite
    - Test user authentication flows
    - Test complete CRUD workflows for all entities
    - Test permission-based access control
    - Test notification delivery
    - Test file upload and download
    - Test responsive design on different viewports
    - _Requirements: All_
  
  - [ ] 20.2 Final verification and cleanup
    - Ensure all tests pass
    - Remove console.log statements and debug code
    - Verify all environment variables are documented
    - Ensure all API endpoints are documented
    - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a layered approach: infrastructure → authentication → core features → integration → polish
- All code examples and implementations use TypeScript as specified in the design document
- Testing focuses on unit tests and integration tests; property-based testing is not applicable for this CRUD application
