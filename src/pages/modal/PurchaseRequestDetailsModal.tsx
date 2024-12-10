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

interface PurchaseRequestItem {
  id: number;
  item_title: string;
  item_quantity: number;
  item_code: string;
  unit_of_measurement: string;
  description: string;
}

interface PurchaseRequestResponse {
  id: number;
  title: string;
  department: string;
  status: string;
  purchase_type: string;
  created_at: string;
  initiator_name: string;
  items: PurchaseRequestItem[];
  rejection_reason?: string;
}

interface PurchaseRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseRequest: {
    id: number;
    title: string;
    department: string;
    status: string;
    purchase_type: string;
    created_at: string;
    initiator_name: string;
    items: PurchaseRequestItem[];
  } | null;
  onRequestUpdate?: () => void;
}

const PurchaseRequestDetailsModal = ({
  isOpen,
  onClose,
  purchaseRequest,
  onRequestUpdate
}: PurchaseRequestDetailsModalProps) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset states when modal closes
  const handleClose = () => {
    setIsRejecting(false);
    setRejectionReason('');
    setError('');
    onClose();
  };

  // Reset error when switching between approve/reject modes
  useEffect(() => {
    setError('');
  }, [isRejecting]);

  // Reset states when modal opens with new purchase request
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
        // You might want to trigger a logout or redirect to login here
        return;
      }

      const payload = {
        status: action,
        ...(action === 'REJECTED' && { rejection_reason: rejectionReason.trim() })
      };

      const response = await axios.put<PurchaseRequestResponse>(
        `http://localhost:8000/api/purchase-requests/${purchaseRequest.id}/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsRejecting(false);
      setRejectionReason('');
      if (onRequestUpdate) {
        onRequestUpdate();
      }
      handleClose();

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.message ||
                          'Failed to update purchase request';

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // You might want to trigger a logout here
      } else if (err.response?.status === 403) {
        setError('You do not have permission to perform this action.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canShowActions = purchaseRequest.status === 'PENDING';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[100vh] overflow-hidden">
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
                <span className={`px-2 py-1 rounded-full text-xs 
                  ${purchaseRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    purchaseRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {purchaseRequest.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">{new Date(purchaseRequest.created_at).toLocaleString()}</p>
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

          {/* Rejection Reason Textarea */}
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
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        {canShowActions && (
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