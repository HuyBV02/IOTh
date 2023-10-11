import './App.css';
import Login from './pages/Login';
import useToken from './hooks/useToken';
import Layout from './layouts/Layout';

function App() {
    const { token, setToken } = useToken();

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <div className="App">
            <Layout setToken={setToken}/>
        </div>
    );
}

export default App;
