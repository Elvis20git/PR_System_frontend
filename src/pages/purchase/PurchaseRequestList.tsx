import React, { useEffect, useState } from 'react';
import { Eye, Pencil, Trash, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Sidebar from '../../../src/components/layout/Sidebar';
import Navbar from '../../../src/components/layout/Navbar';
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import PurchaseRequestDetailsModal from '../modal/PurchaseRequestDetailsModal';
import { useNavigate } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/Alert-Dialog";
import axios from "axios";

interface PurchaseRequest {
  id: number;
  title: string;
  department: string;
  // status: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  purchase_type: string;
  created_at: string;
  initiator_name: string;
}

interface PurchaseRequestWithItems extends PurchaseRequest {
  items: {
    id: number;
    item_title: string;
    item_quantity: number;
    item_code: string;
    unit_of_measurement: string;
    description: string;
  }[];
}

const ITEMS_PER_PAGE = 10;
const PurchaseRequestList = () => {

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestWithItems | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id:number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    await axios.delete(`http://192.168.222.43:8080/api/purchase-requests/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Refresh the page or update the list
    window.location.reload(); // or use a state update method if you have one
  } catch (error:any) {
    console.error('Error deleting purchase request:', error);
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate('/login');
    } else {
      alert(error.response?.data?.detail || 'Failed to delete purchase request');
    }
  }
};
  const handleViewRequest = async (prId: number) => {
    try {
      const response = await fetch(`http://192.168.222.43:8080/api/purchase-requests/${prId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase request details');
      }

      const data = await response.json();
      setSelectedRequest(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching purchase request details:', err);
    }
  };
  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      const response = await fetch('http://192.168.222.43:8080/api/purchase-requests-list/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase requests');
      }

      const data = await response.json();
      setPurchaseRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredRequests = purchaseRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pr.initiator_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? pr.purchase_type === selectedType : true;
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique purchase types for filter
  const purchaseTypes = Array.from(new Set(purchaseRequests.map(pr => pr.purchase_type)));

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-4">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="flex justify-center">
                  Loading purchase requests...
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-4">
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="text-red-500">
                  Error: {error}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Navbar />
        <div className="p-4 h-[calc(100vh-64px)] overflow-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by title or initiator..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">All Types</option>
                  {purchaseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left font-medium">Title</th>
                      <th className="p-4 text-left font-medium">Department</th>
                      <th className="p-4 text-left font-medium">Purchase Type</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Created At</th>
                      <th className="p-4 text-left font-medium">Initiator</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((pr) => (
                      <tr key={pr.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{pr.title}</td>
                        <td className="p-4">{pr.department}</td>
                        <td className="p-4">{pr.purchase_type}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs 
                            ${pr.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              pr.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {pr.status}
                          </span>
                        </td>
                        <td className="p-4">{new Date(pr.created_at).toLocaleString()}</td>
                        <td className="p-4">{pr.initiator_name}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                                onClick={() => handleViewRequest(pr.id)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                                title="View Details"
                            >
                              <Eye className="h-4 w-4"/>
                            </button>
                            <button
                                onClick={() => navigate(`/purchase-requests/${pr.id}/edit`)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                                title="Edit"
                            >
                              <Pencil className="h-4 w-4"/>
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="p-1 hover:bg-gray-100 rounded-full text-red-500"
                                  title="Delete"
                                >
                                  <Trash className="h-4 w-4"/>
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the purchase request.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(pr.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <PurchaseRequestDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            purchaseRequest={selectedRequest}
            onRequestUpdate={fetchPurchaseRequests}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestList;