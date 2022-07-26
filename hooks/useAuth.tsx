import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User,
} from "firebase/auth";
import { useRouter } from "next/router";
import React, { createContext, useContext, useMemo } from "react";
import { useState, useEffect } from "react";
import { auth } from "../firebase";

interface IAuth {
	user: User | null;
	signUp: (email: string, password: string) => Promise<void>;
	logIn: (email: string, password: string) => Promise<void>;
	logOut: () => Promise<void>;
	error: string | null;
	loading: boolean;
}

//the Context that will be used throughout the application with default values inserted
const AuthContext = createContext<IAuth>({
	user: null,
	signUp: async () => {},
	logIn: async () => {},
	logOut: async () => {},
	error: null,
	loading: false,
});

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState(null);
	const [initialLoading, setInitialLoading] = useState(true);
	const router = useRouter();

	//if any of the *auth* changes (sign in, sign out, etc), it will check if user if logged in or not. If not, redirect to '/login' screen
	useEffect(
		() =>
			onAuthStateChanged(auth, (user) => {
				if (user) {
					//Logged in
					setUser(user);
					setLoading(false);
				} else {
					//NOT logged in
					setUser(null);
					setLoading(true);
					router.push("/login");
				}

				setInitialLoading(false);
			}),
		[auth]
	);

	const signUp = async (email: string, password: string) => {
		setLoading(true);
		// todo: Link to sign up pagel. Maybe add <Link> to the button in '/login' to go to '/signup'?
		await createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setUser(userCredential.user);
				router.push("/");
			})
			.catch((e) => alert(e.message)) //todo: change from alert to pop up - better UI
			.finally(() => setLoading(false));
	};

	const logIn = async (email: string, password: string) => {
		setLoading(true);

		await signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setUser(userCredential.user);
				router.push("/");
			})
			.catch((e) => alert(e.message)) //todo: change from alert to pop up - better UI
			.finally(() => setLoading(false));
	};

	const logOut = async () => {
		setLoading(true);
		signOut(auth)
			.then(() => {
				setUser(null);
			})
			.catch((error) => alert(error.message)) //todo: change from alert to pop up - better UI
			.finally(() => setLoading(false));
	};

	const memoedValue = useMemo(
		() => ({
			user,
			signUp,
			logIn,
			logOut,
			loading,
			error,
		}),
		[user, loading, error]
	);

	return (
		<AuthContext.Provider value={memoedValue}>
			{!initialLoading && children}
		</AuthContext.Provider>
	);
}

export default function useAuth() {
	return useContext(AuthContext);
}

//P.S.
//useAuth.tsx is used to manage user info and credentials throughout the use of the app
//e.g. signing in, signing out, signing up

//to do this, wrap the entire app with <AuthContext.Provider>
//the values that are stored in the Provider uses useMemo(), so it only reloads when the dependency changes
