import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { DashboardOverview } from './components/dashboard/DashboardOverview.jsx';
import { ProjectsList } from './components/projects/ProjectsList.jsx';
import { ProjectDetails } from './components/projects/ProjectDetails.jsx';
import { ProjectFormModal } from './components/projects/ProjectFormModal.jsx';
import { ArchiveConfirmModal } from './components/projects/ArchiveConfirmModal.jsx';
import { EmployeesList } from './components/employees/EmployeesList.jsx';
import { EmployeeFormModal } from './components/employees/EmployeeFormModal.jsx';
import { ArchiveEmployeeModal } from './components/employees/ArchiveEmployeeModal.jsx';
import { DailyWagesList } from './components/wages/DailyWagesList.jsx';
import { DailyWageFormModal } from './components/wages/DailyWageFormModal.jsx';
import { DeleteWageModal } from './components/wages/DeleteWageModal.jsx';
import { DailyExpensesList } from './components/expenses/DailyExpensesList.jsx';
import { ExpenseFormModal } from './components/expenses/ExpenseFormModal.jsx';
import { DeleteExpenseModal } from './components/expenses/DeleteExpenseModal.jsx';
import { DailyMaterialsList } from './components/materials/DailyMaterialsList.jsx';
import { MaterialFormModal } from './components/materials/MaterialFormModal.jsx';
import { DeleteMaterialModal } from './components/materials/DeleteMaterialModal.jsx';
import { SettingsView } from './components/settings/SettingsView.jsx';
import { SubAdminFormModal } from './components/settings/SubAdminFormModal.jsx';
import { DeleteSubAdminModal } from './components/settings/DeleteSubAdminModal.jsx';
import { LoginModal } from './components/auth/LoginModal.jsx';
import { PasswordResetModal } from './components/auth/PasswordResetModal.jsx';
import { UpcomingModule } from './components/common/UpcomingModule.jsx';
import { NotificationToast } from './components/common/NotificationToast.jsx';
import { 
  subscribeToProjects, 
  createProject, 
  updateProject, 
  toggleArchiveProject,
  seedSampleProjectsIfEmpty,
  getNextProjectId
} from './firebase/projectService.js';
import {
  subscribeToEmployees,
  createEmployee,
  updateEmployee,
  toggleArchiveEmployee,
  seedSampleEmployeesIfEmpty
} from './firebase/employeeService.js';
import {
  subscribeToDailyWages,
  createDailyWage,
  updateDailyWage,
  deleteDailyWage,
  settleDailyWage,
  seedSampleDailyWagesIfEmpty
} from './firebase/wageService.js';
import {
  subscribeToExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  seedSampleExpensesIfEmpty,
  getNextExpenseId
} from './firebase/expenseService.js';
import {
  subscribeToMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  seedSampleMaterialsIfEmpty,
  getNextMaterialId
} from './firebase/materialService.js';
import {
  subscribeToSystemUsers,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin
} from './firebase/userService.js';
import { Loader2, HardHat } from 'lucide-react';
import { PWAUpdatePrompt } from './components/pwa/PWAUpdatePrompt.jsx';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.jsx';

function ConstructionApp() {
  const { 
    currentUser, 
    isSuperAdmin,
    canEditModule,
    canViewModule,
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    isPasswordResetModalOpen, 
    setIsPasswordResetModalOpen 
  } = useAuth();

  const [currentSection, setCurrentSection] = useState('dashboard');
  
  // Projects State
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [nextSuggestedProjectId, setNextSuggestedProjectId] = useState('PRJ-101');
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [archiveTargetProject, setArchiveTargetProject] = useState(null);
  const [isArchiveProjectModalOpen, setIsArchiveProjectModalOpen] = useState(false);
  const [isSeedingProjects, setIsSeedingProjects] = useState(false);

  // Employees State
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [nextSuggestedEmployeeId, setNextSuggestedEmployeeId] = useState('EMP-101');
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [archiveTargetEmployee, setArchiveTargetEmployee] = useState(null);
  const [isArchiveEmployeeModalOpen, setIsArchiveEmployeeModalOpen] = useState(false);
  const [isSeedingEmployees, setIsSeedingEmployees] = useState(false);

  // Daily Wages State
  const [wages, setWages] = useState([]);
  const [isLoadingWages, setIsLoadingWages] = useState(true);
  const [nextSuggestedWageId, setNextSuggestedWageId] = useState('WAG-101');
  const [isWageFormOpen, setIsWageFormOpen] = useState(false);
  const [editingWage, setEditingWage] = useState(null);
  const [deleteTargetWage, setDeleteTargetWage] = useState(null);
  const [isDeleteWageModalOpen, setIsDeleteWageModalOpen] = useState(false);
  const [isSeedingWages, setIsSeedingWages] = useState(false);

  // Daily Expenses State (Phase 3)
  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [nextSuggestedExpenseId, setNextSuggestedExpenseId] = useState('EXP-101');
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTargetExpense, setDeleteTargetExpense] = useState(null);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [isSeedingExpenses, setIsSeedingExpenses] = useState(false);

  // Materials State (Phase 5)
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [nextSuggestedMaterialId, setNextSuggestedMaterialId] = useState('MAT-101');
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteTargetMaterial, setDeleteTargetMaterial] = useState(null);
  const [isDeleteMaterialModalOpen, setIsDeleteMaterialModalOpen] = useState(false);
  const [isSeedingMaterials, setIsSeedingMaterials] = useState(false);

  // Settings & System Users State (Phase 8)
  const [systemUsers, setSystemUsers] = useState([]);
  const [isSubAdminModalOpen, setIsSubAdminModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [deleteTargetSubAdmin, setDeleteTargetSubAdmin] = useState(null);
  const [isDeleteSubAdminModalOpen, setIsDeleteSubAdminModalOpen] = useState(false);

  // Notification Toast State
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success', title = '') => {
    setNotification({ message, type, title });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Subscribe to live Firestore projects collection
  useEffect(() => {
    setIsLoadingProjects(true);
    const unsubscribe = subscribeToProjects(
      (liveProjects) => {
        setProjects(liveProjects);
        setIsLoadingProjects(false);

        if (selectedProject) {
          const updated = liveProjects.find((p) => p.projectId === selectedProject.projectId);
          if (updated) setSelectedProject(updated);
        }
      },
      (error) => {
        console.error('Firestore projects error:', error);
        setIsLoadingProjects(false);
        showToast('Firestore connection error. Verify network.', 'error', 'Database Sync');
      }
    );

    return () => unsubscribe();
  }, [selectedProject?.projectId]);

  // Subscribe to live Firestore employees collection
  useEffect(() => {
    setIsLoadingEmployees(true);
    const unsubscribe = subscribeToEmployees(
      (liveEmployees) => {
        setEmployees(liveEmployees);
        setIsLoadingEmployees(false);
      },
      (error) => {
        console.error('Firestore employees error:', error);
        setIsLoadingEmployees(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to live Firestore dailyWages collection
  useEffect(() => {
    setIsLoadingWages(true);
    const unsubscribe = subscribeToDailyWages(
      (liveWages) => {
        setWages(liveWages);
        setIsLoadingWages(false);
      },
      (error) => {
        console.error('Firestore daily wages error:', error);
        setIsLoadingWages(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to live Firestore dailyExpenses collection (Phase 3)
  useEffect(() => {
    setIsLoadingExpenses(true);
    const unsubscribe = subscribeToExpenses(
      (liveExpenses) => {
        setExpenses(liveExpenses);
        setIsLoadingExpenses(false);
      },
      (error) => {
        console.error('Firestore daily expenses error:', error);
        setIsLoadingExpenses(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to live Firestore materials collection (Phase 5)
  useEffect(() => {
    setIsLoadingMaterials(true);
    const unsubscribe = subscribeToMaterials(
      (liveMaterials) => {
        setMaterials(liveMaterials);
        setIsLoadingMaterials(false);
      },
      (error) => {
        console.error('Firestore materials error:', error);
        setIsLoadingMaterials(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to live Firestore systemUsers collection (Phase 8 Settings)
  useEffect(() => {
    const unsubscribe = subscribeToSystemUsers(
      (users) => {
        setSystemUsers(users);
      },
      (error) => {
        console.error('System users subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- Project Handlers ---
  const handleOpenAddProjectModal = async () => {
    setEditingProject(null);
    try {
      const existingSeqs = projects
        .map((p) => {
          const match = p.projectId?.match(/^PRJ-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n >= 100);

      const maxSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 100;
      setNextSuggestedProjectId(`PRJ-${maxSeq + 1}`);
    } catch {
      setNextSuggestedProjectId('PRJ-101');
    }
    setIsProjectFormOpen(true);
  };

  const handleOpenEditProjectModal = (project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleOpenArchiveProjectModal = (project) => {
    setArchiveTargetProject(project);
    setIsArchiveProjectModalOpen(true);
  };

  const handleSaveProject = async (formData, docId) => {
    try {
      if (docId) {
        await updateProject(docId, formData, currentUser);
        showToast(`Project ${formData.projectId} updated successfully!`, 'success', 'Project Updated');
      } else {
        const newProj = await createProject(formData, currentUser);
        showToast(`Project ${newProj.projectId} registered successfully!`, 'success', 'Project Created');
      }
      setIsProjectFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      showToast(error.message || 'Error writing to Firestore', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmArchiveProjectToggle = async () => {
    if (!archiveTargetProject) return;
    try {
      const willArchive = !archiveTargetProject.isArchived;
      await toggleArchiveProject(
        archiveTargetProject.id || archiveTargetProject.projectId,
        willArchive,
        currentUser
      );
      showToast(
        `Project ${archiveTargetProject.projectId} ${willArchive ? 'archived safely' : 'restored to active'}.`,
        'success',
        willArchive ? 'Project Archived' : 'Project Restored'
      );
      setIsArchiveProjectModalOpen(false);
      setArchiveTargetProject(null);
    } catch (error) {
      console.error('Archive toggle error:', error);
      showToast('Failed to update project archive status.', 'error', 'Operation Failed');
    }
  };

  const handleSeedKeralaProjects = async () => {
    setIsSeedingProjects(true);
    try {
      const seeded = await seedSampleProjectsIfEmpty(currentUser);
      if (seeded) {
        showToast('Sample Kerala roadwork projects loaded into live Firestore!', 'success', 'Data Seeded');
      } else {
        showToast('Live projects already exist in the database.', 'info', 'Database Notice');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      showToast('Error seeding sample projects.', 'error', 'Database Error');
    } finally {
      setIsSeedingProjects(false);
    }
  };

  // --- Employee Handlers ---
  const handleOpenAddEmployeeModal = async () => {
    setEditingEmployee(null);
    try {
      const existingSeqs = employees
        .map((e) => {
          const match = e.employeeId?.match(/^EMP-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n >= 100);

      const maxSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 100;
      setNextSuggestedEmployeeId(`EMP-${maxSeq + 1}`);
    } catch {
      setNextSuggestedEmployeeId('EMP-101');
    }
    setIsEmployeeFormOpen(true);
  };

  const handleOpenEditEmployeeModal = (emp) => {
    setEditingEmployee(emp);
    setIsEmployeeFormOpen(true);
  };

  const handleOpenArchiveEmployeeModal = (emp) => {
    setArchiveTargetEmployee(emp);
    setIsArchiveEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (formData, docId) => {
    try {
      if (docId) {
        await updateEmployee(docId, formData, currentUser);
        showToast(`Employee ${formData.employeeId} - ${formData.name} updated!`, 'success', 'Employee Updated');
      } else {
        const newEmp = await createEmployee(formData, currentUser);
        showToast(`Employee ${newEmp.employeeId} - ${newEmp.name} registered!`, 'success', 'Employee Registered');
      }
      setIsEmployeeFormOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to save employee:', error);
      showToast(error.message || 'Error writing to Firestore', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmArchiveEmployeeToggle = async () => {
    if (!archiveTargetEmployee) return;
    try {
      const willArchive = !archiveTargetEmployee.isArchived;
      await toggleArchiveEmployee(
        archiveTargetEmployee.id || archiveTargetEmployee.employeeId,
        willArchive,
        currentUser
      );
      showToast(
        `Employee ${archiveTargetEmployee.employeeId} ${willArchive ? 'archived safely' : 'restored to active'}.`,
        'success',
        willArchive ? 'Employee Archived' : 'Employee Restored'
      );
      setIsArchiveEmployeeModalOpen(false);
      setArchiveTargetEmployee(null);
    } catch (error) {
      console.error('Archive toggle error:', error);
      showToast('Failed to update employee archive status.', 'error', 'Operation Failed');
    }
  };

  const handleSeedEmployees = async () => {
    setIsSeedingEmployees(true);
    try {
      const seeded = await seedSampleEmployeesIfEmpty(currentUser);
      if (seeded) {
        showToast('Sample Kerala construction workforce loaded into Firestore!', 'success', 'Employees Seeded');
      } else {
        showToast('Staff records already exist in the database.', 'info', 'Database Notice');
      }
    } catch (error) {
      console.error('Seeding employees error:', error);
      showToast('Error seeding employee records.', 'error', 'Database Error');
    } finally {
      setIsSeedingEmployees(false);
    }
  };

  // --- Daily Wage Handlers ---
  const handleOpenAddWageModal = async () => {
    setEditingWage(null);
    try {
      const existingSeqs = wages
        .map((w) => {
          const match = w.wageId?.match(/^WAG-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n >= 100);

      const maxSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 100;
      setNextSuggestedWageId(`WAG-${maxSeq + 1}`);
    } catch {
      setNextSuggestedWageId('WAG-101');
    }
    setIsWageFormOpen(true);
  };

  const handleOpenEditWageModal = (wage) => {
    setEditingWage(wage);
    setIsWageFormOpen(true);
  };

  const handleOpenDeleteWageModal = (wage) => {
    setDeleteTargetWage(wage);
    setIsDeleteWageModalOpen(true);
  };

  const handleSaveWage = async (formData, docId) => {
    try {
      if (docId) {
        await updateDailyWage(docId, formData, currentUser);
        showToast(`Wage entry ${formData.wageId} updated!`, 'success', 'Wage Updated');
      } else {
        const newWage = await createDailyWage(formData, currentUser);
        showToast(`Wage entry ${newWage.wageId} for ${formData.employeeName} recorded!`, 'success', 'Wage Recorded');
      }
      setIsWageFormOpen(false);
      setEditingWage(null);
    } catch (error) {
      console.error('Failed to save wage entry:', error);
      showToast(error.message || 'Error writing to Firestore', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmDeleteWage = async () => {
    if (!deleteTargetWage) return;
    try {
      await deleteDailyWage(deleteTargetWage.id || deleteTargetWage.wageId);
      showToast(`Wage entry ${deleteTargetWage.wageId} deleted.`, 'info', 'Entry Removed');
      setIsDeleteWageModalOpen(false);
      setDeleteTargetWage(null);
    } catch (error) {
      console.error('Delete wage entry error:', error);
      showToast('Failed to delete wage record.', 'error', 'Operation Failed');
    }
  };

  const handleSettleWage = async (wage) => {
    try {
      await settleDailyWage(wage.id || wage.wageId, currentUser);
      showToast(`Wage entry ${wage.wageId} marked as fully Paid! Employee ledger updated.`, 'success', 'Wage Settled');
    } catch (error) {
      console.error('Failed to settle wage:', error);
      showToast('Error settling wage entry.', 'error', 'Operation Failed');
    }
  };

  const handleSeedDailyWages = async () => {
    setIsSeedingWages(true);
    try {
      const seeded = await seedSampleDailyWagesIfEmpty(employees, projects, currentUser);
      if (seeded) {
        showToast('Sample daily muster roll loaded (including absent + advance scenario)!', 'success', 'Wages Seeded');
      } else {
        showToast('Daily wage entries already exist in the database.', 'info', 'Database Notice');
      }
    } catch (error) {
      console.error('Seeding wages error:', error);
      showToast('Error seeding wage entries.', 'error', 'Database Error');
    } finally {
      setIsSeedingWages(false);
    }
  };

  // --- Daily Expenses Handlers (Phase 3) ---
  const handleOpenAddExpenseModal = async () => {
    setEditingExpense(null);
    try {
      const existingSeqs = expenses
        .map((e) => {
          const match = e.expenseId?.match(/^EXP-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n >= 100);

      const maxSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 100;
      setNextSuggestedExpenseId(`EXP-${maxSeq + 1}`);
    } catch {
      setNextSuggestedExpenseId('EXP-101');
    }
    setIsExpenseFormOpen(true);
  };

  const handleOpenEditExpenseModal = (expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleOpenDeleteExpenseModal = (expense) => {
    setDeleteTargetExpense(expense);
    setIsDeleteExpenseModalOpen(true);
  };

  const handleSaveExpense = async (formData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id || editingExpense.expenseId, formData, currentUser);
        showToast(`Expense ${formData.expenseId} updated successfully!`, 'success', 'Expense Updated');
      } else {
        const newId = await createExpense(formData, currentUser);
        showToast(`Expense ${newId} recorded successfully!`, 'success', 'Expense Created');
      }
      setIsExpenseFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Save expense error:', error);
      showToast(error.message || 'Error recording expense in database', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmDeleteExpense = async (expenseEntry) => {
    if (!expenseEntry) return;
    try {
      await deleteExpense(expenseEntry.id || expenseEntry.expenseId);
      showToast(`Expense ${expenseEntry.expenseId} deleted successfully.`, 'info', 'Expense Removed');
      setIsDeleteExpenseModalOpen(false);
      setDeleteTargetExpense(null);
    } catch (error) {
      console.error('Delete expense error:', error);
      showToast('Failed to delete expense record.', 'error', 'Operation Failed');
    }
  };

  const handleSeedDailyExpenses = async () => {
    setIsSeedingExpenses(true);
    try {
      const count = await seedSampleExpensesIfEmpty(projects, currentUser);
      if (count > 0) {
        showToast(`Loaded ${count} realistic Kerala site expenses (Fuel, Materials, Food, Vehicles)!`, 'success', 'Expenses Seeded');
      } else {
        showToast('Daily expenses already exist in the database.', 'info', 'Database Notice');
      }
    } catch (error) {
      console.error('Seeding expenses error:', error);
      showToast('Error seeding sample expenses.', 'error', 'Database Error');
    } finally {
      setIsSeedingExpenses(false);
    }
  };

  // --- Materials Handlers (Phase 5) ---
  const handleOpenAddMaterialModal = async () => {
    setEditingMaterial(null);
    try {
      const nextId = await getNextMaterialId();
      setNextSuggestedMaterialId(nextId);
    } catch {
      setNextSuggestedMaterialId('MAT-101');
    }
    setIsMaterialFormOpen(true);
  };

  const handleOpenEditMaterialModal = (material) => {
    setEditingMaterial(material);
    setIsMaterialFormOpen(true);
  };

  const handleOpenDeleteMaterialModal = (material) => {
    setDeleteTargetMaterial(material);
    setIsDeleteMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (formData) => {
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.materialId || editingMaterial.id, formData);
        showToast(`Material entry ${editingMaterial.materialId} updated successfully!`, 'success', 'Material Updated');
      } else {
        const newRecord = await createMaterial(formData, currentUser);
        showToast(`Material entry ${newRecord.materialId} recorded successfully!`, 'success', 'Material Inflow Created');
      }
      setIsMaterialFormOpen(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Save material error:', error);
      showToast(error.message || 'Error recording material entry in database', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmDeleteMaterial = async (materialId) => {
    try {
      await deleteMaterial(materialId);
      showToast(`Material record ${materialId} deleted successfully.`, 'info', 'Material Removed');
      setIsDeleteMaterialModalOpen(false);
      setDeleteTargetMaterial(null);
    } catch (error) {
      console.error('Delete material error:', error);
      showToast('Failed to delete material record.', 'error', 'Operation Failed');
    }
  };

  const handleSeedMaterials = async () => {
    setIsSeedingMaterials(true);
    try {
      const res = await seedSampleMaterialsIfEmpty(projects);
      if (res.seeded) {
        showToast(`Loaded ${res.count} realistic Kerala road material supplies (Bitumen, M-Sand, Aggregates, Cement)!`, 'success', 'Materials Seeded');
      } else {
        showToast('Materials inventory already contains entries.', 'info', 'Database Notice');
      }
    } catch (error) {
      console.error('Seeding materials error:', error);
      showToast('Error seeding sample materials.', 'error', 'Database Error');
    } finally {
      setIsSeedingMaterials(false);
    }
  };

  // --- Sub-Admin & Settings Handlers (Phase 8) ---
  const handleOpenAddSubAdmin = () => {
    setEditingSubAdmin(null);
    setIsSubAdminModalOpen(true);
  };

  const handleOpenEditSubAdmin = (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    setIsSubAdminModalOpen(true);
  };

  const handleOpenDeleteSubAdmin = (subAdmin) => {
    setDeleteTargetSubAdmin(subAdmin);
    setIsDeleteSubAdminModalOpen(true);
  };

  const handleSaveSubAdmin = async (formData, userId) => {
    try {
      if (userId) {
        await updateSubAdmin(userId, formData);
        showToast(`Sub-admin account for ${formData.name} updated successfully!`, 'success', 'Staff Account Updated');
      } else {
        const created = await createSubAdmin(formData);
        showToast(`Sub-admin account for ${created.name} (@${created.username}) created!`, 'success', 'Sub-Admin Created');
      }
      setIsSubAdminModalOpen(false);
      setEditingSubAdmin(null);
    } catch (error) {
      console.error('Save sub-admin error:', error);
      showToast(error.message || 'Failed to save sub-admin account', 'error', 'Database Error');
      throw error;
    }
  };

  const handleConfirmDeleteSubAdmin = async (userId) => {
    try {
      await deleteSubAdmin(userId);
      showToast('Sub-admin account deleted successfully.', 'info', 'Account Removed');
      setIsDeleteSubAdminModalOpen(false);
      setDeleteTargetSubAdmin(null);
    } catch (error) {
      console.error('Delete sub-admin error:', error);
      showToast(error.message || 'Failed to delete sub-admin account', 'error', 'Error');
    }
  };

  const handleToggleSubAdminStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await updateSubAdmin(user.userId || user.id, { status: newStatus });
      showToast(`Account for ${user.name} is now ${newStatus}.`, 'info', 'Status Updated');
    } catch (error) {
      console.error('Toggle status error:', error);
      showToast('Failed to update status', 'error', 'Error');
    }
  };

  // Determine page title and subtitle
  const getPageInfo = () => {
    if (selectedProject) {
      return {
        title: `Project Details • ${selectedProject.projectId}`,
        subtitle: selectedProject.projectName
      };
    }

    switch (currentSection) {
      case 'dashboard':
        return {
          title: 'Enterprise Management Dashboard',
          subtitle: 'Real-time performance across Projects, Workforce & Operations'
        };
      case 'projects':
        return {
          title: 'Projects Management',
          subtitle: 'Tender tracking, Local Body administration & budgets'
        };
      case 'employees':
        return {
          title: 'Employees & Workforce Directory',
          subtitle: 'Supervisors, drivers, operators, site engineers & wage ledger'
        };
      case 'wages':
        return {
          title: 'Daily Wages & Muster Roll',
          subtitle: 'Attendance, daily earned wages, site advances, and leave payments'
        };
      case 'expenses':
        return {
          title: 'Daily Site Expenses (Phase 3)',
          subtitle: 'Vehicle, Material, Fuel, Food & Site Overhead Management'
        };
      case 'materials':
        return {
          title: 'Materials Management (Phase 5)',
          subtitle: 'Bitumen VG-30, aggregates, M-Sand, cement procurement, vendors & challans'
        };
      case 'machinery':
        return {
          title: 'Machinery & Heavy Fleet (Phase 6)',
          subtitle: 'Pavers, rollers, tippers, and fuel logbooks'
        };
      case 'progress':
        return {
          title: 'Site Progress (Phase 4)',
          subtitle: 'Chainage progress, MB book & layer inspection'
        };
      case 'reports':
        return {
          title: 'Reports & Audits (Phase 7)',
          subtitle: 'Financial statements & PWD compliance logs'
        };
      case 'settings':
        return {
          title: 'Settings & Access Control (Phase 8)',
          subtitle: 'Super Admin credentials, email password recovery & Sub-Admin RBAC permissions'
        };
      default:
        return {
          title: 'Construction Management',
          subtitle: 'Kerala Infrastructure Road Works'
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <Layout
      currentSection={currentSection}
      onSelectSection={(sec) => {
        setCurrentSection(sec);
        setSelectedProject(null);
      }}
      pageTitle={title}
      pageSubtitle={subtitle}
      searchQuery={globalSearch}
      onSearchChange={(q) => {
        setGlobalSearch(q);
        if (q && currentSection === 'dashboard') {
          setCurrentSection('projects');
          setSelectedProject(null);
        }
      }}
    >
      {/* Loading state on first connect */}
      {isLoadingProjects && isLoadingEmployees && isLoadingWages && isLoadingExpenses && isLoadingMaterials ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 animate-pulse mb-4">
            <HardHat className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Connecting to Live Firestore Database...
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            Synchronizing Kerala Roadways records
          </p>
        </div>
      ) : selectedProject ? (
        /* Project Details Page */
        <ProjectDetails
          project={selectedProject}
          wages={wages}
          expenses={expenses}
          materials={materials}
          onBack={() => setSelectedProject(null)}
          onEdit={(proj) => handleOpenEditProjectModal(proj)}
          onArchiveToggle={(proj) => handleOpenArchiveProjectModal(proj)}
          onEditWage={(wage) => handleOpenEditWageModal(wage)}
          onDeleteWage={(wage) => handleOpenDeleteWageModal(wage)}
          onSettleWage={handleSettleWage}
          onEditExpense={(exp) => handleOpenEditExpenseModal(exp)}
          onDeleteExpense={(exp) => handleOpenDeleteExpenseModal(exp)}
          onEditMaterial={(mat) => handleOpenEditMaterialModal(mat)}
          onDeleteMaterial={(mat) => handleOpenDeleteMaterialModal(mat)}
        />
      ) : currentSection === 'dashboard' ? (
        /* Unified Common Dashboard */
        <DashboardOverview
          projects={projects}
          employees={employees}
          wages={wages}
          expenses={expenses}
          materials={materials}
          onAddNewProject={handleOpenAddProjectModal}
          onNavigateToProjects={() => setCurrentSection('projects')}
          onNavigateToEmployees={() => setCurrentSection('employees')}
          onNavigateToWages={() => setCurrentSection('wages')}
          onNavigateToExpenses={() => setCurrentSection('expenses')}
          onNavigateToMaterials={() => setCurrentSection('materials')}
          onNavigateToSettings={() => setCurrentSection('settings')}
          onSeedSampleData={handleSeedKeralaProjects}
          isSeeding={isSeedingProjects}
        />
      ) : currentSection === 'projects' ? (
        /* Projects Page */
        <ProjectsList
          projects={projects}
          onAddNewProject={canEditModule('projects') ? handleOpenAddProjectModal : null}
          onViewProject={(proj) => setSelectedProject(proj)}
          onEditProject={canEditModule('projects') ? handleOpenEditProjectModal : null}
          onArchiveProject={canEditModule('projects') ? handleOpenArchiveProjectModal : null}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />
      ) : currentSection === 'employees' ? (
        /* Employees Page - Dynamically reflects wages from dailyWages collection */
        <EmployeesList
          employees={employees}
          wages={wages}
          onAddNewEmployee={canEditModule('employees') ? handleOpenAddEmployeeModal : null}
          onEditEmployee={canEditModule('employees') ? handleOpenEditEmployeeModal : null}
          onArchiveEmployee={canEditModule('employees') ? handleOpenArchiveEmployeeModal : null}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onSeedEmployees={canEditModule('employees') ? handleSeedEmployees : null}
          isSeeding={isSeedingEmployees}
        />
      ) : currentSection === 'wages' ? (
        /* Daily Wages Page (Active Module) */
        <DailyWagesList
          wages={wages}
          employees={employees}
          projects={projects}
          onAddNewWage={canEditModule('wages') ? handleOpenAddWageModal : null}
          onEditWage={canEditModule('wages') ? handleOpenEditWageModal : null}
          onDeleteWage={canEditModule('wages') ? handleOpenDeleteWageModal : null}
          onSettleWage={canEditModule('wages') ? handleSettleWage : null}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onSeedWages={canEditModule('wages') ? handleSeedDailyWages : null}
          isSeeding={isSeedingWages}
        />
      ) : currentSection === 'expenses' ? (
        /* Daily Expenses Page (Phase 3 Active Module) */
        <DailyExpensesList
          expenses={expenses}
          projects={projects}
          onAddNewExpense={canEditModule('expenses') ? handleOpenAddExpenseModal : null}
          onEditExpense={canEditModule('expenses') ? handleOpenEditExpenseModal : null}
          onDeleteExpense={canEditModule('expenses') ? handleOpenDeleteExpenseModal : null}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onSeedExpenses={canEditModule('expenses') ? handleSeedDailyExpenses : null}
          isSeeding={isSeedingExpenses}
        />
      ) : currentSection === 'materials' ? (
        /* Daily Materials Page (Phase 5 Active Module) */
        <DailyMaterialsList
          materials={materials}
          projects={projects}
          isLoading={isLoadingMaterials}
          onAddNewMaterial={canEditModule('materials') ? handleOpenAddMaterialModal : null}
          onEditMaterial={canEditModule('materials') ? handleOpenEditMaterialModal : null}
          onDeleteMaterial={canEditModule('materials') ? handleOpenDeleteMaterialModal : null}
          onSeedMaterials={canEditModule('materials') ? handleSeedMaterials : null}
        />
      ) : currentSection === 'settings' ? (
        /* Settings & RBAC Access Control (Phase 8 Active Module) */
        <SettingsView
          systemUsers={systemUsers}
          onAddNewSubAdmin={handleOpenAddSubAdmin}
          onEditSubAdmin={handleOpenEditSubAdmin}
          onDeleteSubAdmin={handleOpenDeleteSubAdmin}
          onToggleUserStatus={handleToggleSubAdminStatus}
          onOpenPasswordReset={() => setIsPasswordResetModalOpen(true)}
        />
      ) : (
        /* Upcoming Modules (Machinery, Progress, Reports) */
        <UpcomingModule
          moduleId={currentSection}
          onNavigateToProjects={() => {
            setCurrentSection('projects');
            setSelectedProject(null);
          }}
        />
      )}

      {/* Add / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        nextSuggestedId={nextSuggestedProjectId}
      />

      {/* Archive / Restore Project Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={isArchiveProjectModalOpen}
        onClose={() => {
          setIsArchiveProjectModalOpen(false);
          setArchiveTargetProject(null);
        }}
        onConfirm={handleConfirmArchiveProjectToggle}
        project={archiveTargetProject}
        isArchiving={!archiveTargetProject?.isArchived}
      />

      {/* Add / Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isEmployeeFormOpen}
        onClose={() => {
          setIsEmployeeFormOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
        nextSuggestedId={nextSuggestedEmployeeId}
      />

      {/* Archive / Restore Employee Confirmation Modal */}
      <ArchiveEmployeeModal
        isOpen={isArchiveEmployeeModalOpen}
        onClose={() => {
          setIsArchiveEmployeeModalOpen(false);
          setArchiveTargetEmployee(null);
        }}
        onConfirm={handleConfirmArchiveEmployeeToggle}
        employee={archiveTargetEmployee}
        isArchiving={!archiveTargetEmployee?.isArchived}
      />

      {/* Add / Edit Daily Wage Modal */}
      <DailyWageFormModal
        isOpen={isWageFormOpen}
        onClose={() => {
          setIsWageFormOpen(false);
          setEditingWage(null);
        }}
        onSave={handleSaveWage}
        initialData={editingWage}
        employees={employees}
        projects={projects}
        nextSuggestedId={nextSuggestedWageId}
      />

      {/* Delete Wage Confirmation Modal */}
      <DeleteWageModal
        isOpen={isDeleteWageModalOpen}
        onClose={() => {
          setIsDeleteWageModalOpen(false);
          setDeleteTargetWage(null);
        }}
        onConfirm={handleConfirmDeleteWage}
        wageEntry={deleteTargetWage}
      />

      {/* Add / Edit Daily Expense Modal (Phase 3) */}
      <ExpenseFormModal
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        projects={projects}
        nextSuggestedId={nextSuggestedExpenseId}
      />

      {/* Delete Expense Confirmation Modal (Phase 3) */}
      <DeleteExpenseModal
        isOpen={isDeleteExpenseModalOpen}
        onClose={() => {
          setIsDeleteExpenseModalOpen(false);
          setDeleteTargetExpense(null);
        }}
        onConfirm={handleConfirmDeleteExpense}
        expenseEntry={deleteTargetExpense}
      />

      {/* Add / Edit Material Modal (Phase 5) */}
      <MaterialFormModal
        isOpen={isMaterialFormOpen}
        onClose={() => {
          setIsMaterialFormOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        initialData={editingMaterial}
        projects={projects}
        nextSuggestedId={nextSuggestedMaterialId}
      />

      {/* Delete Material Confirmation Modal (Phase 5) */}
      <DeleteMaterialModal
        isOpen={isDeleteMaterialModalOpen}
        onClose={() => {
          setIsDeleteMaterialModalOpen(false);
          setDeleteTargetMaterial(null);
        }}
        onConfirm={handleConfirmDeleteMaterial}
        material={deleteTargetMaterial}
      />

      {/* Settings Sub-Admin Modals (Phase 8) */}
      <SubAdminFormModal
        isOpen={isSubAdminModalOpen}
        onClose={() => {
          setIsSubAdminModalOpen(false);
          setEditingSubAdmin(null);
        }}
        onSave={handleSaveSubAdmin}
        initialData={editingSubAdmin}
      />

      <DeleteSubAdminModal
        isOpen={isDeleteSubAdminModalOpen}
        onClose={() => {
          setIsDeleteSubAdminModalOpen(false);
          setDeleteTargetSubAdmin(null);
        }}
        onConfirm={handleConfirmDeleteSubAdmin}
        subAdmin={deleteTargetSubAdmin}
      />

      {/* Global Authentication & Password Reset Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* PWA Version Update Notification & Live Offline Status Indicator */}
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConstructionApp />
    </AuthProvider>
  );
}
