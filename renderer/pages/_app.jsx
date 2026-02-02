import Head from "next/head";
import React from "react";

// 🔹 MUI (keep for future use)
import { AppCacheProvider } from "@mui/material-nextjs/v14-pagesRouter";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import muiTheme from "../lib/theme";

// 🔹 NextUI (current UI)
import { NextUIProvider, createTheme } from "@nextui-org/react";

// 🔹 App providers
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { CompoundContextProvider } from "../context/compoundContext";
import Layout from "../layout/layout";
import store from "../redux/store";

// 🔹 Global styles
import "../styles/globals.css";
import "../styles/baskets.css";
import "../styles/tabulator.css";
import "../styles/options.css";
import "../styles/loader.css";
import "../styles/membershipScreen.css";
import "../styles/multipleModifyOrder.css";
import "../styles/customTooltip.css";
import "../styles/settings.css";
import "../styles/menuNav.css";
import "../styles/tradeExcel.css";
import "../styles/accordian.css";

// 🔹 NextUI theme
const nextuiTheme = createTheme({
  type: "light",
  theme: {
    colors: {
      primary: "linear-gradient(180deg, #3CC6F2 15.62%, #4779BD 100%)",
      gradient: "linear-gradient(180deg, #3CC6F2 15.62%, #4779BD 100%)",
    },
  },
});

export default function MyApp({ Component, pageProps, ...props }) {
  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      {/* MUI layer */}
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />

        {/* NextUI layer */}
        <NextUIProvider theme={nextuiTheme}>
          <CompoundContextProvider>
            <ToastContainer
              position="top-right"
              style={{ marginTop: "50px" }}
              autoClose={3500}
              pauseOnHover
              draggable
              theme="light"
            />

            <Provider store={store}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </Provider>
          </CompoundContextProvider>
        </NextUIProvider>
      </MuiThemeProvider>
    </AppCacheProvider>
  );
}
