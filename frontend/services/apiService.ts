import { Tender, Client, User, NewTenderData, NewClientData, FinancialRequestType, AssignmentStatus, OEM, Product, Department, Designation, FinancialRequest, BiddingTemplate, NewOemData, NewUserData } from '../types';

// Use Vite's env variable for the production API URL.
// Fall back to the proxy path for local development.
// Fix: Cast `import.meta` to `any` to access Vite's `env` variables without causing a TypeScript type error.
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } else {
    // Read the response body as text to avoid consuming it twice.
    const errorText = await response.text();
    let errorMessage;
    try {
      // Try to parse the text as JSON to get a structured error message.
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      // If parsing fails, it's not a JSON response. Use the raw text.
      errorMessage = errorText || `API Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
}

// Tenders
export const getTenders = (): Promise<Tender[]> => fetch(`${API_BASE_URL}/tenders`).then(res => handleResponse<Tender[]>(res));
export const addTender = (tenderData: NewTenderData | Partial<Tender>): Promise<Tender> => 
    fetch(`${API_BASE_URL}/tenders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData),
    }).then(res => handleResponse<Tender>(res));
export const updateTender = (id: string, tenderData: Partial<Tender>): Promise<Tender> =>
    fetch(`${API_BASE_URL}/tenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData),
    }).then(res => handleResponse<Tender>(res));
export const deleteTender = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/tenders/${id}`, {
        method: 'DELETE',
    }).then(res => handleResponse<{ message: string }>(res));

// Clients
export const getClients = (): Promise<Client[]> => fetch(`${API_BASE_URL}/clients`).then(res => handleResponse<Client[]>(res));
export const addClient = (clientData: NewClientData): Promise<Client> => 
    fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
    }).then(res => handleResponse<Client>(res));
export const updateClient = (id: string, clientData: Partial<Client>): Promise<Client> =>
    fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
    }).then(res => handleResponse<Client>(res));

// Users
export const getUsers = (): Promise<User[]> => fetch(`${API_BASE_URL}/users`).then(res => handleResponse<User[]>(res));
export const login = (username: string, password: string):Promise<User> => 
    fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(res => handleResponse<User>(res));
export const addUser = (userData: NewUserData): Promise<User[]> =>
    fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    }).then(res => handleResponse<User[]>(res));
export const updateUser = (id: string, userData: Partial<User>): Promise<User[]> =>
    fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    }).then(res => handleResponse<User[]>(res));
export const deleteUser = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
    }).then(res => handleResponse<{ message: string }>(res));


// Assignment
export const respondToAssignment = (tenderId: string, status: AssignmentStatus, notes: string): Promise<Tender> =>
    fetch(`${API_BASE_URL}/tenders/${tenderId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }), // Assumes backend can get user from session/token
    }).then(res => handleResponse<Tender>(res));

// Financial Requests
export const getFinancialRequests = (): Promise<FinancialRequest[]> => fetch(`${API_BASE_URL}/financials`).then(res => handleResponse<FinancialRequest[]>(res));
export const addFinancialRequest = (requestData: any): Promise<FinancialRequest> => 
    fetch(`${API_BASE_URL}/financials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
    }).then(res => handleResponse<FinancialRequest>(res));
export const updateFinancialRequest = (id: string, updateData: any): Promise<FinancialRequest> =>
    fetch(`${API_BASE_URL}/financials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    }).then(res => handleResponse<FinancialRequest>(res));

// OEMs
export const getOems = (): Promise<OEM[]> => fetch(`${API_BASE_URL}/oems`).then(res => handleResponse<OEM[]>(res));
export const addOem = (oemData: NewOemData): Promise<OEM> =>
    fetch(`${API_BASE_URL}/oems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oemData),
    }).then(res => handleResponse<OEM>(res));
export const updateOem = (id: string, oemData: Partial<OEM>): Promise<OEM> =>
    fetch(`${API_BASE_URL}/oems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oemData),
    }).then(res => handleResponse<OEM>(res));

// Products
export const getProducts = (): Promise<Product[]> => fetch(`${API_BASE_URL}/products`).then(res => handleResponse<Product[]>(res));
export const addProduct = (productData: Partial<Product>): Promise<Product> =>
    fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    }).then(res => handleResponse<Product>(res));
export const updateProduct = (id: string, productData: Partial<Product>): Promise<Product> =>
    fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    }).then(res => handleResponse<Product>(res));
export const deleteProduct = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res));


// Admin - Departments, Designations, Templates
export const getDepartments = (): Promise<Department[]> => fetch(`${API_BASE_URL}/admin/departments`).then(res => handleResponse<Department[]>(res));
export const addDepartment = (name: string): Promise<Department> =>
    fetch(`${API_BASE_URL}/admin/departments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }).then(res => handleResponse<Department>(res));
export const deleteDepartment = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/admin/departments/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res));


export const getDesignations = (): Promise<Designation[]> => fetch(`${API_BASE_URL}/admin/designations`).then(res => handleResponse<Designation[]>(res));
export const addDesignation = (name: string): Promise<Designation> =>
    fetch(`${API_BASE_URL}/admin/designations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }).then(res => handleResponse<Designation>(res));
export const deleteDesignation = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/admin/designations/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res));


export const getBiddingTemplates = (): Promise<BiddingTemplate[]> => fetch(`${API_BASE_URL}/admin/templates`).then(res => handleResponse<BiddingTemplate[]>(res));
export const addBiddingTemplate = (templateData: Partial<BiddingTemplate>): Promise<BiddingTemplate> =>
    fetch(`${API_BASE_URL}/admin/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(templateData) }).then(res => handleResponse<BiddingTemplate>(res));
export const updateBiddingTemplate = (id: string, templateData: Partial<BiddingTemplate>): Promise<BiddingTemplate> =>
    fetch(`${API_BASE_URL}/admin/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(templateData) }).then(res => handleResponse<BiddingTemplate>(res));
export const deleteBiddingTemplate = (id: string): Promise<{ message: string }> =>
    fetch(`${API_BASE_URL}/admin/templates/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res));
