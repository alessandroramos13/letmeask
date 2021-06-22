import { createContext, useContext, useState, useEffect } from "react";

import { firebase, auth } from "services/firebase";

interface User {
	id: string;
	name: string;
	avatar: string;
}

interface AuthContextType {
	user?: User;
	signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider: React.FC = ({ children }) => {
	const [user, setUser] = useState<User>();

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const unsubscribe = auth.onAuthStateChanged(user => {
			if (user) {
				const { displayName, photoURL, uid } = user;

				if (!displayName || !photoURL) {
					throw new Error("Missing information from Google Account");
				}

				setUser({
					id: uid,
					name: displayName,
					avatar: photoURL,
				});
			}
		});

		return () => unsubscribe();
	}, []);

	const signInWithGoogle = async () => {
		const provider = new firebase.auth.GoogleAuthProvider();

		const result = await auth.signInWithPopup(provider);

		if (result.user) {
			const { displayName, photoURL, uid } = result.user;

			if (!displayName || !photoURL) {
				throw new Error("Missing information from Google Account");
			}

			setUser({
				id: uid,
				name: displayName,
				avatar: photoURL,
			});
		}
	};

	return (
		<AuthContext.Provider value={{ user, signInWithGoogle }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) throw new Error("useAuth must be used within a AuthProvider");

	return context;
};