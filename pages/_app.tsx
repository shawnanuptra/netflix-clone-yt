import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../hooks/useAuth";
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<RecoilRoot>
			{/* Provider to share user state/data */}
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</RecoilRoot>
	);
}

export default MyApp;
