// services/purchase.ts
import api from './api';

interface PurchaseRequestItem {
  item_title: string;
  item_quantity: number;
  item_code: string;
  unit_of_measurement: string;
  description: string;
}

interface PurchaseRequest {
  title: string;
  department: string;
  purchase_type: string;
  items: PurchaseRequestItem[];
}

export const purchaseService = {
  // Get all purchase requests
  getAllRequests: () =>
    api.get('/api/purchase-requests/'),

  // Get a single purchase request
  getRequest: (id: number) =>
    api.get(`/purchase-requests/${id}/`),

  // Create a new purchase request
  createRequest: (data: PurchaseRequest) =>
    api.post('/api/purchase-requests/', data),

  // Update a purchase request
  updateRequest: (id: number, data: Partial<PurchaseRequest>) =>
    api.patch(`/purchase-requests/${id}/`, data),

  // Delete a purchase request
  deleteRequest: (id: number) =>
    api.delete(`/purchase-requests/${id}/`),

  // Get all requests for current user
  getUserRequests: () =>
    api.get('/purchase-requests/user/'),

  // Get all requests pending approval (for HOD)
  getPendingApprovals: () =>
    api.get('/purchase-requests/pending/'),

  // Approve or reject a request
  updateRequestStatus: (id: number, status: 'approved' | 'rejected', comments?: string) =>
    api.patch(`/purchase-requests/${id}/status/`, { status, comments }),
};