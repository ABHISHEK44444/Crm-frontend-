
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CrmView from './components/CrmView';
import { TendersView } from './components/TendersView';
import AiHelper from './components/AiHelper';
import { Tender, User, Role, Client, NewTenderData, TenderStatus, NewClientData, TenderHistoryLog, ImportedTenderData, BidWorkflowStage, ClientStatus, Contact, ContactData, ClientHistoryLog, NewUserData, UserStatus, AppNotification, InteractionLog, OEM, NewOemData, TenderDocument, TenderDocumentType, Department, Designation, FinancialRequest, FinancialRequestStatus, FinancialRequestType, SystemActivityLog, BiddingTemplate, Product, AssignmentStatus, StandardProcessState, EMD, EMDStatus, PostAwardProcess, AssignmentResponse } from './types';
import * as api from './services/apiService';
import { FinanceView } from './components/FinanceView';
import AdminView from './components/AdminView';
import ReportingView from './components/AnalyticsView';
import AddTenderModal from './components/AddTenderModal';
import ClientFormModal from './components/ClientFormModal';
import GenerateDocumentModal from './components/AddClientModal';
import ImportTenderModal from './components/ImportTenderModal';
import ContactFormModal from './components/ContactFormModal';
import FinancialRequestModal from './components/FinancialRequestModal';
import ProcessRequestModal from './components/ProcessRequestModal';
import UserFormModal from './components/UserFormModal';
import ReasonForLossModal from './components/ReasonForLossModal';
import OemsView from './components/OemsView';
import OemFormModal from './components/OemFormModal';
import AiEligibilityCheckModal from './components/AiEligibilityCheckModal';
import ProductFormModal from './components/ProductFormModal';
import PrepareBidPacketModal from './components/PrepareBidPacketModal';
import ProcessesView from './components/ProcessesView';
import { formatCurrency } from './utils/formatting';
import DeclineRequestModal from './components/DeclineRequestModal';
import ProcessTrackerModal from './components/ProcessTrackerModal';
import Login from './components/Login';
import NotificationsView from './components/NotificationsView';
import { AlertTriangleIcon } from './constants';


// Configure the PDF.js worker to ensure it loads correctly.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const parseLocalISO = (localIsoString: string): string => {
    // Handles "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm"
    if (!localIsoString) return new Date().toISOString();
    const cleanedString = localIsoString.replace(' ', 'T');
    // We assume the local time is what's intended, so we can just append 'Z' to treat it as UTC
    // if no timezone info is present. This is a simplification for the demo.
    // A more robust solution would use a date library to handle timezones properly.
    return new Date(cleanedString).toISOString();
};

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onClose, onConfirm, itemName, itemType }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-md border border-[#30363d]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delete {itemType}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete the {itemType} "{itemName}"? This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-[#0d1117] flex justify-end space-x-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-[#30363d] text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-[#444c56]">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      return null;
    }
  });
  const [currentView, _setCurrentView] = useState(() => sessionStorage.getItem('currentView') || 'dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAddTenderModalOpen, setIsAddTenderModalOpen] = useState(false);
  const [isImportTenderModalOpen, setIsImportTenderModalOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isFinancialRequestModalOpen, setFinancialRequestModalOpen] = useState(false);
  const [isProcessRequestModalOpen, setProcessRequestModalOpen] = useState(false);
  const [isUserFormModalOpen, setUserFormModalOpen] = useState(false);
  const [isOemFormModalOpen, setOemFormModalOpen] = useState(false);
  const [isReasonForLossModalOpen, setReasonForLossModalOpen] = useState(false);
  const [isGenerateDocumentModalOpen, setGenerateDocumentModalOpen] = useState(false);
  const [isAiEligibilityCheckModalOpen, setIsAiEligibilityCheckModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [isPrepareBidPacketModalOpen, setPrepareBidPacketModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [requestToDecline, setRequestToDecline] = useState<FinancialRequest | null>(null);
  const [tenderToTrack, setTenderToTrack] = useState<Tender | null>(null);
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormError, setUserFormError] = useState('');


  // Data State
  const [tenderForAiModal, setTenderForAiModal] = useState<Tender | null>(null);
  const [tenderForDocumentModal, setTenderForDocumentModal] = useState<Tender | null>(null);
  const [tenderForEligibilityModal, setTenderForEligibilityModal] = useState<Tender | null>(null);
  const [tenderForBidPacket, setTenderForBidPacket] = useState<Tender | null>(null);

  const [tenderForFinancialRequest, setTenderForFinancialRequest] = useState<string | null>(null);
  const [selectedTender, _setSelectedTender] = useState<{ tender: Tender; from?: string } | null>(null);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [editingContact, setEditingContact] = useState<{contact?: Contact, clientId: string} | undefined>(undefined);
  const [requestToProcess, setRequestToProcess] = useState<FinancialRequest | undefined>(undefined);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [editingOem, setEditingOem] = useState<OEM | undefined>(undefined);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [tenderToUpdateLoss, setTenderToUpdateLoss] = useState<Tender | null>(null);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [oems, setOems] = useState<OEM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [financialRequests, setFinancialRequests] = useState<FinancialRequest[]>([]);
  const [biddingTemplates, setBiddingTemplates] = useState<BiddingTemplate[]>([]);
  const [standardProcessState, setStandardProcessState] = useState<StandardProcessState>({});

  const [systemAlerts, setSystemAlerts] = useState<AppNotification[]>([]);
  const [eventNotifications, setEventNotifications] = useState<AppNotification[]>([]);
  const [tenderListFilters, setTenderListFilters] = useState({
      statusFilter: 'All',
      userFilter: 'All',
      searchTerm: '',
      workflowFilter: null as string | string[] | null,
      deadlineFilter: null as '48h' | '7d' | '15d' | null,
  });

  const setSelectedTender = useCallback((selection: React.SetStateAction<{ tender: Tender; from?: string } | null>) => {
    if (typeof selection === 'function') {
      _setSelectedTender(currentState => {
        const newState = selection(currentState);
        if (newState) {
            sessionStorage.setItem('selectedTender', JSON.stringify({ tenderId: newState.tender.id, from: newState.from }));
        } else {
            sessionStorage.removeItem('selectedTender');
        }
        return newState;
      });
    } else {
      if (selection) {
          sessionStorage.setItem('selectedTender', JSON.stringify({ tenderId: selection.tender.id, from: selection.from }));
      } else {
          sessionStorage.removeItem('selectedTender');
      }
      _setSelectedTender(selection);
    }
  }, []);
  
  const allNotifications = useMemo(() => 
    [...systemAlerts, ...eventNotifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [systemAlerts, eventNotifications]
  );
  
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications.filter(n => !n.recipientId || n.recipientId === currentUser.id);
  }, [allNotifications, currentUser]);


  const systemActivityLog = useMemo((): SystemActivityLog[] => {
    const tenderLogs: SystemActivityLog[] = tenders.flatMap(tender => 
        (tender.history || []).map((log, index) => ({
            ...log,
            id: `tend-log-${tender.id}-${index}`,
            entityType: 'Tender',
            entityName: tender.title,
            entityId: tender.id,
        }))
    );
    const clientLogs: SystemActivityLog[] = clients.flatMap(client => 
        (client.history || []).map((log, index) => ({
            ...log,
            id: `cli-log-${client.id}-${index}`,
            entityType: 'Client',
            entityName: client.name,
            entityId: client.id,
        }))
    );
    return [...tenderLogs, ...clientLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tenders, clients]);

  const setCurrentView = (view: string) => {
    sessionStorage.setItem('currentView', view);
    if (view !== 'tenders' && view !== 'my-feed') {
        setSelectedTender(null);
        setTenderListFilters({
            statusFilter: 'All',
            userFilter: 'All',
            searchTerm: '',
            workflowFilter: null as string | string[] | null,
            deadlineFilter: null as '48h' | '7d' | '15d' | null,
        });
    }
    _setCurrentView(view);
  };
  
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            const user = await api.login(username, password);
            if (user) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentUser(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

  const handleLogout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('currentUser');
      _setCurrentView('dashboard'); 
      sessionStorage.removeItem('currentView');
      sessionStorage.removeItem('selectedTender');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [
            tendersData, clientsData, usersData, oemsData,
            productsData, departmentsData, designationsData,
            requestsData, templatesData,
        ] = await Promise.all([
            api.getTenders(), api.getClients(), api.getUsers(),
            api.getOems(), api.getProducts(), api.getDepartments(),
            api.getDesignations(), api.getFinancialRequests(), api.getBiddingTemplates(),
        ]);
        setTenders(tendersData);
        setClients(clientsData);
        setUsers(usersData);
        setOems(oemsData);
        setProducts(productsData);
        setDepartments(departmentsData);
        setDesignations(designationsData);
        setFinancialRequests(requestsData);
        setBiddingTemplates(templatesData);
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
        fetchData();
    } else {
        setIsLoading(false);
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    if (tenders.length > 0 && !selectedTender) {
        const storedTenderData = sessionStorage.getItem('selectedTender');
        if (storedTenderData) {
            try {
                const { tenderId, from } = JSON.parse(storedTenderData);
                const tenderToSelect = tenders.find(t => t.id === tenderId);
                if (tenderToSelect) {
                    _setSelectedTender({ tender: tenderToSelect, from });
                } else {
                    sessionStorage.removeItem('selectedTender');
                }
            } catch (e) {
                console.error("Failed to parse stored tender data:", e);
                sessionStorage.removeItem('selectedTender');
            }
        }
    }
  }, [tenders, selectedTender]);

  useEffect(() => {
    if (!currentUser) return;
    const viewRoles: Record<string, Role[]> = {
        dashboard: [Role.Admin, Role.Sales, Role.Viewer],
        'my-feed': [Role.Admin, Role.Sales, Role.Viewer],
        finance: [Role.Admin, Role.Finance],
        admin: [Role.Admin],
        reporting: [Role.Admin, Role.Sales],
        oems: [Role.Admin, Role.Sales],
        processes: [Role.Admin, Role.Sales],
        tenders: [Role.Admin, Role.Viewer],
        notifications: [Role.Admin, Role.Sales, Role.Finance, Role.Viewer],
    };
    
    if (viewRoles[currentView] && !viewRoles[currentView].includes(currentUser.role)) {
       if (currentUser.role === Role.Finance) {
           _setCurrentView('finance');
       } else {
           _setCurrentView('dashboard');
       }
    }
  }, [currentUser, currentView]);

  useEffect(() => {
    if (!currentUser) return;

    const newAlerts: AppNotification[] = [];
    const now = new Date();
    const adminIds = users.filter(u => u.role === Role.Admin).map(u => u.id);

    const checkAndAddAlert = (tender: Tender, dateString: string, type: 'deadline' | 'expiry', messagePrefix: string) => {
        if(!dateString) return;
        const targetDate = new Date(dateString);
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 15) { 
            const recipients = new Set([...(tender.assignedTo || []), ...adminIds]);
            recipients.forEach(userId => {
                newAlerts.push({
                    id: `${tender.id}-${type}-${dateString}-${userId}`,
                    message: `${messagePrefix} for "${tender.title}" is due in ${diffDays} days.`,
                    type: type,
                    relatedTenderId: tender.id,
                    timestamp: now.toISOString(),
                    recipientId: userId,
                    isRead: false,
                });
            });
        }
    }
    
    tenders.forEach(t => {
        if (![TenderStatus.Won, TenderStatus.Lost, TenderStatus.Dropped].includes(t.status)) {
            checkAndAddAlert(t, t.deadline, 'deadline', 'Deadline');
        }
        if (t.emd?.expiryDate) checkAndAddAlert(t, t.emd.expiryDate, 'expiry', 'EMD');
        if (t.pbg?.expiryDate) checkAndAddAlert(t, t.pbg.expiryDate, 'expiry', 'PBG');
    });

    setSystemAlerts(newAlerts);

  }, [tenders, currentUser, users]);
  
  const navigateToTender = useCallback((tenderId: string) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (tender && currentUser) {
        setSelectedTender({ tender, from: 'notification' });
        if (currentUser.role === Role.Sales) {
            _setCurrentView('my-feed');
        } else {
            _setCurrentView('tenders');
        }
    }
  }, [tenders, currentUser, setSelectedTender]);

  const handleOpenAiHelper = useCallback((tender: Tender) => {
    setTenderForAiModal(tender);
    setIsAiModalOpen(true);
  }, []);
  
  const handleOpenGenerateDocument = useCallback((tender: Tender) => {
      setTenderForDocumentModal(tender);
      setGenerateDocumentModalOpen(true);
  }, []);

  const handleOpenEligibilityCheck = useCallback((tender: Tender) => {
      setTenderForEligibilityModal(tender);
      setIsAiEligibilityCheckModalOpen(true);
  }, []);

  const handleOpenBidPacket = useCallback((tender: Tender) => {
    setTenderForBidPacket(tender);
    setPrepareBidPacketModalOpen(true);
  }, []);

  const handleOpenProcessTracker = useCallback((tender: Tender) => {
    setTenderToTrack(tender);
  }, []);

  const handleUpdateProcessTracker = useCallback(async (tenderId: string, updatedProcess: PostAwardProcess) => {
    if(!currentUser) return;
    try {
        const tenderToUpdate = tenders.find(t => t.id === tenderId);
        if (tenderToUpdate) {
            const updatedTender = { ...tenderToUpdate, postAwardProcess: updatedProcess };
            const savedTender = await api.updateTender(tenderId, updatedTender);
            setTenders(prev => prev.map(t => t.id === tenderId ? savedTender : t));
        }
    } catch (err) {
        console.error("Failed to update process tracker", err);
    }
    setTenderToTrack(null);
  }, [currentUser, tenders]);

  const handleAddTender = useCallback(async (tenderData: NewTenderData) => {
      if (!currentUser) return;
      try {
          const newTender = await api.addTender(tenderData);
          setTenders(prev => [newTender, ...prev]);
          setIsAddTenderModalOpen(false);
      } catch (err) {
          console.error("Failed to add tender", err);
      }
  }, [currentUser]);
  
  const handleUpdateTender = useCallback(async (tenderToUpdate: Tender) => {
    if (tenderToUpdate.status === TenderStatus.Lost && !tenderToUpdate.reasonForLoss) {
        setTenderToUpdateLoss(tenderToUpdate);
        setReasonForLossModalOpen(true);
        return;
    }

    const originalTender = tenders.find(t => t.id === tenderToUpdate.id);

    // Perform the optimistic UI update immediately
    setTenders(prevTenders =>
        prevTenders.map(t => (t.id === tenderToUpdate.id ? tenderToUpdate : t))
    );
    setSelectedTender(currentSelection => {
        if (currentSelection && currentSelection.tender.id === tenderToUpdate.id) {
            return { ...currentSelection, tender: tenderToUpdate };
        }
        return currentSelection;
    });

    // Create a clean payload for the API, removing internal fields that should not be sent
    const updatePayload = { ...tenderToUpdate };
    delete (updatePayload as any)._id;
    delete (updatePayload as any).__v;

    try {
        const savedTender = await api.updateTender(tenderToUpdate.id, updatePayload);
        
        // On success, sync the state with the authoritative response from the server
        setTenders(prevTenders =>
            prevTenders.map(t => (t.id === savedTender.id ? savedTender : t))
        );
        setSelectedTender(currentSelection => {
            if (currentSelection && currentSelection.tender.id === savedTender.id) {
                return { ...currentSelection, tender: savedTender };
            }
            return currentSelection;
        });
    } catch (err) {
        console.error("Failed to update tender, reverting change.", err);
        alert("Error: Could not save tender changes to the server. Your changes have been reverted.");
        
        // On failure, revert the optimistic update using the original state
        if (originalTender) {
            setTenders(prevTenders =>
                prevTenders.map(t => (t.id === originalTender.id ? originalTender : t))
            );
            setSelectedTender(currentSelection => {
                if (currentSelection && currentSelection.tender.id === originalTender.id) {
                    return { ...currentSelection, tender: originalTender };
                }
                return currentSelection;
            });
        }
    }
}, [tenders, setSelectedTender]);


  const handleAssignmentResponse = useCallback(async (tenderId: string, status: AssignmentStatus, notes: string) => {
      try {
          const updatedTender = await api.respondToAssignment(tenderId, status, notes);
          setTenders(prev => prev.map(t => t.id === tenderId ? updatedTender : t));
          if (selectedTender && selectedTender.tender.id === tenderId) {
            setSelectedTender({ ...selectedTender, tender: updatedTender });
          }
      } catch (err) {
          console.error("Failed to respond to assignment", err);
      }
  }, [selectedTender, setSelectedTender]);
  
  const handleSaveReasonForLoss = (reason: Tender['reasonForLoss'], notes?: string) => {
      if (tenderToUpdateLoss) {
          const updatedTender = { ...tenderToUpdateLoss, reasonForLoss: reason, reasonForLossNotes: notes };
          handleUpdateTender(updatedTender);
          setReasonForLossModalOpen(false);
          setTenderToUpdateLoss(null);
      }
  };
  
  const handleSaveImportedTender = useCallback(async (tenderData: ImportedTenderData, file: File | null) => {
    if (!currentUser) return;

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    try {
        let client = clients.find(c => c.name.toLowerCase() === tenderData.clientName?.toLowerCase());
        let clientId = client?.id;

        if (!client && tenderData.clientName) {
            const newClient = await api.addClient({ name: tenderData.clientName, industry: tenderData.department || 'Imported', gstin: '', category: 'Imported', status: ClientStatus.Lead });
            setClients(prev => [newClient, ...prev]);
            clientId = newClient.id;
        }

        if (!clientId) {
            alert('A client name is required to import a tender. Please ensure the AI extracted a client name.');
            return;
        }

        const documents: TenderDocument[] = [];
        if (file) {
            const dataUrl = await fileToDataUrl(file);
            const newDocument: TenderDocument = {
                id: `doc_${Date.now()}`,
                name: file.name,
                url: dataUrl,
                type: TenderDocumentType.TenderNotice,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
                uploadedById: currentUser.id,
            };
            documents.push(newDocument);
        }

        const documentsRequiredString = Array.isArray(tenderData.documentsRequired) 
            ? tenderData.documentsRequired.join('\n') 
            : tenderData.documentsRequired;

        const newTenderPayload: Partial<Tender> = {
            ...tenderData,
            documentsRequired: documentsRequiredString,
            clientId: clientId,
            clientName: tenderData.clientName,
            deadline: tenderData.deadline ? parseLocalISO(tenderData.deadline) : new Date().toISOString(),
            openingDate: tenderData.openingDate ? parseLocalISO(tenderData.openingDate) : undefined,
            value: tenderData.value || 0,
            documents: documents,
        };

        const newTender = await api.addTender(newTenderPayload);
        setTenders(prev => [newTender, ...prev]);
        setIsImportTenderModalOpen(false);
    } catch (err) {
        console.error("Failed to save imported tender", err);
        alert(`Error: ${err instanceof Error ? err.message : 'Could not save tender.'}`);
    }
  }, [clients, currentUser]);
  
  const handleUpdateClient = useCallback(async (client: Client) => {
      if(!currentUser) return;
      try {
          const updatedClient = await api.updateClient(client.id, client);
          setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      } catch (err) {
        console.error("Failed to update client", err);
      }
  }, [currentUser]);

  const handleAddOrUpdateClient = useCallback(async (clientData: Client | NewClientData) => {
      if(!currentUser) return;
      try {
        if ('id' in clientData) {
            const updatedClient = await api.updateClient(clientData.id, clientData);
            setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        } else {
            const newClient = await api.addClient(clientData);
            setClients(prev => [newClient, ...prev]);
        }
        setIsClientFormOpen(false);
        setEditingClient(undefined);
      } catch (err) {
        console.error("Failed to save client", err);
      }
  }, [currentUser]);

  const handleAddOrUpdateContact = useCallback((clientId: string, contactData: ContactData | Contact) => {
      console.log("Saving contact...", clientId, contactData);
      setIsContactFormOpen(false);
      setEditingContact(undefined);
  }, []);

  const handleDeleteContact = useCallback((clientId: string, contactId: string) => {
      console.log("Deleting contact...", clientId, contactId);
  }, []);
  
  const handleLogInteraction = (clientId: string, interaction: Omit<InteractionLog, 'id' | 'user' | 'userId' | 'timestamp'>) => {
    console.log("Logging interaction", clientId, interaction);
  };

  const handleOpenFinancialRequestModal = useCallback((tenderId?: string) => {
      setTenderForFinancialRequest(tenderId || null);
      setFinancialRequestModalOpen(true);
  }, []);

  const handleRaiseFinancialRequest = useCallback(async (tenderId: string, type: FinancialRequestType, amount: number, notes?: string, expiryDate?: string) => {
    try {
        const newRequest = await api.addFinancialRequest({ tenderId, type, amount, notes, expiryDate });
        setFinancialRequests(prev => [newRequest, ...prev]);
        setFinancialRequestModalOpen(false);
    } catch (err) {
        console.error("Failed to raise financial request:", err);
        // Re-throw the error so the modal can catch it and display a message
        throw err;
    }
}, []);

  const handleUpdateRequestStatus = useCallback(async (requestId: string, newStatus: FinancialRequestStatus, details?: { reason?: string; instrument?: FinancialRequest['instrumentDetails'] }) => {
    await api.updateFinancialRequest(requestId, { status: newStatus, ...details });
    const requests = await api.getFinancialRequests();
    setFinancialRequests(requests);
    const tendersData = await api.getTenders();
    setTenders(tendersData);
}, []);
  
 const handleAddOrUpdateUser = async (userData: NewUserData | User) => {
    setUserFormError('');
    try {
        let allUsers: User[];
        if ('id' in userData) {
            allUsers = await api.updateUser(userData.id, userData);
        } else {
            allUsers = await api.addUser(userData);
        }
        setUsers(allUsers);
        
        // Common logic after success
        setUserFormModalOpen(false);
        setEditingUser(undefined);
    } catch (err: any) {
        console.error("Failed to save user", err);
        setUserFormError(err.message || 'An unexpected error occurred.');
    }
};

  
  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    const allUsers = await api.updateUser(userId, { status });
    setUsers(allUsers);
  };

  const handleSaveDepartment = async (name: string) => {
      const newDept = await api.addDepartment(name);
      setDepartments(prev => [...prev, newDept]);
  };
  const handleDeleteDepartment = async (id: string) => {
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
  };
  const handleSaveDesignation = async (name: string) => {
      const newDesig = await api.addDesignation(name);
      setDesignations(prev => [...prev, newDesig]);
  };
  const handleDeleteDesignation = async (id: string) => {
      await api.deleteDesignation(id);
      setDesignations(prev => prev.filter(d => d.id !== id));
  };

  const handleAddOrUpdateOem = async (oemData: NewOemData | OEM) => {
    try {
        if('id' in oemData) {
            const updated = await api.updateOem(oemData.id, oemData);
            setOems(prev => prev.map(o => o.id === updated.id ? updated : o));
        } else {
            const newOem = await api.addOem(oemData);
            setOems(prev => [...prev, newOem]);
        }
        setOemFormModalOpen(false);
        setEditingOem(undefined);
    } catch(err) { console.error(err); }
  };
  
  const handleSaveTemplate = async (template: BiddingTemplate) => {
      if(template.id.startsWith('temp_')) { // New template
          const newTemplate = await api.addBiddingTemplate({ name: template.name, content: template.content });
          setBiddingTemplates(prev => [...prev, newTemplate]);
      } else { // Update existing
          const updated = await api.updateBiddingTemplate(template.id, template);
          setBiddingTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
  };

  const handleDeleteTemplate = async (templateId: string) => {
      await api.deleteBiddingTemplate(templateId);
      setBiddingTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleAddOrUpdateProduct = async (productData: Product) => {
    try {
        if(products.some(p => p.id === productData.id)) { // Editing
            const updated = await api.updateProduct(productData.id, productData);
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        } else { // Adding
            const newProd = await api.addProduct(productData);
            setProducts(prev => [...prev, newProd]);
        }
        setIsProductFormModalOpen(false);
        setEditingProduct(undefined);
    } catch(err) { console.error(err); }
  };

  const handleDeleteProduct = async (productId: string) => {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleDeleteTender = async () => {
    if (!tenderToDelete) return;
    try {
        await api.deleteTender(tenderToDelete.id);
        setTenders(prev => prev.filter(t => t.id !== tenderToDelete.id));
        setTenderToDelete(null); // Close modal
        if(selectedTender?.tender.id === tenderToDelete.id) {
            setSelectedTender(null); // If the deleted tender was being viewed, go back to list
        }
    } catch (err) {
        console.error("Failed to delete tender", err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
        await api.deleteUser(userToDelete.id);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
    } catch (err: any) {
        console.error("Failed to delete user", err);
        alert(`Error deleting user: ${err.message}`);
        setUserToDelete(null);
    }
  };
  
  const handleNavigateToTendersWithFilter = useCallback((filter: any) => {
    const newFilters = { // Reset UI filters
        statusFilter: 'All',
        userFilter: 'All',
        searchTerm: '',
        workflowFilter: null as string | string[] | null,
        deadlineFilter: null as '48h' | '7d' | '15d' | null,
    };

    const { type, value } = filter;
    if (type === 'status') {
        newFilters.statusFilter = value;
    } else if (type === 'workflowStage') {
        newFilters.workflowFilter = value;
        newFilters.statusFilter = 'In Process';
    } else if (type === 'deadline') {
        newFilters.deadlineFilter = value;
    } else if (type === 'workflowStage_and_status') {
        newFilters.workflowFilter = value.workflowStages;
        newFilters.statusFilter = value.status;
    }
    setTenderListFilters(newFilters);
    
    if (currentUser && currentUser.role === Role.Sales) {
      _setCurrentView('my-feed');
    } else {
      _setCurrentView('tenders');
    }
  }, [currentUser]);
  
  const handleTenderListFilterChange = useCallback((newFilters: Partial<typeof tenderListFilters>) => {
      setTenderListFilters(prev => ({...prev, ...newFilters}));
  }, []);

  const currentUserParticipationStatus = useMemo(() => {
    if (!currentUser || !selectedTender) {
        return null;
    }
    const tender = tenders.find(t => t.id === selectedTender.tender.id);
    if (!tender) return null;

    return tender.assignmentResponses?.[currentUser.id]?.status;
  }, [currentUser, selectedTender, tenders]);
  
  const handleMarkNotificationsAsRead = useCallback(() => {
    const markAsRead = (notifications: AppNotification[]) => 
        notifications.map(n => n.isRead ? n : { ...n, isRead: true });
    
    setSystemAlerts(markAsRead);
    setEventNotifications(markAsRead);
}, []);

  const handleMarkAllAsRead = useCallback(() => {
      const markAsRead = (notifications: AppNotification[]) => 
          notifications.map(n => ({ ...n, isRead: true }));
      
      setSystemAlerts(markAsRead);
      setEventNotifications(markAsRead);
  }, []);

  const handleViewAllNotifications = useCallback(() => {
      _setCurrentView('notifications');
  }, []);

  const handlePasswordReset = (email: string) => {
    // In a real application, this would trigger an API call.
    // For this demo, we'll just show a confirmation.
    alert(`If an account exists for ${email}, a password reset link has been sent.`);
    setIsPasswordResetModalOpen(false);
  };



  const renderView = () => {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading application data...</div>;
    }

    const tenderViewProps = {
        tenders, oems, products, users, financialRequests,
        selectedTender,
        setSelectedTender,
        onAnalyze: handleOpenAiHelper, 
        onEligibilityCheck: handleOpenEligibilityCheck, 
        currentUser: currentUser!, 
        onAddTender: () => setIsAddTenderModalOpen(true), 
        onImportTender: () => setIsImportTenderModalOpen(true), 
        onUpdateTender: handleUpdateTender,
        onDeleteTender: setTenderToDelete,
        onAssignmentResponse: handleAssignmentResponse,
        onGenerateDocument: handleOpenGenerateDocument, 
        onFinancialRequest: handleOpenFinancialRequestModal,
        onPrepareBidPacket: handleOpenBidPacket,
        onTrackProcess: handleOpenProcessTracker,
        filters: tenderListFilters,
        onFiltersChange: handleTenderListFilterChange,
    };
    
    switch (currentView) {
      case 'dashboard':
        const dashboardTenders = currentUser!.role === Role.Sales
            ? tenders.filter(t => {
                const isAssigned = (t.assignedTo || []).includes(currentUser!.id);
                if (!isAssigned) return false;
                const response = t.assignmentResponses?.[currentUser!.id];
                return response?.status !== AssignmentStatus.Declined;
            })
            : tenders;
        const dashboardClients = currentUser!.role === Role.Sales
            ? clients.filter(c => dashboardTenders.some(t => t.clientId === c.id))
            : clients;
        return <Dashboard tenders={dashboardTenders} clients={dashboardClients} currentUser={currentUser!} onCardClick={handleNavigateToTendersWithFilter} />;
      case 'crm': return <CrmView clients={clients} tenders={tenders} onAddClient={() => setIsClientFormOpen(true)} onEditClient={(client) => { setEditingClient(client); setIsClientFormOpen(true); }} onUpdateClient={handleUpdateClient} onLogInteraction={handleLogInteraction} onAddContact={(clientId) => {setEditingContact({clientId}); setIsContactFormOpen(true);}} onEditContact={(clientId, contact) => {setEditingContact({contact, clientId}); setIsContactFormOpen(true)}} onDeleteContact={handleDeleteContact} currentUser={currentUser!}/>;
      case 'tenders': return <TendersView {...tenderViewProps} />;
      case 'my-feed':
        const myFeedTenders = tenders.filter(t => {
            const isAssignedToCurrentUser = (t.assignedTo || []).includes(currentUser!.id);
            if (isAssignedToCurrentUser) {
                const response = t.assignmentResponses?.[currentUser!.id];
                return response?.status !== AssignmentStatus.Declined;
            }
            if (currentUser!.role === Role.Sales) return false;
            if (!t.assignedTo || t.assignedTo.length === 0) {
                 const userSpecializations = new Set(currentUser!.specializations || []);
                 if (userSpecializations.size > 0 && t.itemCategory) {
                    return userSpecializations.has(t.itemCategory);
                 }
                 return true;
            }
            return false;
        });
        return <TendersView {...tenderViewProps} tenders={myFeedTenders} />;
      case 'finance': return <FinanceView users={users} tenders={tenders} currentUser={currentUser!} financialRequests={financialRequests} onRequestNew={() => handleOpenFinancialRequestModal(undefined)} onUpdateRequestStatus={handleUpdateRequestStatus} onProcessRequest={(req) => { setRequestToProcess(req); setProcessRequestModalOpen(true); }} onDeclineRequest={(req) => setRequestToDecline(req)} />;
      case 'admin': return <AdminView users={users} currentUser={currentUser!} departments={departments} designations={designations} biddingTemplates={biddingTemplates} products={products} onAddUser={() => { setUserFormError(''); setUserFormModalOpen(true); }} onEditUser={(user) => {setUserFormError(''); setEditingUser(user); setUserFormModalOpen(true);}} onUpdateUserStatus={handleUpdateUserStatus} onDeleteUser={setUserToDelete} onSaveDepartment={handleSaveDepartment} onDeleteDepartment={handleDeleteDepartment} onSaveDesignation={handleSaveDesignation} onDeleteDesignation={handleDeleteDesignation} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} onAddOrUpdateProduct={handleAddOrUpdateProduct} onEditProduct={(product) => { setEditingProduct(product); setIsProductFormModalOpen(true); }} onDeleteProduct={handleDeleteProduct} />;
      case 'oems': return <OemsView oems={oems} tenders={tenders} onAddOem={() => setOemFormModalOpen(true)} onEditOem={(oem) => {setEditingOem(oem); setOemFormModalOpen(true)}} />;
      case 'reporting': return <ReportingView tenders={tenders} clients={clients} users={users} financialRequests={financialRequests} activityLog={systemActivityLog} currentUser={currentUser!} />;
      case 'processes': return <ProcessesView standardProcessState={standardProcessState} onUpdate={setStandardProcessState} />;
      case 'notifications': return <NotificationsView notifications={userNotifications} onNotificationClick={navigateToTender} onMarkAllAsRead={handleMarkAllAsRead} />;
      default: return <Dashboard tenders={tenders} clients={clients} currentUser={currentUser!} onCardClick={handleNavigateToTendersWithFilter} />;
    }
  };

  const title = useMemo(() => {
     if(currentView.startsWith('jurisdiction-')) {
        const jurisdiction = currentView.split('-')[1];
        return `${jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1)} Tenders`;
    }
    const viewMap: {[key:string]: string} = {
      'dashboard': 'Dashboard',
      'crm': 'Client Relationship Management',
      'tenders': 'All Tenders',
      'my-feed': 'My Tenders',
      'finance': 'Finance Dashboard',
      'admin': 'Admin Panel',
      'reporting': 'Reporting & MIS',
      'oems': 'OEM Management',
      'processes': 'Standard Operating Procedures',
      'notifications': 'Notifications',
    };
    return viewMap[currentView] || 'Dashboard';
  }, [currentView]);
  
  const clientForDocumentModal = isGenerateDocumentModalOpen && tenderForDocumentModal
    ? clients.find(c => c.id === tenderForDocumentModal.clientId)
    : undefined;

  return (
    <>
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex bg-gray-100 dark:bg-[#0d1117] min-h-screen">
          <Sidebar 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            currentUser={currentUser}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />
          <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Header 
              title={title} 
              currentUser={currentUser}
              onLogout={handleLogout}
              notifications={userNotifications}
              onNotificationClick={navigateToTender}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              onViewAllNotifications={handleViewAllNotifications}
              currentUserParticipationStatus={currentUserParticipationStatus}
            />
            <main>
              {renderView()}
            </main>
          </div>
        </div>
      )}

      {isAiModalOpen && tenderForAiModal && (
        <AiHelper tender={tenderForAiModal} onClose={() => setIsAiModalOpen(false)} />
      )}
       {isAiEligibilityCheckModalOpen && tenderForEligibilityModal && (
        <AiEligibilityCheckModal tender={tenderForEligibilityModal} onClose={() => setIsAiEligibilityCheckModalOpen(false)} />
      )}
      {isAddTenderModalOpen && (
          <AddTenderModal clients={clients} onClose={() => setIsAddTenderModalOpen(false)} onSave={handleAddTender} />
      )}
       {isGenerateDocumentModalOpen && tenderForDocumentModal && clientForDocumentModal && (
        <GenerateDocumentModal 
            tender={tenderForDocumentModal}
            client={clientForDocumentModal}
            currentUser={currentUser!}
            templates={biddingTemplates}
            onClose={() => setGenerateDocumentModalOpen(false)}
        />
      )}
      {isImportTenderModalOpen && (
        <ImportTenderModal onClose={() => setIsImportTenderModalOpen(false)} onSave={handleSaveImportedTender} />
      )}
      {isClientFormOpen && (
        <ClientFormModal client={editingClient} onClose={() => {setIsClientFormOpen(false); setEditingClient(undefined);}} onSave={handleAddOrUpdateClient} />
      )}
      {isContactFormOpen && editingContact && (
        <ContactFormModal clientId={editingContact.clientId} contact={editingContact.contact} onClose={() => {setIsContactFormOpen(false); setEditingContact(undefined);}} onSave={handleAddOrUpdateContact} />
      )}
      {isFinancialRequestModalOpen && (
        <FinancialRequestModal 
            tenders={tenders} 
            onClose={() => { setFinancialRequestModalOpen(false); setTenderForFinancialRequest(null); }} 
            onSave={handleRaiseFinancialRequest} 
            initialTenderId={tenderForFinancialRequest}
        />
      )}
      {isProcessRequestModalOpen && requestToProcess && (
        <ProcessRequestModal 
            request={requestToProcess} 
            onClose={() => {setProcessRequestModalOpen(false); setRequestToProcess(undefined);}} 
            onSave={(instrumentDetails) => {
                handleUpdateRequestStatus(requestToProcess.id, FinancialRequestStatus.Processed, { instrument: instrumentDetails });
                setProcessRequestModalOpen(false); 
                setRequestToProcess(undefined);
            }} 
        />
      )}
      {isUserFormModalOpen && (
          <UserFormModal 
            user={editingUser} 
            departments={departments} 
            designations={designations} 
            onClose={() => {setUserFormModalOpen(false); setEditingUser(undefined); setUserFormError('');}} 
            onSave={handleAddOrUpdateUser} 
            error={userFormError}
          />
      )}
       {isOemFormModalOpen && (
          <OemFormModal oem={editingOem} onClose={() => {setOemFormModalOpen(false); setEditingOem(undefined)}} onSave={handleAddOrUpdateOem} />
      )}
      {isProductFormModalOpen && (
        <ProductFormModal 
          product={editingProduct} 
          currentUser={currentUser!}
          onClose={() => {setIsProductFormModalOpen(false); setEditingProduct(undefined);}} 
          onSave={handleAddOrUpdateProduct}
        />
      )}
       {isReasonForLossModalOpen && (
        <ReasonForLossModal onClose={() => setReasonForLossModalOpen(false)} onSave={handleSaveReasonForLoss} />
       )}
        {requestToDecline && (
            <DeclineRequestModal
                onClose={() => setRequestToDecline(null)}
                onConfirm={(reason) => {
                    handleUpdateRequestStatus(requestToDecline.id, FinancialRequestStatus.Declined, { reason });
                    setRequestToDecline(null);
                }}
            />
        )}
        {tenderToDelete && (
            <DeleteConfirmationModal
                itemType="tender"
                itemName={tenderToDelete.title}
                onClose={() => setTenderToDelete(null)}
                onConfirm={handleDeleteTender}
            />
        )}
        {userToDelete && (
            <DeleteConfirmationModal
                itemType="user"
                itemName={userToDelete.name}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
            />
        )}
        {isPrepareBidPacketModalOpen && tenderForBidPacket && (
            <PrepareBidPacketModal
                tender={tenderForBidPacket}
                product={products.find(p => p.id === tenderForBidPacket.productId)}
                onClose={() => setPrepareBidPacketModalOpen(false)}
            />
        )}
        {tenderToTrack && (
            <ProcessTrackerModal
                tender={tenderToTrack}
                currentUser={currentUser!}
                users={users}
                onClose={() => setTenderToTrack(null)}
                onSave={handleUpdateProcessTracker}
            />
        )}
        {isPasswordResetModalOpen && (
            <PasswordResetModal
                onClose={() => setIsPasswordResetModalOpen(false)}
                onSendResetLink={handlePasswordReset}
            />
        )}
    </>
  );
};

export default App;
