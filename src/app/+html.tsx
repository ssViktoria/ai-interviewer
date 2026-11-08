import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="uk">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <ScrollViewStyleReset />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              html, body, #root { height: 100%; margin: 0; overflow: hidden; background: #0F172A; }
              #root { display: flex; flex-direction: column; }
            `,
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}