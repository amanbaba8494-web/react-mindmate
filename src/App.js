import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
	const [user, setUser] = useState(null);

	const handleLogin = (data) => {
		setUser(data);
	};

	const handleLogout = () => {
		setUser(null);
	};

	return (
		<div className="App">
			{user ? (
				<Dashboard userName={user.studentName} onLogout={handleLogout} />
			) : (
				<Login onLogin={handleLogin} />
			)}
		</div>
	);
}

export default App;