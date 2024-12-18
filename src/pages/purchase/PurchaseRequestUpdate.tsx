import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Sidebar from '../../../src/components/layout/Sidebar';
import Navbar from '../../../src/components/layout/Navbar';
import { Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


interface HodUser {
  id: number;
  first_name: string;
  last_name: string;
}
const departmentOptions = [
  'IT & Business Support',
  'Finance',
  'Quality Assurance'
];

const purchaseTypeOptions = [
  'Raw Material',
  'Spare parts',
  'Consumables',
  'Indirect Goods',
  'Services',
  'CAPEX/ Small Projects'
];

const statusOptions = [
  'PENDING',
  'APPROVED',
  'REJECTED'
];

export default function PurchaseRequestUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    approver: '',
    status: '',
    purchase_type: '',
    items: [{
      item_title: '',
      item_quantity: '',
      item_code: '',
      unit_of_measurement: '',
      description: ''
    }]
  });

  const [hodUsers, setHodUsers] = useState<HodUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialStatus, setInitialStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch purchase request data
        const purchaseResponse = await axios.get(
          `http://192.168.222.43:8080/api/purchase-requests/${id}/`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        // Fetch HOD users
        const hodResponse = await axios.get(
          'http://192.168.222.43:8080/api/hod-users/',
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        setHodUsers(hodResponse.data);
        setFormData(purchaseResponse.data);
        setInitialStatus(purchaseResponse.data.status);
        setError("");
      } catch (error:any) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to load purchase request data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    if (index !== null) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        [e.target.name]: e.target.value
      };
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_title: '',
        item_quantity: '',
        item_code: '',
        unit_of_measurement: '',
        description: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formattedData = {
        ...formData,
        approver: parseInt(formData.approver, 10),
        items: formData.items.map(item => ({
          ...item,
          item_quantity: parseInt(item.item_quantity, 10) || 0
        }))
      };

      await axios.put(
        `http://192.168.222.43:8080/api/purchase-requests/${id}/`,
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      alert('Purchase request updated successfully!');
      navigate(-1);
    } catch (error:any) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        alert(error.response?.data?.detail || 'Failed to update purchase request');
      }
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const canModifyStatus = user.is_hod || initialStatus === 'PENDING';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={handleLogout}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar username={user.username}/>
        <div className="flex-1 p-6 overflow-hidden">
          <Card className="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-100px)]">
            <CardHeader className="border-b">
              <CardTitle>Update Purchase Request</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        Title
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Status
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={formData.status}
                        onChange={(e) => handleSelectChange(e.target.value, 'status')}
                        disabled={!canModifyStatus}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Department
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={(e) => handleSelectChange(e.target.value, 'department')}
                        value={formData.department}
                        required
                        disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                      >
                        <option value="" disabled>Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Approver
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={(e) => handleSelectChange(e.target.value, 'approver')}
                        value={formData.approver}
                        required
                        disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                      >
                        <option value="" disabled>
                          {loading
                            ? 'Loading approvers...'
                            : error
                              ? 'Error loading approvers'
                              : 'Select Approver'}
                        </option>
                        {!loading && !error && hodUsers.map((user) => (
                          <option key={user.id} value={user.id.toString()}>
                            {`${user.first_name} ${user.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">
                        Purchase Type
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onChange={(e) => handleSelectChange(e.target.value, 'purchase_type')}
                        value={formData.purchase_type}
                        required
                        disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                      >
                        <option value="" disabled>Select Purchase Type</option>
                        {purchaseTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Item & Specification</h2>

                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        <Input
                          name="item_title"
                          value={item.item_title}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Item Title"
                          required
                          disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                        />
                        <Input
                          name="item_quantity"
                          type="number"
                          min="1"
                          value={item.item_quantity}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Item Quantity"
                          required
                          disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                        />
                        <Input
                          name="item_code"
                          value={item.item_code}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Item code"
                          disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                        />
                        <Input
                          name="unit_of_measurement"
                          value={item.unit_of_measurement}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Unit of measurement"
                          disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                        />
                        <div className="flex gap-2">
                          <Input
                            name="description"
                            value={item.description}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="Description"
                            disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeItem(index)}
                            disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                          >
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 pl-0"
                      onClick={addItem}
                      disabled={!canModifyStatus && initialStatus !== 'PENDING'}
                    >
                      + Row
                    </Button>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || (!canModifyStatus && initialStatus !== 'PENDING')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Updating...' : 'Update Request'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }

        /* Hide main scrollbar */
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}