"use client";
// import "./globals.css";
import "./styles.css";
import { Provider } from "react-redux";
import store from "./store/configureStore";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
