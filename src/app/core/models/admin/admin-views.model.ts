export type AdminUserRole = 'STUDENT' | 'CREATOR' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AdminUserListItem {
  id: number;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  registeredAt: string;
}

export interface AdminUsersListData {
  totalUsers: number;
  users: AdminUserListItem[];
}

export interface AdminUserActivitySummary {
  lastLoginAt: string;
  recentActions: string[];
}

export interface AdminUserProfileData {
  id: number;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  registeredAt: string;
  country: string;
  acquiredCourses: number;
  publishedCourses?: number;
  totalRevenueUsd?: number;
  activity: AdminUserActivitySummary;
}

export interface AdminUserActivityItem {
  id: number;
  userId: number;
  fullName: string;
  actionType: string;
  device: string;
  ipAddress: string;
  createdAt: string;
}

export interface AdminUserActivityData {
  totalEvents: number;
  events: AdminUserActivityItem[];
}

export interface AdminUserSanctionItem {
  id: number;
  fullName: string;
  action: 'SUSPENDED' | 'BANNED' | 'RESTORED';
  reason: string;
  appliedBy: string;
  appliedAt: string;
  expiresAt?: string;
}

export interface AdminUserSanctionsData {
  totalActions: number;
  sanctions: AdminUserSanctionItem[];
}

export interface AdminUserRoleChangeItem {
  id: number;
  fullName: string;
  previousRole: AdminUserRole;
  newRole: AdminUserRole;
  changedBy: string;
  changedAt: string;
}

export interface AdminUserRolesData {
  totalChanges: number;
  changes: AdminUserRoleChangeItem[];
}

export type AdminCourseStatus = 'PUBLISHED' | 'HIDDEN';

export interface AdminPublishedCourseItem {
  id: number;
  title: string;
  creatorName: string;
  category: string;
  rating: number;
  studentsCount: number;
  publishedAt: string;
  status: AdminCourseStatus;
}

export interface AdminPublishedCoursesData {
  totalCourses: number;
  courses: AdminPublishedCourseItem[];
}

export interface AdminCourseStructureSummary {
  modules: number;
  lessons: number;
  resources: number;
}

export interface AdminCourseDetailData {
  id: number;
  title: string;
  creatorName: string;
  category: string;
  price: number;
  status: AdminCourseStatus;
  rating: number;
  studentsCount: number;
  reportsCount: number;
  publishedAt: string;
  structure: AdminCourseStructureSummary;
}

export type AdminReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type AdminReportStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED';

export interface AdminModerationReportItem {
  id: number;
  courseId: number;
  courseTitle: string;
  reason: string;
  reportedBy: string;
  severity: AdminReportSeverity;
  status: AdminReportStatus;
  createdAt: string;
}

export interface AdminModerationReportsData {
  totalReports: number;
  reports: AdminModerationReportItem[];
}

export interface AdminPendingCourseItem {
  id: number;
  title: string;
  creatorName: string;
  category: string;
  submittedAt: string;
  waitingHours: number;
}

export interface AdminPendingCoursesData {
  totalPendingCourses: number;
  courses: AdminPendingCourseItem[];
}

export type AdminApprovalDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export interface AdminApprovalChecklist {
  contentQuality: boolean;
  mediaReady: boolean;
  pricingValid: boolean;
  policyCompliance: boolean;
}

export interface AdminApprovalCourseItem {
  id: number;
  title: string;
  creatorName: string;
  category: string;
  submittedAt: string;
  waitingHours: number;
  checklist: AdminApprovalChecklist;
  suggestedDecision: AdminApprovalDecision;
  adminNote: string;
}

export interface AdminApprovalQueueData {
  totalCourses: number;
  courses: AdminApprovalCourseItem[];
}

export type AdminDeleteRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AdminDeleteCourseItem {
  id: number;
  title: string;
  creatorName: string;
  reasonCategory: string;
  riskLevel: AdminDeleteRiskLevel;
  affectedStudents: number;
  activeTransactions: number;
  estimatedRefundAmount: number;
  reportedAt: string;
}

export interface AdminDeleteQueueData {
  totalCourses: number;
  courses: AdminDeleteCourseItem[];
}

export interface AdminSystemMonitoringMetric {
  name: string;
  value: number;
  unit: '%' | 'ms' | 'req/min' | 'users' | 'nodes';
  trend: 'UP' | 'DOWN' | 'STABLE';
  thresholdExceeded: boolean;
}

export interface AdminSystemAlertItem {
  id: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  startedAt: string;
}

export interface AdminSystemMonitoringData {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  metrics: AdminSystemMonitoringMetric[];
  alerts: AdminSystemAlertItem[];
  updatedAt: string;
}

export interface AdminSystemErrorItem {
  id: number;
  code: string;
  module: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface AdminSystemErrorsData {
  totalErrors: number;
  errors: AdminSystemErrorItem[];
}

export interface AdminBackupItem {
  id: number;
  type: 'FULL' | 'INCREMENTAL';
  storage: 'LOCAL' | 'CLOUD' | 'HYBRID';
  sizeGb: number;
  integrity: 'VALID' | 'INVALID';
  createdAt: string;
}

export interface AdminRecoveryEventItem {
  id: number;
  backupId: number;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  startedAt: string;
  finishedAt?: string;
}

export interface AdminSystemBackupsData {
  totalBackups: number;
  backups: AdminBackupItem[];
  recoveryEvents: AdminRecoveryEventItem[];
}

export interface AdminLayoutConfigData {
  shellVariant: 'compact' | 'comfortable';
  primaryColor: string;
  secondaryColor: string;
  showSystemTab: boolean;
  enableQuickStats: boolean;
  updatedAt: string;
}
