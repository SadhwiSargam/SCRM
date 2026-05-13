import { useEffect, useState } from "react";

function App() {
  const API_BASE = "http://localhost:5000";
  const [users, setUsers] = useState([]);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "user"
  });
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token ? { token, role } : null;
  });
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage("Could not fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setAuth({ token: data.token, role: data.role });
      setMessage("Login successful");
      setLogin({ username: "", password: "" });
    } catch (error) {
      console.error(error);
      setMessage("Login error");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const text = await res.text();
      if (!res.ok) {
        setMessage(text || "Could not add user");
        return;
      }
      setMessage("User added successfully");
      setNewUser({ name: "", username: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage("Add user error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuth(null);
    setMessage("Logged out");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>User Management (Backend Connected)</h1>

      <p>
        Auth status:{" "}
        <b>{auth ? `Logged in (${auth.role})` : "Not logged in"}</b>
      </p>
      {auth && <button onClick={handleLogout}>Logout</button>}

      <hr />

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={login.username}
          onChange={(e) => setLogin({ ...login, username: e.target.value })}
        />
        {" "}
        <input
          type="password"
          placeholder="Password"
          value={login.password}
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />
        {" "}
        <button type="submit">Login</button>
      </form>

      <hr />

      <h2>Add User</h2>
      <form onSubmit={handleAddUser}>
        <input
          placeholder="Full Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        {" "}
        <input
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        {" "}
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        {" "}
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        {" "}
        <button type="submit">Add User</button>
      </form>

      <hr />

      <h2>Users</h2>
      <button onClick={fetchUsers}>Refresh Users</button>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>
            {user.name} | {user.username} | {user.role}
          </li>
        ))}
      </ul>

      {message && <p><b>{message}</b></p>}
    </div>
  );
}

export default App;