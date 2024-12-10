import axios from 'axios';
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
} from "../../components/ui/alert-dialog";

// Inside your component:
const navigate = useNavigate();

const handleDelete = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    await axios.delete(`http://localhost:8000/api/purchase-requests/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Refresh the page or update the list
    window.location.reload(); // or use a state update method if you have one
  } catch (error) {
    console.error('Error deleting purchase request:', error);
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate('/login');
    } else {
      alert(error.response?.data?.detail || 'Failed to delete purchase request');
    }
  }
};