# TSX to JSX Conversion Plan

## Configuration Files (Step 1)
- [ ] tsconfig.app.json - Update jsx setting
- [ ] vite.config.ts - Update for .jsx

## Core Files (Step 2)
- [ ] src/main.tsx → main.jsx
- [ ] src/App.tsx → App.jsx
- [ ] index.html - Update script reference

## Hooks (Step 3)
- [ ] src/hooks/useAuth.tsx
- [ ] src/hooks/use-mobile.tsx
- [ ] src/hooks/use-toast.ts

## Components - Layout (Step 4)
- [ ] src/components/layout/DashboardLayout.tsx
- [ ] src/components/layout/Navbar.tsx
- [ ] src/components/layout/Sidebar.tsx

## Components - Shared (Step 5)
- [ ] src/components/shared/AlertBanner.tsx
- [ ] src/components/shared/StatsCard.tsx
- [ ] src/components/shared/StatusBadge.tsx
- [ ] src/components/NavLink.tsx

## Components - UI (Step 6) - 50+ files
- [ ] All files in src/components/ui/

## Pages (Step 7)
- [ ] src/pages/Index.tsx
- [ ] src/pages/Login.tsx
- [ ] src/pages/NotFound.tsx
- [ ] src/pages/admin/AdminDashboard.tsx
- [ ] src/pages/doctor/AIInsights.tsx
- [ ] src/pages/doctor/ConsultationHistory.tsx
- [ ] src/pages/doctor/DoctorDashboard.tsx
- [ ] src/pages/doctor/NewConsultation.tsx
- [ ] src/pages/patient/MedicineInfo.tsx
- [ ] src/pages/patient/PatientDashboard.tsx

## Test Files (Step 8)
- [ ] src/test/example.test.ts
- [ ] src/test/setup.ts
