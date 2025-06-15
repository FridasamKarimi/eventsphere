const { useState, useEffect } = React;
const { BrowserRouter, Routes, Route, Link, useNavigate, useParams } = ReactRouterDOM;

const API_BASE_URL = 'http://localhost:3000/api';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const logout = () => {
    setToken('');
    setUser({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">EventSphere</Link>
          <div>
            {token ? (
              <>
                <span className="mr-4">Welcome, {user.username} ({user.role})</span>
                <Link to="/events" className="mr-4">Events</Link>
                {user.role === 'organizer' && <Link to="/create-event" className="mr-4">Create Event</Link>}
                <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mr-4">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<Register setToken={setToken} setUser={setUser} />} />
          <Route path="/events" element={<EventList token={token} user={user} />} />
          <Route path="/events/:id" element={<EventDetails token={token} user={user} />} />
          <Route path="/create-event" element={<CreateEvent token={token} user={user} />} />
          <Route path="/edit-event/:id" element={<EditEvent token={token} user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const Home = () => (
  <div className="text-center">
    <h1 className="text-3xl font-bold mb-4">Welcome to EventSphere</h1>
    <p>Manage events, register attendees, and track analytics with ease.</p>
  </div>
);

const Login = ({ setToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, { username, password });
      setToken(response.data.token);
      setUser({ username, role: response.data.role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ username, role: response.data.role }));
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
};

const Register = ({ setToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('attendee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users/register`, { username, password, email, role });
      const response = await axios.post(`${API_BASE_URL}/users/login`, { username, password });
      setToken(response.data.token);
      setUser({ username, role: response.data.role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ username, role: response.data.role }));
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
};

const EventList = ({ token, user }) => {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [page, search, category]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({ page, limit, search, category });
      const response = await axios.get(`${API_BASE_URL}/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch events');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Events</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={fetchEvents} className="bg-blue-500 text-white p-2 rounded">Filter</button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Date</th>
            <th className="p-2">Category</th>
            <th className="p-2">Price</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.id} className="border-b">
              <td className="p-2">{event.title}</td>
              <td className="p-2">{new Date(event.date).toLocaleDateString()}</td>
              <td className="p-2">{event.category}</td>
              <td className="p-2">${event.price}</td>
              <td className="p-2">
                <Link to={`/events/${event.id}`} className="text-blue-500 mr-2">View</Link>
                {user.role === 'organizer' && (
                  <Link to={`/edit-event/${event.id}`} className="text-blue-500">Edit</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page * limit >= total}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const EventDetails = ({ token, user }) => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    if (user.role === 'organizer') fetchAttendees();
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch event');
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/${id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch attendees');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE_URL}/registrations/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Registered successfully!');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this event?')) {
      try {
        await axios.delete(`${API_BASE_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/events');
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to delete event');
      }
    }
  };

  const handleDownloadAttendees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/${id}/attendees/csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download attendees');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Price:</strong> ${event.price}</p>
        <p><strong>Capacity:</strong> {event.capacity}</p>
        <p><strong>Virtual:</strong> {event.isVirtual ? 'Yes' : 'No'}</p>
        {user.role === 'attendee' && (
          <button onClick={handleRegister} className="bg-green-500 text-white p-2 rounded mt-2">
            Register
          </button>
        )}
        {user.role === 'organizer' && (
          <div className="mt-2">
            <Link to={`/edit-event/${id}`} className="bg-blue-500 text-white p-2 rounded mr-2">Edit</Link>
            <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">Delete</button>
            <button onClick={handleDownloadAttendees} className="bg-purple-500 text-white p-2 rounded ml-2">
              Download Attendees
            </button>
          </div>
        )}
      </div>
      {user.role === 'organizer' && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Attendees</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map(attendee => (
                <tr key={attendee._id} className="border-b">
                  <td className="p-2">{attendee.userId.username}</td>
                  <td className="p-2">{attendee.userId.email}</td>
                  <td className="p-2">{new Date(attendee.registeredAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CreateEvent = ({ token, user }) => {
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', capacity: '', price: '', isVirtual: false, category: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/events`, { ...form, isVirtual: form.isVirtual === 'true' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create event');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (user.role !== 'organizer') return <div>Access denied</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="isVirtual"
          value={form.isVirtual}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value={false}>In-Person</option>
          <option value={true}>Virtual</option>
        </select>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Create Event</button>
      </form>
    </div>
  );
};

const EditEvent = ({ token, user }) => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          ...response.data,
          date: new Date(response.data.date).toISOString().slice(0, 16)
        });
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to fetch event');
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/events/${id}`, { ...form, isVirtual: form.isVirtual === 'true' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update event');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (user.role !== 'organizer') return <div>Access denied</div>;
  if (!form) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="isVirtual"
          value={form.isVirtual}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value={false}>In-Person</option>
          <option value={true}>Virtual</option>
        </select>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Update Event</button>
      </form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));