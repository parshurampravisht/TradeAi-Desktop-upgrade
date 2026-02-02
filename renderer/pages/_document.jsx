import React from "react";
import {
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

// 🔹 MUI (required for Electron 34 + SSR)
import {
  DocumentHeadTags,
  documentGetInitialProps,
} from "@mui/material-nextjs/v14-pagesRouter";

// 🔹 NextUI
import { CssBaseline as NextUICssBaseline } from "@nextui-org/react";

// 🔹 Theme
import theme, { roboto } from "../lib/theme";

export default function MyDocument(props) {
  return (
    <Html lang="en" className={roboto?.className}>
      <Head>
        {/* MUI primary color */}
        <meta name="theme-color" content={theme.palette.primary.main} />

        {/* Favicon */}
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Emotion insertion point */}
        <meta name="emotion-insertion-point" content="" />

        {/* MUI / Emotion SSR tags */}
        <DocumentHeadTags {...props} />

        {/* NextUI styles */}
        {NextUICssBaseline.flush()}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// ✅ REQUIRED: MUI SSR integration
MyDocument.getInitialProps = async (ctx) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
