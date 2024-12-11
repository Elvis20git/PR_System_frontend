import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import axios from 'axios';

// Basic item interface
interface PurchaseRequestItem {
  id: number;
  item_title: string;
  item_quantity: number;
  item_code: string;
  unit_of_measurement: string;
  description: string;
}

// Full purchase request interface
interface PurchaseRequest {
  id: number;
  title: string;
  department: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purchase_type: string;
  created_at: string;
  initiator_name: string;
  items: PurchaseRequestItem[];
  rejection_reason?: string;
}

// Modal props interface
interface PurchaseRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseRequest: PurchaseRequest | null;
  onRequestUpdate?: () => void;
}

// Optional: Response type if it differs from PurchaseRequest
interface PurchaseRequestResponse extends PurchaseRequest {
  // Add any additional fields that might come from the API
  updated_at?: string;
  approver_name?: string;
}

const PurchaseRequestDetailsModal = ({
  isOpen,
  onClose,
  purchaseRequest,
  onRequestUpdate
}: PurchaseRequestDetailsModalProps): JSX.Element | null => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setIsRejecting(false);
    setRejectionReason('');
    setError('');
    onClose();
  };

  useEffect(() => {
    setError('');
  }, [isRejecting]);

  useEffect(() => {
    if (isOpen) {
      setIsRejecting(false);
      setRejectionReason('');
      setError('');
    }
  }, [isOpen]);

  if (!purchaseRequest) return null;

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (action === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      const payload = {
        status: action,
        ...(action === 'REJECTED' && { rejection_reason: rejectionReason.trim() })
      };

      const response = await axios.patch<PurchaseRequestResponse>(
        `/api/purchase-request-status/${purchaseRequest.id}/update_status/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setIsRejecting(false);
        setRejectionReason('');
        if (onRequestUpdate) {
          onRequestUpdate();
        }
        handleClose();
      }

    } catch (err: any) {
      let errorMessage = 'Failed to update purchase request';

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          // Handle logout if needed
          // logout();
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Purchase request not found.';
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Purchase Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PR Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Title</p>
              <p className="font-medium">{purchaseRequest.title}</p>
            </div>
            <div>
              <p className="text-gray-500">Department</p>
              <p className="font-medium">{purchaseRequest.department}</p>
            </div>
            <div>
              <p className="text-gray-500">Purchase Type</p>
              <p className="font-medium">{purchaseRequest.purchase_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">
                <span className={getStatusBadgeClasses(purchaseRequest.status)}>
                  {purchaseRequest.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(purchaseRequest.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Initiator</p>
              <p className="font-medium">{purchaseRequest.initiator_name}</p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Items</h3>
            <ScrollArea className="h-[40vh]">
              <div className="space-y-3">
                {purchaseRequest.items.map((item) => (
                  <Card key={item.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Item Title</p>
                          <p className="font-medium">{item.item_title}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">
                            {item.item_quantity} {item.unit_of_measurement}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Item Code</p>
                          <p className="font-medium">{item.item_code}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Description</p>
                          <p className="font-medium">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Rejection Reason Input */}
          {isRejecting && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rejection Reason
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {purchaseRequest.status === 'PENDING' && (
          <DialogFooter className="sm:justify-end space-x-2">
            {isRejecting ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsRejecting(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('REJECTED')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsRejecting(true)}
                  disabled={isLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction('APPROVED')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseRequestDetailsModal;