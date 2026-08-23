# Graph Report - .  (2026-06-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 698 nodes · 1752 edges · 49 communities (35 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_User Profile and Settings|User Profile and Settings]]
- [[_COMMUNITY_Student and Forum Management|Student and Forum Management]]
- [[_COMMUNITY_External Library Dependencies|External Library Dependencies]]
- [[_COMMUNITY_Layout and Sidebar Navigation|Layout and Sidebar Navigation]]
- [[_COMMUNITY_Admin Authentication and Actions|Admin Authentication and Actions]]
- [[_COMMUNITY_Admin Dashboard Components|Admin Dashboard Components]]
- [[_COMMUNITY_Global App Configuration|Global App Configuration]]
- [[_COMMUNITY_LMS Enrollment Services|LMS Enrollment Services]]
- [[_COMMUNITY_Agora Virtual Classroom|Agora Virtual Classroom]]
- [[_COMMUNITY_Classroom UI Utilities|Classroom UI Utilities]]
- [[_COMMUNITY_Landing Page Components|Landing Page Components]]
- [[_COMMUNITY_Progress and Feature Carousels|Progress and Feature Carousels]]
- [[_COMMUNITY_Project Build Dependencies|Project Build Dependencies]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_UI Framework Configuration|UI Framework Configuration]]
- [[_COMMUNITY_Data Visualization Charts|Data Visualization Charts]]
- [[_COMMUNITY_Menubar Navigation Components|Menubar Navigation Components]]
- [[_COMMUNITY_Core Data Types|Core Data Types]]
- [[_COMMUNITY_Common UI Components|Common UI Components]]
- [[_COMMUNITY_Form Input Components|Form Input Components]]
- [[_COMMUNITY_Sheet and Overlay Components|Sheet and Overlay Components]]
- [[_COMMUNITY_Project and IDE Settings|Project and IDE Settings]]
- [[_COMMUNITY_Community Forum Pages|Community Forum Pages]]
- [[_COMMUNITY_Policy and Data API|Policy and Data API]]
- [[_COMMUNITY_Authentication Middleware|Authentication Middleware]]
- [[_COMMUNITY_AI Tutor Integration|AI Tutor Integration]]
- [[_COMMUNITY_Real-time Communication Infrastructure|Real-time Communication Infrastructure]]
- [[_COMMUNITY_Database Column Fetching|Database Column Fetching]]
- [[_COMMUNITY_Profile Data Fetching|Profile Data Fetching]]
- [[_COMMUNITY_Image Placeholder Assets|Image Placeholder Assets]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Classroom Debugging Tools|Classroom Debugging Tools]]
- [[_COMMUNITY_Schema Debugging Utilities|Schema Debugging Utilities]]
- [[_COMMUNITY_Schema Key Utilities|Schema Key Utilities]]
- [[_COMMUNITY_HTTP Request Client|HTTP Request Client]]
- [[_COMMUNITY_Database Integration Testing|Database Integration Testing]]
- [[_COMMUNITY_Brand Logo Assets (PNG)|Brand Logo Assets (PNG)]]
- [[_COMMUNITY_Brand Logo Assets (JPG)|Brand Logo Assets (JPG)]]
- [[_COMMUNITY_Application Icons|Application Icons]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 58 edges
2. `Button` - 47 edges
3. `Card` - 43 edges
4. `CardContent` - 42 edges
5. `createClient()` - 41 edges
6. `CardHeader` - 36 edges
7. `useUser()` - 35 edges
8. `CardTitle` - 34 edges
9. `Avatar` - 25 edges
10. `AvatarImage` - 25 edges

## Surprising Connections (you probably didn't know these)
- `AI Study Buddy` --semantically_similar_to--> `AI Tutor Assistant`  [INFERRED] [semantically similar]
  README.md → docs/blueprint.md
- `DELETE()` --calls--> `fetch`  [INFERRED]
  src/app/api/agora/convo-ai/route.ts → check_policies.js
- `POST()` --calls--> `fetch`  [INFERRED]
  src/app/api/agora/convo-ai/route.ts → check_policies.js
- `Application Execution Rules` --conceptually_related_to--> `LearnetIQ README`  [INFERRED]
  RULES.md → README.md
- `PostPage()` --calls--> `useUser()`  [EXTRACTED]
  src/app/student/community/[communityId]/[postId]/page.tsx → src/components/providers/user-context.tsx

## Import Cycles
- None detected.

## Communities (49 total, 14 thin omitted)

### Community 0 - "User Profile and Settings"
Cohesion: 0.09
Nodes (22): Role, roles, plans, LiveClassDetail, Post, calendarLegend, Course, chartConfig (+14 more)

### Community 1 - "Student and Forum Management"
Cohesion: 0.08
Nodes (33): Student, AssignmentList(), { createClient }, supabase, JoinClassButtonProps, ForumComment, EditRecordingDialog(), PostPage() (+25 more)

### Community 2 - "External Library Dependencies"
Cohesion: 0.04
Nodes (55): dependencies, agora-access-token, agora-chat, agora-rtc-react, agora-rtc-sdk-ng, agora-rtm-sdk, class-variance-authority, clsx (+47 more)

### Community 3 - "Layout and Sidebar Navigation"
Cohesion: 0.09
Nodes (35): useIsMobile(), navItems, navItems, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem (+27 more)

### Community 4 - "Admin Authentication and Actions"
Cohesion: 0.05
Nodes (42): AdminDashboardPage(), AdminList(), login(), signOut(), signup(), updatePassword(), Action, ActionType (+34 more)

### Community 5 - "Admin Dashboard Components"
Cohesion: 0.14
Nodes (21): StatCardProps, SchoolHeader(), statusColorMap, statusVariantMap, testimonials, statusVariantMap, tutors, Avatar (+13 more)

### Community 6 - "Global App Configuration"
Cohesion: 0.07
Nodes (24): inter, metadata, spaceGrotesk, TutorAssignmentsPage(), LiveClassDetailPage(), CommunityPostsPage(), statusColorMap, TutorCoursesPage() (+16 more)

### Community 7 - "LMS Enrollment Services"
Cohesion: 0.09
Nodes (21): enrollInSubject(), getMyEnrollments(), getPendingEnrollments(), getSubjects(), updateEnrollmentStatus(), getStudentResources(), CoursesPage(), AdminEnrollmentsPage() (+13 more)

### Community 8 - "Agora Virtual Classroom"
Cohesion: 0.11
Nodes (18): AgoraClassroomProps, AgoraWhiteboard, ClassroomInner(), ControlButton(), SidebarIcon(), UserProfile, ChatMessage, useChat() (+10 more)

### Community 9 - "Classroom UI Utilities"
Cohesion: 0.13
Nodes (13): ChatMessage(), LobbyScreen(), AgoraWhiteboard(), AgoraWhiteboardProps, cn(), navItems, DropdownMenuShortcut(), PopoverContent (+5 more)

### Community 10 - "Landing Page Components"
Cohesion: 0.12
Nodes (5): filterOptions, resourceIcons, AccordionContent, AccordionItem, AccordionTrigger

### Community 11 - "Progress and Feature Carousels"
Cohesion: 0.14
Nodes (15): DetailedProgressCard(), Topic, features, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem (+7 more)

### Community 12 - "Project Build Dependencies"
Cohesion: 0.10
Nodes (19): devDependencies, firebase-tools, genkit-cli, postcss, tailwindcss, @types/node, @types/react, typescript (+11 more)

### Community 13 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "UI Framework Configuration"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 15 - "Data Visualization Charts"
Cohesion: 0.13
Nodes (12): areaChartConfig, barChartConfig, chartData, passRateData, stats, ChartConfig, ChartContainer, ChartContext (+4 more)

### Community 16 - "Menubar Navigation Components"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 17 - "Core Data Types"
Cohesion: 0.15
Nodes (12): Comment, Community, Course, Lesson, LiveClass, Post, Resource, ResourceSubject (+4 more)

### Community 18 - "Common UI Components"
Cohesion: 0.20
Nodes (9): ButtonProps, buttonVariants, Calendar(), CalendarProps, PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLinkProps (+1 more)

### Community 19 - "Form Input Components"
Cohesion: 0.18
Nodes (8): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormLabel, FormMessage

### Community 20 - "Sheet and Overlay Components"
Cohesion: 0.22
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 21 - "Project and IDE Settings"
Cohesion: 0.29
Nodes (7): src/app/layout.tsx:::Temp, piny.project_settings, component-settings, open-pages, urls, route, pinyfakepage.html

### Community 22 - "Community Forum Pages"
Cohesion: 0.29
Nodes (4): Community, mockCommunities, mockPosts, Post

### Community 23 - "Policy and Data API"
Cohesion: 0.50
Nodes (3): fetch, DELETE(), POST()

### Community 26 - "Real-time Communication Infrastructure"
Cohesion: 0.67
Nodes (3): Firebase, Virtual Classrooms, WebRTC

## Knowledge Gaps
- **272 isolated node(s):** `route`, `{ createClient }`, `$schema`, `style`, `rsc` (+267 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `External Library Dependencies` to `Student and Forum Management`, `Project Build Dependencies`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `supabase` connect `Student and Forum Management` to `External Library Dependencies`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Student and Forum Management` to `User Profile and Settings`, `Layout and Sidebar Navigation`, `Admin Authentication and Actions`, `Admin Dashboard Components`, `Global App Configuration`, `Agora Virtual Classroom`, `Landing Page Components`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `route`, `{ createClient }`, `$schema` to the rest of the system?**
  _272 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Profile and Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.08637747336377473 - nodes in this community are weakly interconnected._
- **Should `Student and Forum Management` be split into smaller, more focused modules?**
  _Cohesion score 0.08065458796025717 - nodes in this community are weakly interconnected._
- **Should `External Library Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03636363636363636 - nodes in this community are weakly interconnected._