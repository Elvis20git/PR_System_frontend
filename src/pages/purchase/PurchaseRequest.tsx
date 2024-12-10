import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Sidebar from '../../../src/components/layout/Sidebar.tsx';
import Navbar from '../../../src/components/layout/Navbar.tsx';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

export default function PurchaseRequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    approver: '',
    purchase_type: '',
    items: [{
      item_title: '',
      item_quantity: '',
      item_code: '',
      unit_of_measurement: '',
      description: ''
    }]
  });

  const [hodUsers, setHodUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHodUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/hod-users/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setHodUsers(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching HOD users:', error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to load approvers');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHodUsers();
  }, [navigate]);

  const handleInputChange = (e, index = null) => {
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

  const handleSelectChange = (value, field) => {
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

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
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

      await axios.post(
        'http://localhost:8000/api/purchase-requests/',
        formattedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      alert('Purchase request submitted successfully!');

      setFormData({
        title: '',
        department: '',
        approver: '',
        purchase_type: '',
        items: [{
          item_title: '',
          item_quantity: '',
          item_code: '',
          unit_of_measurement: '',
          description: ''
        }]
      });
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        alert(error.response?.data?.detail || 'Failed to submit purchase request');
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

  return (
      <div className="flex h-screen overflow-hidden"> {/* Add overflow-hidden here */}
        <Sidebar onLogout={handleLogout}/>
        <div className="flex-1 flex flex-col overflow-hidden"> {/* Add flex-col and overflow-hidden */}
          <Navbar username={user.username}/>
          <div className="flex-1 p-6 overflow-hidden"> {/* Add overflow-hidden */}
            <Card className="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-100px)]"> {/* Set a fixed height */}
              <CardHeader className="border-b">
                <CardTitle>Purchase Request</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto custom-scrollbar"> {/* Add custom scrollbar class */}
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
                          value="Pending"

                      >
                        <option value="Pending">Pending</option>
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
                          value={formData.department || ''}
                          required
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
                          value={formData.approver || ''}
                          required
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
                          value={formData.purchase_type || ''}
                          required
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
                          />
                          <Input
                              name="item_quantity"
                              type="number"
                              min="1"
                              value={item.item_quantity}
                              onChange={(e) => handleInputChange(e, index)}
                              placeholder="Item Quantity"
                              required
                          />
                          <Input
                              name="item_code"
                              value={item.item_code}
                              onChange={(e) => handleInputChange(e, index)}
                              placeholder="Item code"
                          />
                          <Input
                              name="unit_of_measurement"
                              value={item.unit_of_measurement}
                              onChange={(e) => handleInputChange(e, index)}
                              placeholder="Unit of measurement"
                          />
                          <div className="flex gap-2">
                            <Input
                                name="description"
                                value={item.description}
                                onChange={(e) => handleInputChange(e, index)}
                                placeholder="Description"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => removeItem(index)}
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
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <style jsx global>{`
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

          /* For Firefox */
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