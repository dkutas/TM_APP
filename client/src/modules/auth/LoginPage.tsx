import {useState} from "react";
import {useAuth} from "./useAuth.ts";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const {login} = useAuth();
    const nav = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        try {
            await login({email, password});
            nav('/app');
        } catch (e: never) {
            setErr(e?.response?.data?.message ?? 'Login failed');
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"/>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                   type="password"/>
            <button type="submit">Sign in</button>
            {err && <div role="alert">{err}</div>}
        </form>
    );
}