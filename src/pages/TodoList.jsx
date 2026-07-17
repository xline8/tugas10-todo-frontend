import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  Loader2,
  Trash2,
  RefreshCw,
  Calendar,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];

function TodoList() {
  // --- Data & global fetch state ---
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter state ---
  const [filter, setFilter] = useState('all'); // all | active | completed

  // --- Add form state ---
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // --- Per-item mutation state (toggle / delete) ---
  const [busyId, setBusyId] = useState(null); // id yang sedang diproses
  const [actionError, setActionError] = useState(null);

  // --- Ambil semua todo dari API (GET) ---
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/v1/todos');
      setTodos(response.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data todo');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // --- Tambah todo (POST) ---
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validasi sisi client (sesuai DTO backend)
    const title = form.title.trim();
    if (!title) {
      setFormError('Judul todo wajib diisi.');
      return;
    }
    if (title.length > 100) {
      setFormError('Judul maksimal 100 karakter.');
      return;
    }
    if (!PRIORITIES.includes(form.priority)) {
      setFormError('Prioritas harus low, medium, atau high.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        priority: form.priority,
        description: form.description.trim() || undefined,
        dueDate: form.dueDate || undefined,
      };
      const response = await api.post('/api/v1/todos', payload);
      setTodos((prev) => [response.data, ...prev]);
      setForm({ title: '', description: '', priority: 'low', dueDate: '' });
      setFormSuccess('Todo berhasil ditambahkan');
    } catch (err) {
      console.error('Error adding todo:', err);
      if (err.response?.status === 400) {
        setFormError(err.response?.data?.message || 'Data tidak valid.');
      } else {
        setFormError(err.response?.data?.message || 'Gagal menambahkan todo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Toggle completed (PUT) ---
  const handleToggle = async (todo) => {
    setActionError(null);
    setBusyId(todo.id);
    try {
      const response = await api.put(`/api/v1/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? response.data : t))
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setActionError(err.response?.data?.message || 'Gagal mengubah status todo.');
    } finally {
      setBusyId(null);
    }
  };

  // --- Hapus todo (DELETE) ---
  const handleDelete = async (todo) => {
    if (!window.confirm(`Hapus todo "${todo.title}"?`)) return;
    setActionError(null);
    setBusyId(todo.id);
    try {
      await api.delete(`/api/v1/todos/${todo.id}`);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setActionError(err.response?.data?.message || 'Gagal menghapus todo.');
    } finally {
      setBusyId(null);
    }
  };

  // --- Filtering (client side) ---
  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos]
  );

  // --- Loading state (GET awal) ---
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading todos...</p>
      </div>
    );
  }

  // --- Error state (GET gagal) ---
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={28} /> Error
        </h2>
        <p>{error}</p>
        <button onClick={fetchTodos} style={styles.retryButton}>
          <RotateCw size={18} /> Coba Lagi
        </button>
      </div>
    );
  }

  // --- Success state ---
  return (
    <div style={styles.container}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ListTodo size={28} /> Daftar Todo
      </h1>

      {/* Pesan aksi (sukses / error) */}
      {formSuccess && (
        <div style={styles.successBox}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {formSuccess}
        </div>
      )}
      {actionError && (
        <div style={styles.actionErrorBox}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} /> {actionError}
        </div>
      )}

      {/* Form tambah todo (POST) */}
      <form onSubmit={handleAdd} style={styles.form}>
        <input
          type="text"
          placeholder="Judul todo..."
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            setFormSuccess(null);
          }}
          style={styles.input}
        />
        <textarea
          placeholder="Deskripsi (opsional)..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ ...styles.input, height: '60px', resize: 'vertical' }}
        />
        <div style={styles.formRow}>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            style={styles.input}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            style={styles.input}
          />
          <button type="submit" disabled={submitting} style={styles.addButton}>
            {submitting ? (
              <span style={styles.btnInner}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...
              </span>
            ) : (
              <span style={styles.btnInner}>
                <Plus size={16} /> Tambah
              </span>
            )}
          </button>
        </div>
        {formError && (
          <p style={styles.formError}>
            <AlertTriangle size={16} /> {formError}
          </p>
        )}
      </form>

      {/* Filter */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('all')}
          style={filter === 'all' ? styles.filterActive : styles.filterBtn}
        >
          Semua ({counts.all})
        </button>
        <button
          onClick={() => setFilter('active')}
          style={filter === 'active' ? styles.filterActive : styles.filterBtn}
        >
          Aktif ({counts.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={filter === 'completed' ? styles.filterActive : styles.filterBtn}
        >
          Selesai ({counts.completed})
        </button>
        <button onClick={fetchTodos} style={styles.refreshButton}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* List todo */}
      {filteredTodos.length === 0 ? (
        <p style={styles.noResults}>Tidak ada todo pada filter ini.</p>
      ) : (
        <ul style={styles.list}>
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              style={{
                ...styles.item,
                ...(todo.completed ? styles.itemDone : {}),
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                disabled={busyId === todo.id}
                onChange={() => handleToggle(todo)}
                style={styles.checkbox}
              />
              <div style={styles.itemBody}>
                <span
                  style={{
                    ...styles.itemTitle,
                    ...(todo.completed ? styles.titleDone : {}),
                  }}
                >
                  {todo.title}
                </span>
                {todo.description && (
                  <p style={styles.itemDesc}>{todo.description}</p>
                )}
                <div style={styles.itemMeta}>
                  <span style={styles.badge(todo.priority)}>
                    {todo.priority.toUpperCase()}
                  </span>
                  {todo.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {todo.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(todo)}
                disabled={busyId === todo.id}
                style={styles.deleteButton}
              >
                {busyId === todo.id ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// CSS
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: { textAlign: 'center', padding: '40px' },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  formRow: { display: 'flex', gap: '10px' },
  input: {
    flex: 1,
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  btnInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
  },
  formError: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#dc3545',
    marginTop: '8px',
    fontSize: '14px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  actionErrorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 14px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    background: 'white',
    cursor: 'pointer',
  },
  filterActive: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '20px',
    background: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '20px',
    background: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '14px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '12px',
  },
  itemDone: { opacity: 0.6 },
  checkbox: { width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: '18px', fontWeight: 'bold' },
  titleDone: { textDecoration: 'line-through', color: '#888' },
  itemDesc: { margin: '4px 0', color: '#555' },
  itemMeta: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
    fontSize: '12px',
    alignItems: 'center',
  },
  badge: (priority) => {
    const colors = {
      low: { bg: '#d4edda', color: '#155724' },
      medium: { bg: '#fff3cd', color: '#856404' },
      high: { bg: '#f8d7da', color: '#721c24' },
    };
    const c = colors[priority] || colors.low;
    return {
      backgroundColor: c.bg,
      color: c.color,
      padding: '2px 10px',
      borderRadius: '20px',
      fontWeight: 'bold',
    };
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  noResults: { textAlign: 'center', padding: '40px', color: '#888' },
};

// Inject keyframes (sama seperti praktikum)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  body { background: #f0f2f5; margin: 0; }
`;
document.head.appendChild(styleSheet);

export default TodoList;
